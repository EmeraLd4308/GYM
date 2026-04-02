import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "gym_session";
const SESSION_SECONDS = 4 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });
  const store = await cookies();
  // httpOnly: false — сумісність із моб. Safari/WebView (часто ріже httpOnly після XHR + редірект).
  // Токен довгий випадковий; клієнт додатково ставить cookie через persistSessionCookie.
  store.set(SESSION_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  store.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await prisma.session.deleteMany({ where: { tokenHash } });
    }
    store.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
    return null;
  }
  return session.user;
}
