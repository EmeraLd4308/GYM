import { prisma } from "./prisma";

export function normalizeLogin(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function suggestAvailableLogins(base: string): Promise<string[]> {
  const candidates = [
    `${base}_2`,
    `${base}_gym`,
    `${base}_${Math.floor(100 + Math.random() * 900)}`,
  ];
  const out: string[] = [];
  for (const c of candidates) {
    const taken = await prisma.user.findUnique({ where: { login: c } });
    if (!taken) out.push(c);
    if (out.length >= 3) break;
  }
  return out;
}
