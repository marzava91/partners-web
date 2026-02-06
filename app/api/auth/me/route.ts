import { NextResponse } from "next/server";
import { envServer } from "@/shared/config";
import { cookies } from "next/headers";
import { COOKIE } from "@/modules/auth/cookies";

export async function GET() {
  const access = (await cookies()).get(COOKIE.access)?.value;
  if (!access) return NextResponse.json({ session: null }, { status: 401 });

  // Modo mock cuando no hay CORE_API_URL
  if (!envServer.CORE_API_URL) {
    try {
      const decoded = JSON.parse(Buffer.from(access, "base64").toString("utf-8"));
      const session = {
        userId: decoded.userId ?? `mock-${Date.now()}`,
        email: decoded.email ?? "user@example.com",
        role: "admin",
        tenantId: "mock-tenant",
        storeIds: ["store-1"],
        defaultStoreId: "store-1",
      };

      return NextResponse.json({ session }, { status: 200 });
    } catch (e) {
      return NextResponse.json({ session: null }, { status: 401 });
    }
  }

  const res = await fetch(`${envServer.CORE_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ session: null }, { status: 401 });

  const session = await res.json();
  return NextResponse.json({ session }, { status: 200 });
}
