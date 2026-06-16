import { after } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type { StatsFilterOptions } from "@/features/stats/lib/stats-filters";
import { workoutListWhere } from "@/features/workouts/lib/workout-list-where";
import { recalculateAllWorkoutTagsForUser } from "@/features/workouts/lib/lift-records";

export async function ensureWorkoutTagsScheduled(userId: string) {
  const missingTags = await prisma.workout.count({
    where: { userId, autoTag: null },
  });
  if (missingTags > 0) {
    after(() => {
      void recalculateAllWorkoutTagsForUser(userId).catch((error) => {
        console.error("[workout-tags-backfill]", error);
      });
    });
  }
}

export async function getWorkoutsListPageData(
  userId: string,
  filters: StatsFilterOptions,
  page: number,
  pageSize: number,
) {
  const where = workoutListWhere(userId, filters);
  const total = await prisma.workout.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const workouts = await prisma.workout.findMany({
    where,
    orderBy: { date: "desc" },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      date: true,
      autoTag: true,
      exercises: {
        orderBy: { sortOrder: "asc" },
        select: {
          _count: { select: { sets: true } },
        },
      },
    },
  });

  let anyWorkoutsUnfiltered = 0;
  if (workouts.length === 0) {
    anyWorkoutsUnfiltered = await prisma.workout.count({ where: { userId } });
  }

  const workoutsWithTag = workouts.map((w) => ({ ...w, displayTag: w.autoTag }));

  const filteredOutAll =
    workouts.length === 0 && total === 0 && anyWorkoutsUnfiltered > 0;
  const pagePastEnd = workouts.length === 0 && total > 0;

  return {
    workoutsWithTag,
    total,
    totalPages,
    safePage,
    pageSize,
    filters,
    filteredOutAll,
    pagePastEnd,
  };
}
