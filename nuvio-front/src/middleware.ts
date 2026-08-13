import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/admin", "/dashboard", "/tickets", "/users", "/reports", "/settings", "/portal/chamados"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isLoginPage = pathname === "/login";
  if (!isProtected && !isLoginPage) return NextResponse.next();

  const loginPath = pathname.startsWith("/admin") ? "/admin/login" : pathname.startsWith("/portal") ? "/portal/login" : "/login";

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  let payload: { tipo?: string } | null = null;

  try {
    const response = await fetch(`${API_URL}/auth/verificar`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      payload = data.usuario ?? null;
    }
  } catch {
    payload = null;
  }

  if (!payload) {
    if (isLoginPage) {
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }

    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete("token");
    return response;
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin") && payload.tipo !== "Administrador") {
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/dashboard/:path*", "/tickets/:path*", "/users/:path*", "/reports/:path*", "/settings/:path*", "/portal/chamados/:path*"],
};
