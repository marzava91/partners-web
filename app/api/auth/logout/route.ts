import { NextResponse } from "next/server";
import { COOKIE, cookieOptions } from "@/modules/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });

  // Borrar cookies
  res.cookies.set(COOKIE.access, "", { ...cookieOptions.access, maxAge: 0 });
  res.cookies.set(COOKIE.refresh, "", { ...cookieOptions.refresh, maxAge: 0 });
  res.cookies.set(COOKIE.store, "", { ...cookieOptions.store, maxAge: 0 });

  return res;
}
