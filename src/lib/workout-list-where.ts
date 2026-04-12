import type { Prisma } from "@prisma/client";
import type { StatsFilterOptions } from "@/lib/stats-filters";
import { workoutWhereDateRange } from "@/lib/stats-filters";
import { WORKOUT_LIST_PAGE_SIZE_DEFAULT } from "@/lib/workout-list-page-size";

export function workoutListWhere(
  userId: string,
  filters: StatsFilterOptions,
): Prisma.WorkoutWhereInput {
  const dateF = workoutWhereDateRange(filters);
  const hasWeight = filters.weightMin !== undefined || filters.weightMax !== undefined;
  const searchTrim = filters.search?.trim();

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

  const searchWhere: Prisma.WorkoutWhereInput | undefined = searchTrim
    ? {
        OR: [
          { title: { contains: searchTrim, mode: "insensitive" } },
          {
            exercises: {
              some: { name: { contains: searchTrim, mode: "insensitive" } },
            },
          },
        ],
      }
    : undefined;

  if (!dateF && !weightWhere && !searchWhere) {
    return { userId };
  }

  const parts: Prisma.WorkoutWhereInput[] = [{ userId }];
  if (dateF) parts.push({ date: dateF });
  if (weightWhere) parts.push(weightWhere);
  if (searchWhere) parts.push(searchWhere);
  return { AND: parts };
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
  if (filters.search?.trim()) q.set("q", filters.search.trim());
  if (page > 1) q.set("page", String(page));
  if (pageSize !== WORKOUT_LIST_PAGE_SIZE_DEFAULT) q.set("pageSize", String(pageSize));
  return q.toString();
}
