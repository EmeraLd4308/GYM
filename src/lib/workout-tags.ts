import type { BaseLift } from "@prisma/client";
import { deriveSetRpe, type SbdMaxKg } from "@/lib/derive-set-rpe";
export type WorkoutTag = "HEAVY" | "MEDIUM" | "LIGHT";

export const WORKOUT_TAG_OPTIONS: Array<{ value: WorkoutTag; label: string }> = [
  { value: "HEAVY", label: "Важке" },
  { value: "MEDIUM", label: "Середнє" },
  { value: "LIGHT", label: "Легке" },
];

export function workoutTagLabelUk(tag: WorkoutTag | null | undefined): string {
  if (tag === "HEAVY") return "Важке";
  if (tag === "MEDIUM") return "Середнє";
  if (tag === "LIGHT") return "Легке";
  return "—";
}

export function inferWorkoutTagFromRpe(
  avgRpe: number | null,
  hasHeavySet: boolean,
): WorkoutTag | null {
  if (avgRpe == null || !Number.isFinite(avgRpe)) return null;
  if (hasHeavySet) return "HEAVY";
  if (avgRpe >= 7.3) return "MEDIUM";
  return "LIGHT";
}

export function workoutTagBadgeClass(tag: WorkoutTag | null | undefined): string {
  if (tag === "HEAVY") {
    return "border-[#e31e24]/40 bg-[#e31e24]/15 text-[#ff7b7f]";
  }
  if (tag === "MEDIUM") {
    return "border-amber-400/35 bg-amber-400/10 text-amber-300";
  }
  if (tag === "LIGHT") {
    return "border-emerald-400/35 bg-emerald-400/10 text-emerald-300";
  }
  return "border-white/[0.14] bg-white/[0.04] text-zinc-500";
}

type TagSet = {
  isWarmup: boolean;
  reps: number;
  weightKg: unknown;
  rpe?: unknown;
};

type TagExercise = {
  baseLift: BaseLift;
  sets: TagSet[];
};

const TAG_PRIORITY: Record<WorkoutTag, number> = {
  LIGHT: 1,
  MEDIUM: 2,
  HEAVY: 3,
};

export function strongerWorkoutTag(
  a: WorkoutTag | null | undefined,
  b: WorkoutTag | null | undefined,
): WorkoutTag | null {
  if (!a && !b) return null;
  if (!a) return b ?? null;
  if (!b) return a;
  return TAG_PRIORITY[a] >= TAG_PRIORITY[b] ? a : b;
}

export function inferWorkoutTagFromExercises(
  exercises: TagExercise[],
  maxes: SbdMaxKg,
): WorkoutTag | null {
  const rpes: number[] = [];
  let hasHeavySet = false;
  for (const ex of exercises) {
    if (ex.baseLift === "NONE") continue;
    for (const s of ex.sets) {
      const weight =
        typeof s.weightKg === "number" ? s.weightKg : Number(String(s.weightKg ?? "").replace(",", "."));
      if (!Number.isFinite(weight)) continue;
      const rpe = deriveSetRpe(ex.baseLift, s.isWarmup, weight, s.reps, maxes);
      if (rpe == null) continue;
      rpes.push(rpe);
      if (rpe > 8.5) hasHeavySet = true;
    }
  }
  if (rpes.length === 0) return null;
  const avg = rpes.reduce((a, b) => a + b, 0) / rpes.length;
  return inferWorkoutTagFromRpe(avg, hasHeavySet);
}

