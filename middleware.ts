import { NextRequest, NextResponse } from "next/server";

/**
 * Checagem rápida (só olha se o cookie existe, não valida a assinatura —
 * isso roda no Edge Runtime, que não suporta o Firebase Admin SDK). A
 * validação de verdade acontece no servidor em cada página protegida
 * (lib/admin-session.ts e lib/family-session.ts) — isso aqui é só uma
 * melhoria de UX pra redirecionar rápido quem obviamente não está logado.
 *
 * Dois cookies completamente separados: um admin logado não passa pela
 * checagem de /familia, e um responsável logado não passa pela de /admin.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const hasSession = request.cookies.has("__admin_session");
    if (!isLoginPage && !hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/familia")) {
    const isLoginPage = pathname === "/familia/login";
    const hasSession = request.cookies.has("__family_session");
    if (!isLoginPage && !hasSession) {
      return NextResponse.redirect(new URL("/familia/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/familia/:path*"],
};
