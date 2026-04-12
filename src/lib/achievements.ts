import type { GlEquipment, GlSex } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ipfGlProfilePreview } from "@/lib/ipf-gl";

const M_BENCH = [100, 140, 180, 200, 220] as const;
const F_BENCH = [65, 95, 120, 135, 150] as const;
const M_DL = [200, 250, 300] as const;
const F_DL = [130, 165, 195] as const;
const M_SQ = [160, 200, 250] as const;
const F_SQ = [105, 130, 165] as const;

const M_SUPER_BENCH = 220;
const M_SUPER_DL = 300;
const M_SUPER_SQ = 250;
const F_SUPER_BENCH = 150;
const F_SUPER_DL = 195;
const F_SUPER_SQ = 165;

export type ProfileForAchievements = {
  glBodyweightKg: number | null;
  glMaxSquatKg: number | null;
  glMaxBenchKg: number | null;
  glMaxDeadliftKg: number | null;
  glSex: GlSex | null;
  glEquipment: GlEquipment | null;
};

function n(v: unknown): number | null {
  if (v == null) return null;
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) && x > 0 ? x : null;
}

function addLiftBwTiers(
  prefix: "squat" | "bench" | "deadlift",
  liftKg: number,
  bw: number,
  out: Set<string>,
): void {
  if (bw <= 0 || liftKg <= 0) return;
  const r = liftKg / bw;
  if (r >= 2) out.add(`${prefix}_bw_x2`);
  if (r >= 3) out.add(`${prefix}_bw_x3`);
  if (r >= 4) out.add(`${prefix}_bw_x4`);
}

export function achievementIdsFromProfile(p: ProfileForAchievements): string[] {
  const sex = p.glSex ?? "MALE";
  const isF = sex === "FEMALE";
  const bw = n(p.glBodyweightKg);
  const sq = n(p.glMaxSquatKg) ?? 0;
  const bp = n(p.glMaxBenchKg) ?? 0;
  const dl = n(p.glMaxDeadliftKg) ?? 0;
  const out = new Set<string>();

  if (bw != null && bw > 0) {
    addLiftBwTiers("squat", sq, bw, out);
    addLiftBwTiers("bench", bp, bw, out);
    addLiftBwTiers("deadlift", dl, bw, out);

    if (sq > 0 && bp > 0 && dl > 0) {
      const total = sq + bp + dl;
      const r = total / bw;
      if (r >= 6) out.add("total_bw_x6");
      if (r >= 7) out.add("total_bw_x7");
      if (r >= 8) out.add("total_bw_x8");
      if (r >= 9) out.add("total_bw_x9");
      if (r > 9) out.add("super_total");
    }
  }

  const bTh = isF ? F_BENCH : M_BENCH;
  bTh.forEach((w, i) => {
    if (bp >= w) out.add(`bench_m${i}`);
  });
  const dTh = isF ? F_DL : M_DL;
  dTh.forEach((w, i) => {
    if (dl >= w) out.add(`dl_m${i}`);
  });
  const sTh = isF ? F_SQ : M_SQ;
  sTh.forEach((w, i) => {
    if (sq >= w) out.add(`sq_m${i}`);
  });

  const sb = isF ? F_SUPER_BENCH : M_SUPER_BENCH;
  const sd = isF ? F_SUPER_DL : M_SUPER_DL;
  const ss = isF ? F_SUPER_SQ : M_SUPER_SQ;
  if (bp > sb) out.add("super_bench");
  if (dl > sd) out.add("super_deadlift");
  if (sq > ss) out.add("super_squat");

  return [...out];
}

export const ACHIEVEMENT_ORDER: string[] = [
  "total_bw_x6",
  "total_bw_x7",
  "total_bw_x8",
  "total_bw_x9",
  "super_total",
  "squat_bw_x2",
  "squat_bw_x3",
  "squat_bw_x4",
  "bench_bw_x2",
  "bench_bw_x3",
  "bench_bw_x4",
  "deadlift_bw_x2",
  "deadlift_bw_x3",
  "deadlift_bw_x4",
  "sq_m0",
  "sq_m1",
  "sq_m2",
  "bench_m0",
  "bench_m1",
  "bench_m2",
  "bench_m3",
  "bench_m4",
  "dl_m0",
  "dl_m1",
  "dl_m2",
  "super_squat",
  "super_bench",
  "super_deadlift",
];

