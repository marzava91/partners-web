import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE, cookieOptions } from "@/modules/auth/cookies";

const BodySchema = z.object({
  storeId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(COOKIE.store, parsed.data.storeId, cookieOptions.store);
  return res;
}
