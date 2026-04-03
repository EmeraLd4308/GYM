import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteSessionInDbForCookieToken, getClearCookieOptionsForRequest, SESSION_COOKIE } from "@/lib/auth";
import { redirectUrl } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

/** Повна навігація після POST (як логін) — стабільніше на мобілці, ніж fetch + JS. */
export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  await deleteSessionInDbForCookieToken(token);
  const res = NextResponse.redirect(redirectUrl(req, "/"), 303);
  res.cookies.set(SESSION_COOKIE, "", getClearCookieOptionsForRequest(req));
  return res;
}
