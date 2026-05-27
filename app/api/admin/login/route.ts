import { NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";
const SESSION_VALUE = "verified";
const EIGHT_HOURS = 60 * 60 * 8;

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: "admin_pin_not_configured" },
      { status: 500 },
    );
  }

  let pin: string | undefined;
  try {
    const body = (await req.json()) as { pin?: string };
    pin = body.pin;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (!pin || pin !== expected) {
    return NextResponse.json({ error: "invalid_pin" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: EIGHT_HOURS,
  });
  return res;
}
