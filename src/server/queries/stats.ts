import { prisma } from "@/shared/lib/prisma";
import {
  parseStatsFiltersFromSearchParams,
  workoutWhereDateRange,
  applyWeightFilterForVolume,
} from "@/features/stats/lib/stats-filters";
import { buildWeeklySbdRpeSeries, type ProfileSbdMaxKg } from "@/features/stats/lib/weekly-rpe";
import { buildWeeklyAttendanceSeries } from "@/features/stats/lib/weekly-attendance";
import { getProfileMaxHistoryPoints } from "@/features/stats/lib/profile-max-history";
import { streakWeeksWithThreePlus } from "@/features/stats/lib/streak";
import { compareMonthVsPrevious } from "@/features/stats/lib/period-compare";
import type { WeeklyRpeChartHints } from "@/features/stats/components/WeeklyCharts";

function positiveKg(v: unknown): boolean {
  if (v == null) return false;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0;
}

function profileMaxFromUser(u: {
  glMaxBenchKg: unknown;
  glMaxSquatKg: unknown;
  glMaxDeadliftKg: unknown;
}): ProfileSbdMaxKg {
  return {
    bench: positiveKg(u.glMaxBenchKg) ? Number(u.glMaxBenchKg) : null,
    squat: positiveKg(u.glMaxSquatKg) ? Number(u.glMaxSquatKg) : null,
    deadlift: positiveKg(u.glMaxDeadliftKg) ? Number(u.glMaxDeadliftKg) : null,
  };
}

export async function getStatsPageData(
  userId: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const filters = parseStatsFiltersFromSearchParams(searchParams);
  const dateFilter = workoutWhereDateRange(filters);

  const [profileRow, workouts, profileMaxHistory] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { glMaxBenchKg: true, glMaxSquatKg: true, glMaxDeadliftKg: true },
    }),
    prisma.workout.findMany({
      where: {
        userId,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: "asc" },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    }),
    getProfileMaxHistoryPoints(userId),
  ]);

  const attendanceSeries = buildWeeklyAttendanceSeries(workouts);
  const streak = streakWeeksWithThreePlus(attendanceSeries);

  const rpeWorkouts = applyWeightFilterForVolume(workouts, filters.weightMin, filters.weightMax);
  const profileMaxKg = profileMaxFromUser(
    profileRow ?? { glMaxBenchKg: null, glMaxSquatKg: null, glMaxDeadliftKg: null },
  );
  const rpeSeries = buildWeeklySbdRpeSeries(rpeWorkouts, profileMaxKg);
  const monthCmp = compareMonthVsPrevious(rpeSeries);

  const rpeHints: WeeklyRpeChartHints = {
    bench: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "BENCH" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(profileRow?.glMaxBenchKg),
    },
    squat: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "SQUAT" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(profileRow?.glMaxSquatKg),
    },
    deadlift: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "DEADLIFT" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(profileRow?.glMaxDeadliftKg),
    },
  };

  return {
    attendanceSeries,
    streak,
    profileMaxHistory,
    rpeSeries,
    monthCmp,
    rpeHints,
  };
}
