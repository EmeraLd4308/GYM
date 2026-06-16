import { prisma } from "@/shared/lib/prisma";
import { effectiveCalendarDayFromRequest } from "@/features/calendar/lib/calendar-day-cookie";
import { localDayBoundsFromInput } from "@/shared/lib/date-local";

const workoutListSelect = {
  id: true,
  title: true,
  date: true,
  autoTag: true,
  exercises: {
    select: {
      _count: { select: { sets: true } },
    },
  },
} as const;

function positiveKg(v: unknown): boolean {
  if (v == null) return false;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0;
}

export async function getDashboardPageData(userId: string) {
  const todayStr = await effectiveCalendarDayFromRequest();
  const { start: todayStart, end: todayEnd } = localDayBoundsFromInput(todayStr);

  const [todayWorkouts, recent, profileRow, workoutTotal] = await Promise.all([
    prisma.workout.findMany({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { date: "asc" },
      select: workoutListSelect,
    }),
    prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 12,
      select: workoutListSelect,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        glBodyweightKg: true,
        glMaxSquatKg: true,
        glMaxBenchKg: true,
        glMaxDeadliftKg: true,
      },
    }),
    prisma.workout.count({ where: { userId } }),
  ]);

  const profileDone = Boolean(
    profileRow &&
      (positiveKg(profileRow.glBodyweightKg) ||
        positiveKg(profileRow.glMaxSquatKg) ||
        positiveKg(profileRow.glMaxBenchKg) ||
        positiveKg(profileRow.glMaxDeadliftKg)),
  );

  const todayIds = new Set(todayWorkouts.map((w) => w.id));
  const otherRecent = recent.filter((w) => !todayIds.has(w.id)).slice(0, 3);

  const todayLabel = todayStart.toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    todayWorkouts,
    recent,
    otherRecent,
    profileRow,
    workoutTotal,
    profileDone,
    hasWorkout: workoutTotal > 0,
    todayLabel,
    hasAnyWorkout: todayWorkouts.length > 0 || recent.length > 0,
  };
}

export type DashboardWorkoutRow = Awaited<
  ReturnType<typeof getDashboardPageData>
>["recent"][number];
