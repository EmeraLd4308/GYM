import type { Prisma } from "@prisma/client";
import type { StatsFilterOptions } from "@/lib/stats-filters";
import { workoutWhereDateRange } from "@/lib/stats-filters";

/** Умова Prisma для списку тренувань: діапазон дат + вага по робочих підходах SBD (як у статистиці). */
export function workoutListWhere(userId: string, filters: StatsFilterOptions): Prisma.WorkoutWhereInput {
  const dateF = workoutWhereDateRange(filters);
  const hasWeight = filters.weightMin !== undefined || filters.weightMax !== undefined;

  const weightWhere: Prisma.WorkoutWhereInput | undefined = hasWeight
    ? {
        exercises: {
          some: {
            baseLift: { in: ["BENCH", "SQUAT", "DEADLIFT"] },
            sets: {
              some: {
                isWarmup: false,
                weightKg: {
                  ...(filters.weightMin !== undefined ? { gte: filters.weightMin } : {}),
                  ...(filters.weightMax !== undefined ? { lte: filters.weightMax } : {}),
                },
              },
            },
          },
        },
      }
    : undefined;

  return {
    userId,
    ...(dateF ? { date: dateF } : {}),
    ...weightWhere,
  };
}

export function workoutListQueryString(
  filters: StatsFilterOptions,
  page: number,
  pageSize: number,
): string {
  const q = new URLSearchParams();
  if (filters.dateFrom?.trim()) q.set("from", filters.dateFrom.trim());
  if (filters.dateTo?.trim()) q.set("to", filters.dateTo.trim());
  if (filters.weightMin !== undefined) q.set("wMin", String(filters.weightMin));
  if (filters.weightMax !== undefined) q.set("wMax", String(filters.weightMax));
  if (page > 1) q.set("page", String(page));
  if (pageSize !== 20) q.set("pageSize", String(pageSize));
  return q.toString();
}
