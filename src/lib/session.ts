import { cookies } from "next/headers";
import { createHmac } from "crypto";

const SECRET = () => process.env.SESSION_SECRET!;

function sign(value: string) {
  return createHmac("sha256", SECRET()).update(value).digest("hex");
}

export function setSession() {
  const token = sign("authenticated");
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearSession() {
  cookies().delete("session");
}

export function isAuthenticated() {
  const token = cookies().get("session")?.value;
  if (!token) return false;
  return token === sign("authenticated");
}
