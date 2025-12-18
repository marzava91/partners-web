import { NextResponse, type NextRequest } from "next/server";
import { COOKIE } from "@/modules/auth/cookies";

const AUTH_ROUTES = ["/login", "/select-store"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorar API, assets y rutas públicas
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isPartnerRoute = pathname.startsWith("/partner");

  // Si no es partner, no bloqueamos
  if (!isPartnerRoute) return NextResponse.next();

  const access = req.cookies.get(COOKIE.access)?.value;
  if (!access) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Requiere store seleccionado para operar en partner
  const storeId = req.cookies.get(COOKIE.store)?.value;
  if (!storeId && !isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/select-store";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
