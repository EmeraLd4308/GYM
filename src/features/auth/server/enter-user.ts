import { prisma } from "@/shared/lib/prisma";
import { normalizeLogin } from "@/shared/lib/login-utils";
import { withDbRetry } from "@/shared/lib/db-errors";

export type EnterMode = "find-or-create" | "login-only" | "register-only";

export type EnterUserSuccess = { ok: true; userId: string; login: string };
export type EnterUserFailure = { ok: false; error: string; httpStatus?: number };
export type EnterUserResult = EnterUserSuccess | EnterUserFailure;

const LOGIN_PATTERN = /^[\p{L}0-9_]+$/u;

export function parseLoginField(raw: unknown): { login: string } | EnterUserFailure {
  const loginStr = typeof raw === "string" ? raw.trim() : "";
  if (!loginStr) {
    return { ok: false, error: "Введіть нік", httpStatus: 400 };
  }
  if (loginStr.length > 40) {
    return { ok: false, error: "Занадто довгий нік (макс. 40).", httpStatus: 400 };
  }
  return { login: normalizeLogin(loginStr) };
}

export async function enterUser(
  login: string,
  mode: EnterMode,
): Promise<EnterUserResult> {
  let user = await withDbRetry(() => prisma.user.findUnique({ where: { login } }));

  if (user) {
    if (mode === "register-only") {
      return { ok: false, error: "Такий логін уже зайнятий.", httpStatus: 409 };
    }
    return { ok: true, userId: user.id, login: user.login };
  }

  if (mode === "login-only") {
    return { ok: false, error: "Користувача з таким логіном не знайдено.", httpStatus: 404 };
  }

  if (login.length < 2) {
    return { ok: false, error: "Мінімум 2 символи для нового ніка.", httpStatus: 400 };
  }
  if (!LOGIN_PATTERN.test(login)) {
    return { ok: false, error: "Лише літери, цифри та підкреслення.", httpStatus: 400 };
  }

  user = await withDbRetry(() => prisma.user.create({ data: { login } }));
  return { ok: true, userId: user.id, login: user.login };
}
