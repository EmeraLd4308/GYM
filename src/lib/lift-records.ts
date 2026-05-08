import { BaseLift, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
import { inferWorkoutTagFromExercises } from "@/lib/workout-tags";
import { syncUserAchievements } from "@/lib/achievements";
import { maxTripleChanged, recordProfileSbdMaxSnapshot } from "@/lib/profile-max-history";

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

function maxFromSets(sets: Array<{ weightKg: Prisma.Decimal; reps: number }>): RecordSource {
  let topWeightKg: number | null = null;
  let topVolumeKg: number | null = null;
  let estOneRmKg: number | null = null;
  for (const set of sets) {
    const weight = asNumber(set.weightKg);
    if (weight == null) continue;
    const volume = weight * set.reps;
    const est = e1rm(weight, set.reps);
    if (topWeightKg == null || weight > topWeightKg) {
      topWeightKg = weight;
      estOneRmKg = est;
    } else if (weight === topWeightKg) {
      estOneRmKg = estOneRmKg == null ? est : Math.max(estOneRmKg, est);
    }
    topVolumeKg = topVolumeKg == null ? volume : Math.max(topVolumeKg, volume);
  }
  return { topWeightKg, topVolumeKg, estOneRmKg };
}

function maxByLift(workouts: Array<{ exercises: Array<{ baseLift: BaseLift; sets: Array<{ isWarmup: boolean; reps: number; weightKg: Prisma.Decimal }> }> }>, lift: BaseLift): RecordSource {
  const sets: Array<{ weightKg: Prisma.Decimal; reps: number }> = [];
  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      if (ex.baseLift !== lift) continue;
      for (const set of ex.sets) {
        if (set.isWarmup) continue;
        sets.push({ weightKg: set.weightKg, reps: set.reps });
      }
    }
  }
  return maxFromSets(sets);
}

export async function recalculateUserLiftRecordForLift(
  userId: string,
  lift: BaseLift,
): Promise<void> {
  if (lift === "NONE") return;
  const sets = await prisma.exerciseSet.findMany({
    where: {
      isWarmup: false,
      workoutExercise: {
        baseLift: lift,
        workout: { userId },
      },
    },
    select: { weightKg: true, reps: true },
  });
  const source = maxFromSets(sets);
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
  } else {
    const data: Prisma.UserLiftRecordUpdateInput = {};
    if (!existing.manualTopWeightKg) {
      data.topWeightKg = source.topWeightKg != null ? new Prisma.Decimal(source.topWeightKg) : null;
    } else if (
      source.topWeightKg != null &&
      (existing.topWeightKg == null || source.topWeightKg > Number(existing.topWeightKg))
    ) {
      data.topWeightKg = new Prisma.Decimal(source.topWeightKg);
    }
    if (!existing.manualTopVolumeKg) {
      data.topVolumeKg = source.topVolumeKg != null ? new Prisma.Decimal(source.topVolumeKg) : null;
    } else if (
      source.topVolumeKg != null &&
      (existing.topVolumeKg == null || source.topVolumeKg > Number(existing.topVolumeKg))
    ) {
      data.topVolumeKg = new Prisma.Decimal(source.topVolumeKg);
    }
    if (!existing.manualEstOneRmKg) {
      data.estOneRmKg = source.estOneRmKg != null ? new Prisma.Decimal(source.estOneRmKg) : null;
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

  if (source.estOneRmKg == null) return;
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
  });
  if (!userRow) return;
  const before = userRow;
  const patch: Prisma.UserUpdateInput = {};
  if (lift === "SQUAT") {
    const current = userRow.glMaxSquatKg != null ? Number(userRow.glMaxSquatKg) : null;
    if (current == null || source.estOneRmKg > current) {
      patch.glMaxSquatKg = new Prisma.Decimal(source.estOneRmKg);
    }
  } else if (lift === "BENCH") {
    const current = userRow.glMaxBenchKg != null ? Number(userRow.glMaxBenchKg) : null;
    if (current == null || source.estOneRmKg > current) {
      patch.glMaxBenchKg = new Prisma.Decimal(source.estOneRmKg);
    }
  } else if (lift === "DEADLIFT") {
    const current = userRow.glMaxDeadliftKg != null ? Number(userRow.glMaxDeadliftKg) : null;
    if (current == null || source.estOneRmKg > current) {
      patch.glMaxDeadliftKg = new Prisma.Decimal(source.estOneRmKg);
    }
  }
  if (Object.keys(patch).length === 0) return;
  const after = await prisma.user.update({
    where: { id: userId },
    data: patch,
    select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
  });
  if (maxTripleChanged(before, after)) {
    await recordProfileSbdMaxSnapshot(userId, after);
  }
  await syncUserAchievements(userId);
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
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
  });
  const profileMaxPatch: Prisma.UserUpdateInput = {};
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
    } else {
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
    if (source.estOneRmKg != null) {
      if (lift === "SQUAT") {
        const current = userRow?.glMaxSquatKg != null ? Number(userRow.glMaxSquatKg) : null;
        if (current == null || source.estOneRmKg > current) {
          profileMaxPatch.glMaxSquatKg = new Prisma.Decimal(source.estOneRmKg);
        }
      } else if (lift === "BENCH") {
        const current = userRow?.glMaxBenchKg != null ? Number(userRow.glMaxBenchKg) : null;
        if (current == null || source.estOneRmKg > current) {
          profileMaxPatch.glMaxBenchKg = new Prisma.Decimal(source.estOneRmKg);
        }
      } else if (lift === "DEADLIFT") {
        const current = userRow?.glMaxDeadliftKg != null ? Number(userRow.glMaxDeadliftKg) : null;
        if (current == null || source.estOneRmKg > current) {
          profileMaxPatch.glMaxDeadliftKg = new Prisma.Decimal(source.estOneRmKg);
        }
      }
    }
  }
  if (Object.keys(profileMaxPatch).length > 0) {
    const before = userRow;
    const after = await prisma.user.update({
      where: { id: userId },
      data: profileMaxPatch,
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    });
    if (before && maxTripleChanged(before, after)) {
      await recordProfileSbdMaxSnapshot(userId, after);
    }
    await syncUserAchievements(userId);
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

