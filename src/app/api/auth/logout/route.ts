import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  deleteSessionInDbForCookieToken,
  getClearCookieOptionsForRequest,
  SESSION_COOKIE,
} from "@/lib/auth";
import { redirectUrl } from "@/lib/request-origin";
import { takeRateToken, clientIpFromRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = takeRateToken(`auth-logout:${clientIpFromRequest(req)}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.redirect(
      redirectUrl(req, "/?err=" + encodeURIComponent("Забагато запитів. Спробуй за хвилину.")),
      303,
    );
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  await deleteSessionInDbForCookieToken(token);
  const res = NextResponse.redirect(redirectUrl(req, "/"), 303);
  res.cookies.set(SESSION_COOKIE, "", getClearCookieOptionsForRequest(req));
  return res;
}
