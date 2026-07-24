import { NextRequest, NextResponse } from "next/server";

export const ACCESS_COOKIE = "xm_access";

const PUBLIC_FILE = /\/[^/]+\.[^/]+$/;

export function isExemptPath(pathname: string): boolean {
  return pathname === "/gate" ||
    pathname === "/api/gate" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/") ||
    PUBLIC_FILE.test(pathname);
}

export async function accessToken(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function middleware(request: NextRequest) {
  const password = process.env.XMETRICS_PASSWORD;
  if (!password || isExemptPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const expectedToken = await accessToken(password);
  if (request.cookies.get(ACCESS_COOKIE)?.value === expectedToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/gate", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
