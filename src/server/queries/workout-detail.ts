import { prisma } from "@/shared/lib/prisma";
import { mapApiSet, type WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import type { BaseLift } from "@prisma/client";

const workoutSessionInclude = {
  exercises: {
    orderBy: { sortOrder: "asc" as const },
    include: { sets: { orderBy: { sortOrder: "asc" as const } } },
  },
} as const;

export async function getWorkoutSessionPayload(
  userId: string,
  workoutId: string,
): Promise<WorkoutPayload | null> {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: workoutSessionInclude,
  });
  if (!workout) return null;

  return {
    id: workout.id,
    date: workout.date.toISOString(),
    title: workout.title,
    notes: workout.notes ?? null,
    exercises: workout.exercises.map((ex) => ({
      id: ex.id,
      sortOrder: ex.sortOrder,
      name: ex.name,
      baseLift: ex.baseLift as BaseLift,
      sets: ex.sets.map((s) =>
        mapApiSet({
          id: s.id,
          sortOrder: s.sortOrder,
          weightKg: s.weightKg,
          reps: s.reps,
          isWarmup: s.isWarmup,
          rpe: s.rpe,
        }),
      ),
    })),
  };
}
