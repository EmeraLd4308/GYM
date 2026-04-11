import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionRecord, getCookieOptionsForRequest, SESSION_COOKIE } from "@/lib/auth";
import { normalizeLogin } from "@/lib/login-utils";
import { rateLimitJson } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  login: z.string().trim().min(1),
});

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function POST(req: Request) {
  const limited = rateLimitJson(req, "auth-login", 40, 60_000);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Вкажіть логін." }, { status: 400, headers: noStore });
    }
    const login = normalizeLogin(parsed.data.login);
    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return NextResponse.json(
        { error: "Користувача з таким логіном не знайдено." },
        { status: 404, headers: noStore },
      );
    }
    const token = await createSessionRecord(user.id);
    const res = NextResponse.json(
      { ok: true, token, user: { id: user.id, login: user.login } },
      { headers: noStore },
    );
    res.cookies.set(SESSION_COOKIE, token, getCookieOptionsForRequest(req));
    return res;
  } catch {
    return NextResponse.json({ error: "Помилка сервера." }, { status: 500, headers: noStore });
  }
}
