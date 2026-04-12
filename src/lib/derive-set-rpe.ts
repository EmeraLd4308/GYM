import type { BaseLift } from "@prisma/client";
import { estimateRpeFromProfileMax } from "@/lib/rpe-estimate";

export type SbdMaxKg = { squat: number | null; bench: number | null; deadlift: number | null };

export function sbdMaxKgFromUserRow(row: {
  glMaxSquatKg: unknown;
  glMaxBenchKg: unknown;
  glMaxDeadliftKg: unknown;
} | null): SbdMaxKg {
  if (!row) return { squat: null, bench: null, deadlift: null };
  const n = (v: unknown) => {
    if (v == null) return null;
    const x = typeof v === "number" ? v : Number(v);
    return Number.isFinite(x) && x > 0 ? x : null;
  };
  return {
    squat: n(row.glMaxSquatKg),
    bench: n(row.glMaxBenchKg),
    deadlift: n(row.glMaxDeadliftKg),
  };
}

export function maxKgForBaseLift(bl: BaseLift, m: SbdMaxKg): number | null {
  if (bl === "SQUAT") return m.squat;
  if (bl === "BENCH") return m.bench;
  if (bl === "DEADLIFT") return m.deadlift;
  return null;
}

export function deriveSetRpe(
  baseLift: BaseLift,
  isWarmup: boolean,
  weightKg: number,
  reps: number,
  maxes: SbdMaxKg,
): number | null {
  if (baseLift === "NONE" || isWarmup) return null;
  const maxKg = maxKgForBaseLift(baseLift, maxes);
  if (maxKg == null) return null;
  return estimateRpeFromProfileMax(weightKg, reps, maxKg);
}
