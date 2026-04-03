import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, createSessionRecord, getCookieOptionsForRequest } from "@/lib/auth";
import { normalizeLogin } from "@/lib/login-utils";
import { redirectUrl } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent("Некоректна форма")), 303);
  }
  const raw = formData.get("login");
  const loginStr = typeof raw === "string" ? raw.trim() : "";
  if (!loginStr || loginStr.length < 2) {
    return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent("Логін занадто короткий")), 303);
  }
  if (loginStr.length > 40) {
    return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent("Логін занадто довгий")), 303);
  }
  const login = normalizeLogin(loginStr);
  if (!/^[\p{L}0-9_]+$/u.test(login)) {
    return NextResponse.redirect(
      redirectUrl(req, "/?err=" + encodeURIComponent("Лише літери, цифри та підкреслення.")),
      303,
    );
  }
  const existing = await prisma.user.findUnique({ where: { login } });
  if (existing) {
    return NextResponse.redirect(
      redirectUrl(req, "/?err=" + encodeURIComponent("Такий логін уже зайнятий. Спробуй інший.")),
      303,
    );
  }
  const user = await prisma.user.create({ data: { login } });
  const token = await createSessionRecord(user.id);
  const res = NextResponse.redirect(redirectUrl(req, "/dashboard"), 303);
  res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
  return res;
}
