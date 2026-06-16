import type { GlEquipment, GlSex } from "@prisma/client";

export type ProfilePayload = {
  login: string;
  avatarId: string;
  nickname: string | null;
  glBodyweightKg: unknown;
  glMaxSquatKg: unknown;
  glMaxBenchKg: unknown;
  glMaxDeadliftKg: unknown;
  glSex: GlSex | null;
  glEquipment: GlEquipment | null;
  profileLevel?: number;
  glPoints?: number | null;
  achievementsCatalog?: { id: string; title: string; unlocked: boolean }[];
  pinnedAchievementIds?: string[];
};

export type LbRow = {
  place: number;
  login: string;
  avatarId: string;
  nickname: string | null;
  score: number;
  profileLevel: number;
  pinnedAchievementIds?: string[];
};

export function profileNum(v: unknown): string {
  if (v == null) return "";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

export function parseOptFloat(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}
