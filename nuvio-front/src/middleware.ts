import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";

const PROTECTED_PATHS = ["/admin", "/dashboard", "/tickets", "/users", "/settings"];
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  if (pathname.startsWith("/admin") && payload.tipo !== "Administrador") {
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/tickets/:path*", "/users/:path*", "/settings/:path*"],
};
