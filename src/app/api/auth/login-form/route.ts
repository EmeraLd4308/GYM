import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, createSessionRecord, getCookieOptionsForRequest } from "@/lib/auth";
import { normalizeLogin } from "@/lib/login-utils";
import { redirectAuthFormError, redirectUrl } from "@/lib/request-origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent("Некоректна форма")), 303);
    }
    const raw = formData.get("login");
    const loginStr = typeof raw === "string" ? raw.trim() : "";
    if (!loginStr) {
      return NextResponse.redirect(redirectUrl(req, "/?err=" + encodeURIComponent("Введіть логін")), 303);
    }
    const login = normalizeLogin(loginStr);
    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return NextResponse.redirect(
        redirectUrl(req, "/?err=" + encodeURIComponent("Користувача з таким логіном не знайдено.")),
        303,
      );
    }
    const token = await createSessionRecord(user.id);
    const res = NextResponse.redirect(redirectUrl(req, "/dashboard"), 303);
    res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
    return res;
  } catch (e) {
    console.error("[login-form]", e);
    return redirectAuthFormError(
      req,
      "Помилка сервера. Перевір у Vercel змінну DATABASE_URL і що збірка виконує prisma migrate deploy.",
    );
  }
}
