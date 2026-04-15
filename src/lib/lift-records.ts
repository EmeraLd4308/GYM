import { BaseLift, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
import { inferWorkoutTagFromExercises } from "@/lib/workout-tags";

function asNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function e1rm(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

type RecordSource = {
  topWeightKg: number | null;
  topVolumeKg: number | null;
  estOneRmKg: number | null;
};

function maxByLift(workouts: Array<{ exercises: Array<{ baseLift: BaseLift; sets: Array<{ isWarmup: boolean; reps: number; weightKg: Prisma.Decimal }> }> }>, lift: BaseLift): RecordSource {
  let topWeightKg: number | null = null;
  let topVolumeKg: number | null = null;
  let estOneRmKg: number | null = null;
  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      if (ex.baseLift !== lift) continue;
      for (const set of ex.sets) {
        if (set.isWarmup) continue;
        const weight = asNumber(set.weightKg);
        if (weight == null) continue;
        const volume = weight * set.reps;
        const est = e1rm(weight, set.reps);
        topWeightKg = topWeightKg == null ? weight : Math.max(topWeightKg, weight);
        topVolumeKg = topVolumeKg == null ? volume : Math.max(topVolumeKg, volume);
        estOneRmKg = estOneRmKg == null ? est : Math.max(estOneRmKg, est);
      }
    }
  }
  return { topWeightKg, topVolumeKg, estOneRmKg };
}

export async function recalculateWorkoutAutoTag(workoutId: string): Promise<void> {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    include: {
      exercises: {
        include: { sets: true },
      },
      user: {
        select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
      },
    },
  });
  if (!workout) return;
  const maxes = sbdMaxKgFromUserRow(workout.user);
  const nextTag = inferWorkoutTagFromExercises(workout.exercises, maxes);
  await prisma.workout.update({
    where: { id: workoutId },
    data: { autoTag: nextTag },
  });
}

export async function recalculateUserLiftRecords(userId: string): Promise<void> {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });
  const lifts: BaseLift[] = ["BENCH", "SQUAT", "DEADLIFT"];
  for (const lift of lifts) {
    const source = maxByLift(workouts, lift);
    const existing = await prisma.userLiftRecord.findUnique({
      where: { userId_baseLift: { userId, baseLift: lift } },
    });
    if (!existing) {
      await prisma.userLiftRecord.create({
        data: {
          userId,
          baseLift: lift,
          topWeightKg: source.topWeightKg != null ? new Prisma.Decimal(source.topWeightKg) : null,
          topVolumeKg: source.topVolumeKg != null ? new Prisma.Decimal(source.topVolumeKg) : null,
          estOneRmKg: source.estOneRmKg != null ? new Prisma.Decimal(source.estOneRmKg) : null,
        },
      });
      continue;
    }
    const data: Prisma.UserLiftRecordUpdateInput = {};
    if (!existing.manualTopWeightKg) {
      data.topWeightKg =
        source.topWeightKg != null ? new Prisma.Decimal(source.topWeightKg) : null;
    } else if (
      source.topWeightKg != null &&
      (existing.topWeightKg == null || source.topWeightKg > Number(existing.topWeightKg))
    ) {
      data.topWeightKg = new Prisma.Decimal(source.topWeightKg);
    }
    if (!existing.manualTopVolumeKg) {
      data.topVolumeKg =
        source.topVolumeKg != null ? new Prisma.Decimal(source.topVolumeKg) : null;
    } else if (
      source.topVolumeKg != null &&
      (existing.topVolumeKg == null || source.topVolumeKg > Number(existing.topVolumeKg))
    ) {
      data.topVolumeKg = new Prisma.Decimal(source.topVolumeKg);
    }
    if (!existing.manualEstOneRmKg) {
      data.estOneRmKg =
        source.estOneRmKg != null ? new Prisma.Decimal(source.estOneRmKg) : null;
    } else if (
      source.estOneRmKg != null &&
      (existing.estOneRmKg == null || source.estOneRmKg > Number(existing.estOneRmKg))
    ) {
      data.estOneRmKg = new Prisma.Decimal(source.estOneRmKg);
    }
    if (Object.keys(data).length > 0) {
      await prisma.userLiftRecord.update({
        where: { userId_baseLift: { userId, baseLift: lift } },
        data,
      });
    }
  }
}

export async function recalculateAllWorkoutTagsForUser(userId: string): Promise<void> {
  const userMax = await prisma.user.findUnique({
    where: { id: userId },
    select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
  });
  const maxes = sbdMaxKgFromUserRow(userMax);
  const workouts = await prisma.workout.findMany({
    where: { userId },
    select: {
      id: true,
      exercises: {
        select: {
          baseLift: true,
          sets: { select: { weightKg: true, reps: true, isWarmup: true } },
        },
      },
    },
  });
  for (const workout of workouts) {
    const nextTag = inferWorkoutTagFromExercises(workout.exercises, maxes);
    await prisma.workout.update({
      where: { id: workout.id },
      data: { autoTag: nextTag },
    });
  }
}

export async function recalculateUserDerivedMetricsFromProfile(userId: string): Promise<void> {
  const userMax = await prisma.user.findUnique({
    where: { id: userId },
    select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
  });
  const maxes = sbdMaxKgFromUserRow(userMax);

  const sets = await prisma.exerciseSet.findMany({
    where: { workoutExercise: { workout: { userId } } },
    include: { workoutExercise: { include: { workout: { select: { id: true } } } } },
  });

  const workoutIds = new Set<string>();
  for (const set of sets) {
    workoutIds.add(set.workoutExercise.workout.id);
    const next = deriveSetRpe(
      set.workoutExercise.baseLift,
      set.isWarmup,
      Number(set.weightKg),
      set.reps,
      maxes,
    );
    await prisma.exerciseSet.update({
      where: { id: set.id },
      data: { rpe: next != null ? new Prisma.Decimal(next) : null },
    });
  }

  for (const workoutId of workoutIds) {
    await recalculateWorkoutAutoTag(workoutId);
  }
  await recalculateUserLiftRecords(userId);
}

