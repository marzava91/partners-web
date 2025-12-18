export const envServer = {
  CORE_API_URL: process.env.CORE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "true") === "true",
} as const;

if (!envServer.CORE_API_URL) {
  throw new Error("Missing CORE_API_URL (or NEXT_PUBLIC_API_URL)");
}
