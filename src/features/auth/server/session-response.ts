import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionRecord,
  getCookieOptionsForRequest,
} from "@/shared/lib/auth";
import { redirectUrl } from "@/shared/lib/request-origin";
import { withDbRetry } from "@/shared/lib/db-errors";

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function redirectWithSession(req: Request, userId: string, path = "/dashboard") {
  const token = await withDbRetry(() => createSessionRecord(userId));
  const res = NextResponse.redirect(redirectUrl(req, path), 303);
  res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
  return res;
}

export async function jsonWithSession(
  req: Request,
  user: { id: string; login: string },
  extra?: Record<string, unknown>,
) {
  const token = await withDbRetry(() => createSessionRecord(user.id));
  const res = NextResponse.json(
    { ok: true, token, user: { id: user.id, login: user.login }, ...extra },
    { headers: noStore },
  );
  res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
  return res;
}

export function jsonAuthError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: noStore });
}
