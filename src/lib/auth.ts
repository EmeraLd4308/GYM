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

export function isRequestHttps(req: Request): boolean {
  const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded) return forwarded === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function getCookieOptionsForRequest(req: Request) {
  return {
    httpOnly: false,
    secure: isRequestHttps(req),
    sameSite: "lax" as const,
    maxAge: SESSION_SECONDS,
    path: "/",
  };
}

export function getClearCookieOptionsForRequest(req: Request) {
  return {
    httpOnly: false,
    secure: isRequestHttps(req),
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}

export async function createSessionRecord(userId: string): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });
  return token;
}

export async function deleteSessionInDbForCookieToken(token: string | undefined): Promise<void> {
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

    return null;
  }
  return session.user;
}
