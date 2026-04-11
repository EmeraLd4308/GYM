import type { BaseLift, ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import { startOfWeek } from "date-fns";
import { estimateRpeFromProfileMax } from "@/lib/rpe-estimate";

type ExerciseWithSets = WorkoutExercise & { sets: ExerciseSet[] };
type WorkoutWithEx = Workout & { exercises: ExerciseWithSets[] };

type LiftAcc = { sum: number; n: number };

export type WeeklySbdRpeRow = {
  weekStartIso: string;
  weekLabel: string;
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
};

export type ProfileSbdMaxKg = {
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
};

function liftKey(l: BaseLift): keyof Pick<WeeklySbdRpeRow, "bench" | "squat" | "deadlift"> | null {
  if (l === "BENCH") return "bench";
  if (l === "SQUAT") return "squat";
  if (l === "DEADLIFT") return "deadlift";
  return null;
}

function maxForLift(
  key: keyof Pick<WeeklySbdRpeRow, "bench" | "squat" | "deadlift">,
  maxes?: ProfileSbdMaxKg | null,
): number | null {
  if (!maxes) return null;
  const v = maxes[key];
  return v != null && Number.isFinite(v) && v > 0 ? v : null;
}

export function buildWeeklySbdRpeSeries(
  workouts: WorkoutWithEx[],
  profileMaxKg?: ProfileSbdMaxKg | null,
): WeeklySbdRpeRow[] {
  const map = new Map<
    string,
    { weekLabel: string; bench: LiftAcc; squat: LiftAcc; deadlift: LiftAcc }
  >();

  for (const w of workouts) {
    const weekStart = startOfWeek(w.date, { weekStartsOn: 1 });
    const weekKey = weekStart.toISOString().slice(0, 10);
    const weekLabel =
      weekStart.toLocaleDateString("uk-UA", { day: "2-digit", month: "short" }) +
      " — " +
      new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "short",
      });

    for (const ex of w.exercises) {
      const key = liftKey(ex.baseLift);
      if (!key) continue;
      const maxKg = maxForLift(key, profileMaxKg);

      for (const s of ex.sets) {
        if (s.isWarmup) continue;

        let r: number | null = null;
        if (s.rpe != null) {
          const x = Number(s.rpe);
          if (Number.isFinite(x) && x >= 1 && x <= 10) r = x;
        }
        if (r == null && maxKg != null) {
          const weight = Number(s.weightKg);
          const reps = s.reps;
          r = estimateRpeFromProfileMax(weight, reps, maxKg);
        }
        if (r == null) continue;

        let row = map.get(weekKey);
        if (!row) {
          row = {
            weekLabel,
            bench: { sum: 0, n: 0 },
            squat: { sum: 0, n: 0 },
            deadlift: { sum: 0, n: 0 },
          };
          map.set(weekKey, row);
        }
        const acc = row[key];
        acc.sum += r;
        acc.n += 1;
      }
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartIso, row]) => {
      const avg = (a: LiftAcc) => (a.n > 0 ? Math.round((a.sum / a.n) * 100) / 100 : null);
      return {
        weekStartIso,
        weekLabel: row.weekLabel,
        bench: avg(row.bench),
        squat: avg(row.squat),
        deadlift: avg(row.deadlift),
      };
    })
    .filter((row) => row.bench != null || row.squat != null || row.deadlift != null);
}
