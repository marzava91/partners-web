import { NextResponse, type NextRequest } from "next/server";
import { COOKIE } from "@/modules/auth/cookies";

/**
 * Rutas públicas / de autenticación.
 * - login: pantalla de ingreso
 * - select-store: selección de tienda/sede (si aplica)
 */
const AUTH_ROUTES = ["/login", "/select-store"] as const;

/**
 * Rutas dentro de /partner que NO deberían exigir store seleccionado.
 * Útil si quieres que el dashboard cargue y desde ahí obligues a elegir store,
 * o si /partner/dashboard es un "landing" del partner.
 *
 * Si prefieres exigir store para TODO /partner, deja esto vacío.
 */
const PARTNER_ROUTES_WITHOUT_STORE = ["/partner/dashboard"] as const;

function isStaticOrPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".map")
  );
}

function withNextParam(req: NextRequest, redirectTo: string) {
  /**
   * Construye un redirect preservando el destino original (pathname + query),
   * para que luego de loguearse vuelva al lugar correcto.
   */
  const url = req.nextUrl.clone();
  const originalPath = req.nextUrl.pathname;
  const originalQuery = req.nextUrl.search; // incluye '?' si existe

  url.pathname = redirectTo;
  url.searchParams.set("next", `${originalPath}${originalQuery}`);

  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Ignorar API/Next internals/assets
  if (isStaticOrPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isPartnerRoute = pathname.startsWith("/partner");

  const access = req.cookies.get(COOKIE.access)?.value;
  const storeId = req.cookies.get(COOKIE.store)?.value;

  // 2) Si el usuario YA está logueado y entra a /login o /select-store,
  // lo mandamos al dashboard (o a donde definas como "home" del partner).
  if (isAuthRoute && access) {
    const url = req.nextUrl.clone();
    url.pathname = "/partner/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3) Si no es /partner, no bloqueamos (tu misma lógica)
  if (!isPartnerRoute) {
    return NextResponse.next();
  }

  // 4) Guard principal: /partner requiere access cookie
  if (!access) {
    return withNextParam(req, "/login");
  }

  // 5) Guard de store: /partner normalmente requiere store seleccionado,
  // EXCEPTO en rutas permitidas (ej. dashboard)
  const allowWithoutStore = PARTNER_ROUTES_WITHOUT_STORE.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  if (!storeId && !allowWithoutStore) {
    return withNextParam(req, "/select-store");
  }

  return NextResponse.next();
}

/**
 * Matcher: aplica a "casi todo".
 * Nota: ya estás filtrando assets en runtime, así que está ok.
 * Si quieres performance extra, podrías reducir matcher a /partner/:path* y /login y /select-store,
 * pero lo dejo compatible con tu enfoque actual.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
