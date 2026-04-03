import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionRecord, getCookieOptionsForRequest, SESSION_COOKIE } from "@/lib/auth";
import { normalizeLogin, suggestAvailableLogins } from "@/lib/login-utils";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  login: z.string().trim().min(2).max(40),
});

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректний логін." }, { status: 400, headers: noStore });
    }
    const login = normalizeLogin(parsed.data.login);
    if (!/^[\p{L}0-9_]+$/u.test(login)) {
      return NextResponse.json(
        { error: "Лише літери, цифри та підкреслення." },
        { status: 400, headers: noStore },
      );
    }
    const existing = await prisma.user.findUnique({ where: { login } });
    if (existing) {
      const suggestions = await suggestAvailableLogins(login);
      return NextResponse.json(
        { error: "Такий логін уже зайнятий.", suggestions },
        { status: 409, headers: noStore },
      );
    }
    const user = await prisma.user.create({ data: { login } });
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
