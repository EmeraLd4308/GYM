import { prisma } from "@/shared/lib/prisma";
import { mapApiExercise, type WorkoutPayload } from "@/features/workouts/lib/workout-session-types";

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
    exercises: workout.exercises.map((ex) => mapApiExercise(ex)),
  };
}
