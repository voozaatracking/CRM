import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    setSession();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
