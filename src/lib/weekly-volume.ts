import type { BaseLift, ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import { startOfWeek } from "date-fns";

type ExerciseWithSets = WorkoutExercise & { sets: ExerciseSet[] };
type WorkoutWithEx = Workout & { exercises: ExerciseWithSets[] };

export type WeeklyVolumeRow = {
  weekStartIso: string;
  weekLabel: string;
  bench: number;
  squat: number;
  deadlift: number;
};

function addVolume(
  map: Map<string, WeeklyVolumeRow>,
  weekKey: string,
  weekLabel: string,
  lift: BaseLift,
  volume: number,
) {
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
  if (lift === "BENCH") row.bench += volume;
  else if (lift === "SQUAT") row.squat += volume;
  else if (lift === "DEADLIFT") row.deadlift += volume;
}

/** Робочі підходи: без розминки; об'єм = вага × повтори. Окремо по кожній базовій вправі. */
export function buildWeeklyVolumeSeries(workouts: WorkoutWithEx[]): WeeklyVolumeRow[] {
  const map = new Map<string, WeeklyVolumeRow>();

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
        const vol = Number(s.weightKg) * s.reps;
        addVolume(map, weekKey, weekLabel, ex.baseLift, vol);
      }
    }
  }

  return [...map.values()].sort((a, b) => a.weekStartIso.localeCompare(b.weekStartIso));
}
