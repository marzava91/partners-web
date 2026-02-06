// app/api/catalog/products/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();

  const base = process.env.CORE_API_URL ?? "http://localhost:4000";
  const upstream = `${base}/v1/catalog/products?${qs}`;

  const res = await fetch(upstream, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
