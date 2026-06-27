import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

export type ExerciseSetSnapshot = {
  sortOrder: number;
  weightKg: Prisma.Decimal;
  reps: number;
  isWarmup: boolean;
  rpe: Prisma.Decimal | null;
};

export function setsCreateFromSnapshot(sets: ExerciseSetSnapshot[]): Prisma.ExerciseSetCreateWithoutWorkoutExerciseInput[] {
  return sets.map((s) => ({
    sortOrder: s.sortOrder,
    weightKg: s.weightKg,
    reps: s.reps,
    isWarmup: s.isWarmup,
    ...(s.rpe != null ? { rpe: s.rpe } : {}),
  }));
}

export async function findLastExerciseSets(
  userId: string,
  exerciseName: string,
  opts?: { excludeWorkoutId?: string },
): Promise<ExerciseSetSnapshot[] | null> {
  const trimmed = exerciseName.trim();
  if (!trimmed) return null;

  const last = await prisma.workoutExercise.findFirst({
    where: {
      workout: {
        userId,
        ...(opts?.excludeWorkoutId ? { id: { not: opts.excludeWorkoutId } } : {}),
      },
      name: { equals: trimmed, mode: "insensitive" },
      sets: { some: {} },
    },
    orderBy: [{ workout: { date: "desc" } }, { workout: { createdAt: "desc" } }],
    include: {
      sets: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!last?.sets.length) return null;

  return last.sets.map((s) => ({
    sortOrder: s.sortOrder,
    weightKg: s.weightKg,
    reps: s.reps,
    isWarmup: s.isWarmup,
    rpe: s.rpe,
  }));
}
