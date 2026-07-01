import type { BaseLift, ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import type { ProfileSbdMaxKg } from "@/features/stats/lib/weekly-rpe";

type ExerciseWithSets = WorkoutExercise & { sets: ExerciseSet[] };
type WorkoutWithEx = Workout & { exercises: ExerciseWithSets[] };

export type ApproachMapLift = "bench" | "squat" | "deadlift";

export type ApproachMapPoint = {
  id: string;
  reps: number;
  percentMax: number | null;
  lift: ApproachMapLift;
  weightKg: number;
  dateLabel: string;
};

export type ApproachMapHints = {
  noTraining: boolean;
  missingMaxLifts: ApproachMapLift[];
};

const LIFT_FROM_BASE: Partial<Record<BaseLift, ApproachMapLift>> = {
  BENCH: "bench",
  SQUAT: "squat",
  DEADLIFT: "deadlift",
};

const ALL_LIFTS: ApproachMapLift[] = ["squat", "bench", "deadlift"];

function maxForLift(lift: ApproachMapLift, maxes: ProfileSbdMaxKg): number | null {
  const v = maxes[lift];
  return v != null && Number.isFinite(v) && v > 0 ? v : null;
}

function hasWorkingSets(workouts: WorkoutWithEx[], lift: ApproachMapLift): boolean {
  const base =
    lift === "bench" ? "BENCH" : lift === "squat" ? "SQUAT" : ("DEADLIFT" as BaseLift);
  return workouts.some((w) =>
    w.exercises.some(
      (ex) => ex.baseLift === base && ex.sets.some((s) => !s.isWarmup && Number(s.weightKg) > 0),
    ),
  );
}

export function approachMapLiftLabelUk(lift: ApproachMapLift): string {
  if (lift === "squat") return "Присяд";
  if (lift === "bench") return "Жим";
  return "Тяга";
}

export function buildApproachMapPoints(
  workouts: WorkoutWithEx[],
  profileMaxKg: ProfileSbdMaxKg,
): { points: ApproachMapPoint[]; hints: ApproachMapHints } {
  const points: ApproachMapPoint[] = [];
  let hasSbdSets = false;

  for (const w of workouts) {
    const dateLabel = w.date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
    for (const ex of w.exercises) {
      const lift = LIFT_FROM_BASE[ex.baseLift];
      if (!lift) continue;
      const maxKg = maxForLift(lift, profileMaxKg);

      for (const s of ex.sets) {
        if (s.isWarmup) continue;
        const weight = Number(s.weightKg);
        const reps = s.reps;
        if (!Number.isFinite(weight) || weight <= 0 || reps <= 0) continue;

        hasSbdSets = true;

        points.push({
          id: `${w.id}-${ex.id}-${s.id}`,
          reps,
          percentMax:
            maxKg != null ? Math.round((weight / maxKg) * 1000) / 10 : null,
          lift,
          weightKg: weight,
          dateLabel,
        });
      }
    }
  }

  const missingMaxLifts = ALL_LIFTS.filter(
    (lift) => hasWorkingSets(workouts, lift) && maxForLift(lift, profileMaxKg) == null,
  );

  return {
    points,
    hints: {
      noTraining: !hasSbdSets,
      missingMaxLifts,
    },
  };
}
