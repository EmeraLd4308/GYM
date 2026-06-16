import type { BaseLift, ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import { startOfWeek } from "date-fns";

type ExerciseWithSets = WorkoutExercise & { sets: ExerciseSet[] };
type WorkoutWithEx = Workout & { exercises: ExerciseWithSets[] };

export type WeeklySbdPeakRow = {
  weekStartIso: string;
  weekLabel: string;
  bench: number;
  squat: number;
  deadlift: number;
};

function mergePeakKg(
  map: Map<string, WeeklySbdPeakRow>,
  weekKey: string,
  weekLabel: string,
  lift: BaseLift,
  kg: number,
) {
  if (!Number.isFinite(kg) || kg < 0) return;
  let row = map.get(weekKey);
  if (!row) {
    row = {
      weekStartIso: weekKey,
      weekLabel,
      bench: 0,
      squat: 0,
      deadlift: 0,
    };
    map.set(weekKey, row);
  }
  if (lift === "BENCH") row.bench = Math.max(row.bench, kg);
  else if (lift === "SQUAT") row.squat = Math.max(row.squat, kg);
  else if (lift === "DEADLIFT") row.deadlift = Math.max(row.deadlift, kg);
}

export function buildWeeklySbdPeakSeries(workouts: WorkoutWithEx[]): WeeklySbdPeakRow[] {
  const map = new Map<string, WeeklySbdPeakRow>();

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
      if (ex.baseLift === "NONE") continue;
      for (const s of ex.sets) {
        if (s.isWarmup) continue;
        mergePeakKg(map, weekKey, weekLabel, ex.baseLift, Number(s.weightKg));
      }
    }
  }

  return [...map.values()].sort((a, b) => a.weekStartIso.localeCompare(b.weekStartIso));
}
