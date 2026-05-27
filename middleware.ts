import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";
const SESSION_VALUE = "verified";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = req.cookies.get(SESSION_COOKIE);
  if (cookie?.value === SESSION_VALUE) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  if (pathname !== "/admin") url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
