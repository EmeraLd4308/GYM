import type { Prisma } from "@prisma/client";
import type { ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import { parseWorkoutDateInput } from "@/lib/date-local";

export type StatsFilterOptions = {
  dateFrom?: string;
  dateTo?: string;
  weightMin?: number;
  weightMax?: number;
  search?: string;
  tag?: "HEAVY" | "MEDIUM" | "LIGHT";
};

export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { sets: ExerciseSet[] })[];
};

export function parseStatsFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): StatsFilterOptions {
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
  };
  const from = get("from");
  const to = get("to");
  const wMin = get("wMin");
  const wMax = get("wMax");
  const q = get("q");
  const tag = get("tag");
  const out: StatsFilterOptions = {};
  if (from?.trim()) out.dateFrom = from.trim();
  if (to?.trim()) out.dateTo = to.trim();
  if (q?.trim()) out.search = q.trim().slice(0, 200);
  if (wMin !== undefined && wMin !== "") {
    const n = Number(wMin);
    if (Number.isFinite(n)) out.weightMin = n;
  }
  if (wMax !== undefined && wMax !== "") {
    const n = Number(wMax);
    if (Number.isFinite(n)) out.weightMax = n;
  }
  if (tag && ["HEAVY", "MEDIUM", "LIGHT"].includes(tag)) {
    out.tag = tag as "HEAVY" | "MEDIUM" | "LIGHT";
  }
  return out;
}

export function workoutWhereDateRange(
  filters: StatsFilterOptions,
): Prisma.DateTimeFilter | undefined {
  if (!filters.dateFrom?.trim() && !filters.dateTo?.trim()) return undefined;
  try {
    let gte: Date | undefined;
    let lte: Date | undefined;
    if (filters.dateFrom?.trim()) gte = parseWorkoutDateInput(filters.dateFrom.trim());
    if (filters.dateTo?.trim()) {
      const d = parseWorkoutDateInput(filters.dateTo.trim());
      lte = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }
    if (gte && lte && gte.getTime() > lte.getTime()) {
      const t = gte;
      gte = new Date(lte.getFullYear(), lte.getMonth(), lte.getDate(), 0, 0, 0, 0);
      lte = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999);
    }
    const cond: Prisma.DateTimeFilter = {};
    if (gte) cond.gte = gte;
    if (lte) cond.lte = lte;
    return Object.keys(cond).length ? cond : undefined;
  } catch {
    return undefined;
  }
}

export function applyWeightFilterForVolume(
  workouts: WorkoutWithExercises[],
  min?: number,
  max?: number,
): WorkoutWithExercises[] {
  if (min === undefined && max === undefined) return workouts;

  const ok = (kg: number) => {
    if (min !== undefined && kg < min) return false;
    if (max !== undefined && kg > max) return false;
    return true;
  };

  return workouts.map((w) => ({
    ...w,
    exercises: w.exercises.map((ex) => {
      if (ex.baseLift === "NONE") {
        return { ...ex, sets: [] };
      }
      return {
        ...ex,
        sets: ex.sets.filter((s) => {
          if (s.isWarmup) return false;
          return ok(Number(s.weightKg));
        }),
      };
    }),
  }));
}
