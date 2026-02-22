import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  const session = request.cookies.get("session")?.value;
  const expected = createHmac("sha256", process.env.SESSION_SECRET!)
    .update("authenticated")
    .digest("hex");

  if (session !== expected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/login).*)"],
};
