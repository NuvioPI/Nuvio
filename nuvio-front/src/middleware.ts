import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Apenas interceptar rotas do admin
  if (path.startsWith("/admin")) {
    // Obter o token dos cookies
    const token = request.cookies.get("nuvio_admin_token")?.value;
    
    // Rota de login
    if (path === "/admin/login") {
      if (token) {
        // Se já tem token e ele for válido, redireciona pro dashboard
        const payload = await verifyJWT(token);
        if (payload) {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return NextResponse.next();
    }
    
    // Outras rotas protegidas do admin (ex: /admin/dashboard)
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    // Verificar se o token é válido
    const payload = await verifyJWT(token);
    
    if (!payload) {
      // Token inválido ou expirado
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("nuvio_admin_token"); // Limpa o cookie inválido
      return response;
    }
  }

  return NextResponse.next();
}

// Configura em quais caminhos o middleware vai rodar
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
