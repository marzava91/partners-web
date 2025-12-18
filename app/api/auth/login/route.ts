import { NextResponse } from "next/server";
import { z } from "zod";

import { envServer } from "@/shared/config";
import { COOKIE, cookieOptions } from "@/modules/auth/cookies";
import type { LoginResponse } from "@/modules/auth/types";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const upstream = await fetch(`${envServer.CORE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (upstream.status === 401) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  if (upstream.status === 429) {
    return NextResponse.json({ message: "Too many attempts" }, { status: 429 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }

  const data = (await upstream.json()) as LoginResponse;

  const res = NextResponse.json({ session: data.session }, { status: 200 });
  res.cookies.set(COOKIE.access, data.accessToken, cookieOptions.access);

  if (data.refreshToken) {
    res.cookies.set(COOKIE.refresh, data.refreshToken, cookieOptions.refresh);
  }

  if (data.session.defaultStoreId) {
    res.cookies.set(COOKIE.store, data.session.defaultStoreId, cookieOptions.store);
  }

  return res;
}
