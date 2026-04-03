import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { buildWeeklyVolumeSeries } from "@/lib/weekly-volume";
import { buildWeeklyAttendanceSeries } from "@/lib/weekly-attendance";
import {
  parseStatsFiltersFromSearchParams,
  workoutWhereDateRange,
  applyWeightFilterForVolume,
} from "@/lib/stats-filters";
import { streakWeeksWithThreePlus } from "@/lib/streak";
import { compareLastTwoWeeks } from "@/lib/week-compare";
import { WeeklyCharts } from "@/components/WeeklyCharts";
import { AttendanceChart } from "@/components/AttendanceChart";
import { StatsFilterForm } from "@/components/StatsFilterForm";
import { StreakCard } from "@/components/StreakCard";
import { WeekVolumeCompare } from "@/components/WeekVolumeCompare";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const filters = parseStatsFiltersFromSearchParams(sp);
  const dateFilter = workoutWhereDateRange(filters);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  const attendanceSeries = buildWeeklyAttendanceSeries(workouts);
  const streak = streakWeeksWithThreePlus(attendanceSeries);

  const volumeWorkouts = applyWeightFilterForVolume(
    workouts,
    filters.weightMin,
    filters.weightMax,
  );
  const volumeSeries = buildWeeklyVolumeSeries(volumeWorkouts);
  const weekCmp = compareLastTwoWeeks(volumeSeries);

  return (
    <div className="space-y-8">
      <Suspense
        fallback={<div className="sbd-card rounded-xl p-5 text-sm text-zinc-500">Фільтри…</div>}
      >
        <StatsFilterForm />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <StreakCard weeks={streak} />
        <WeekVolumeCompare data={weekCmp} />
      </div>

      <AttendanceChart series={attendanceSeries} />
      <p className="max-w-2xl text-zinc-500">
        Тижневий об&apos;єм по базових вправах. Розминка не враховується. Дата береться з кожного
        тренування — можна планувати наперед.
      </p>
      <WeeklyCharts series={volumeSeries} />
    </div>
  );
}
