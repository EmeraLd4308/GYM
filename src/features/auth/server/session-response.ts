import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionRecord,
  getCookieOptionsForRequest,
} from "@/shared/lib/auth";
import { redirectUrl } from "@/shared/lib/request-origin";
import { withDbRetry } from "@/shared/lib/db-errors";

export async function redirectWithSession(req: Request, userId: string, path = "/dashboard") {
  const token = await withDbRetry(() => createSessionRecord(userId));
  const res = NextResponse.redirect(redirectUrl(req, path), 303);
  res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
  return res;
}
