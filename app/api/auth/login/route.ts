import { NextResponse } from "next/server";
import { z } from "zod";

import { envServer } from "@/shared/config";
import { COOKIE, cookieOptions } from "@/modules/auth/cookies";
import type { LoginResponse } from "@/modules/auth/types";

const BodySchema = z.object({
  identifierType: z.enum(["email", "phone"]),
  identifier: z.string().min(1),
  password: z.string().min(1),
});

/** Credenciales MOCK (solo para desarrollo cuando CORE_API_URL no existe) */
const MOCK = {
  email: "partner@mijimarkets.com",
  phone: "+51999999999",
  password: "Miji#12345",
};

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const identifier = parsed.data.identifier.trim();
  const password = parsed.data.password;

  // Si no existe CORE_API_URL, usamos modo "mock" pero con credenciales fijas
  if (!envServer.CORE_API_URL) {
    const isEmail = parsed.data.identifierType === "email";
    const ok =
      (isEmail &&
        identifier.toLowerCase() === MOCK.email.toLowerCase() &&
        password === MOCK.password) ||
      (!isEmail &&
        identifier.replace(/\s/g, "") === MOCK.phone &&
        password === MOCK.password);

    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const session: LoginResponse["session"] = {
      userId: "mock-user-1",
      email: isEmail ? identifier : MOCK.email, // mantén email en sesión para UI/guards
      role: "admin",
      tenantId: "mock-tenant",
      storeIds: ["store-1"],
      defaultStoreId: "store-1",
    };

    // Token mock: suficiente para guards básicos (luego lo reemplazas por JWT real)
    const accessToken = Buffer.from(
      JSON.stringify({ userId: session.userId, email: session.email, role: session.role })
    ).toString("base64");

    const data: LoginResponse = {
      accessToken,
      refreshToken: "mock-refresh",
      session,
    };

    const res = NextResponse.json({ session: data.session }, { status: 200 });
    res.cookies.set(COOKIE.access, data.accessToken, cookieOptions.access);

    if (data.refreshToken) {
      res.cookies.set(COOKIE.refresh, data.refreshToken, cookieOptions.refresh);
    }

    res.cookies.set(
      COOKIE.store,
      data.session.defaultStoreId ?? data.session.storeIds[0],
      cookieOptions.store
    );

    return res;
  }

  // Por defecto, proxy al Core API
  const upstreamBody =
    parsed.data.identifierType === "email"
      ? { email: parsed.data.identifier, password: parsed.data.password }
      : { phone: parsed.data.identifier, password: parsed.data.password };

  const upstream = await fetch(`${envServer.CORE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(upstreamBody),
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
