export const envServer = {
  // Solo Core API. Si no existe, mock mode.
  CORE_API_URL: process.env.CORE_API_URL ?? "",

  // Si quieres tener un API público para el cliente, mantenlo separado
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "false") === "true",
} as const;