export const CORE_API_URL =
  process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:4000";

export async function coreGet<T>(
  path: string,
  params?: Record<string, string | number | null | undefined>,
  opts?: { signal?: AbortSignal },
) {
  const url = new URL(`${CORE_API_URL}${path}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");

    // Error con status para que retry() pueda decidir
    const err: any = new Error(`GET ${path} -> ${res.status} ${res.statusText} ${text}`);
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as T;
}