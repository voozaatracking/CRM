import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

const COOKIE_NAME = 'crm_session';

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET!;
  const sig = crypto.createHmac('sha256', secret).update(value).digest('hex');
  return value + '.' + sig;
}

function verify(token: string): string | null {
  const secret = process.env.SESSION_SECRET!;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret).update(value).digest('hex');
  if (sig !== expected) return null;
  return value;
}

export function createSession() {
  const token = sign('authenticated');
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verify(token) === 'authenticated';
}

export function requireAuth() {
  if (!isAuthenticated()) redirect('/login');
}