export function achievementTitleUk(id: string, sex: GlSex | null): string {
  const isF = sex === "FEMALE";
  const bTh = isF ? F_BENCH : M_BENCH;
  const dTh = isF ? F_DL : M_DL;
  const sTh = isF ? F_SQ : M_SQ;

  const liftBw = id.match(/^(squat|bench|deadlift)_bw_x([234])$/);
  if (liftBw) {
    const lift =
      liftBw[1] === "squat" ? "Присяд" : liftBw[1] === "bench" ? "Жим лежачи" : "Тяга";
    return `${lift} ×${liftBw[2]} ваги тіла`;
  }
  if (id.startsWith("total_bw_x")) {
    const mult = id.replace("total_bw_x", "");
    return `Сума SBD ×${mult} ваги тіла`;
  }
  if (id === "super_total") return "Супер: триборство (сума > ×9 ваги тіла)";

  if (id.startsWith("bench_m")) {
    const i = parseInt(id.slice("bench_m".length), 10);
    const w = bTh[i];
    return w != null ? `Жим ≥ ${w} кг` : id;
  }
  if (id.startsWith("dl_m")) {
    const i = parseInt(id.slice("dl_m".length), 10);
    const w = dTh[i];
    return w != null ? `Тяга ≥ ${w} кг` : id;
  }
  if (id.startsWith("sq_m")) {
    const i = parseInt(id.slice("sq_m".length), 10);
    const w = sTh[i];
    return w != null ? `Присяд ≥ ${w} кг` : id;
  }
  if (id === "super_bench") return "Супер: жим";
  if (id === "super_deadlift") return "Супер: тяга";
  if (id === "super_squat") return "Супер: присяд";
  return id;
}

export function profileGlPointsForLevel(p: ProfileForAchievements): number | null {
  const equipment = p.glEquipment ?? "CLASSIC";
  const sex = p.glSex ?? "MALE";
  const prev = ipfGlProfilePreview({
    bodyweightKg: n(p.glBodyweightKg),
    squatKg: n(p.glMaxSquatKg),
    benchKg: n(p.glMaxBenchKg),
    deadliftKg: n(p.glMaxDeadliftKg),
    sex,
    equipment,
  });
  if (prev.kind === "total" || prev.kind === "bench") return prev.points;
  return null;
}

export function profileLevelFromGlPoints(gl: number | null): number {
  if (gl == null || !Number.isFinite(gl) || gl <= 0) return 1;
  return Math.max(1, Math.min(999, Math.floor(gl / 2.8) + 1));
}

export function parsePinnedIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string").slice(0, 3);
}

export async function syncUserAchievements(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      glBodyweightKg: true,
      glMaxSquatKg: true,
      glMaxBenchKg: true,
      glMaxDeadliftKg: true,
      glSex: true,
      glEquipment: true,
    },
  });
  if (!user) return [];
  const computed = achievementIdsFromProfile({
    glBodyweightKg: n(user.glBodyweightKg),
    glMaxSquatKg: n(user.glMaxSquatKg),
    glMaxBenchKg: n(user.glMaxBenchKg),
    glMaxDeadliftKg: n(user.glMaxDeadliftKg),
    glSex: user.glSex,
    glEquipment: user.glEquipment,
  });
  const existing = new Set(
    (
      await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      })
    ).map((a) => a.achievementId),
  );
  const newly: string[] = [];
  const toInsert = computed.filter((id) => !existing.has(id));
  if (toInsert.length === 0) return [];
  await prisma.userAchievement.createMany({
    data: toInsert.map((achievementId) => ({ userId, achievementId })),
    skipDuplicates: true,
  });
  for (const id of toInsert) newly.push(id);
  return newly;
}

export async function acknowledgeAchievements(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const now = new Date();
  await prisma.userAchievement.updateMany({
    where: { userId, achievementId: { in: ids }, announcedAt: null },
    data: { announcedAt: now },
  });
}

const ALL_ACHIEVEMENT_IDS = new Set(ACHIEVEMENT_ORDER);

export function isValidAchievementId(id: string): boolean {
  return ALL_ACHIEVEMENT_IDS.has(id);
}
