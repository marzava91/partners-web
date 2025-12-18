import { envServer } from "@/shared/config";


export const COOKIE = {
  access: "access_token",
  refresh: "refresh_token",
  store: "store_id",
} as const;

export const cookieOptions = {
  access: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: envServer.COOKIE_SECURE,
    path: "/",
    domain: envServer.COOKIE_DOMAIN,
  },
  refresh: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: envServer.COOKIE_SECURE,
    path: "/",
    domain: envServer.COOKIE_DOMAIN,
  },
  store: {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: envServer.COOKIE_SECURE,
    path: "/",
    domain: envServer.COOKIE_DOMAIN,
  },
} as const;
