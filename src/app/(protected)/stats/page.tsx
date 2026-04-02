import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { buildWeeklyVolumeSeries } from "@/lib/weekly-volume";
import { WeeklyCharts } from "@/components/WeeklyCharts";

export default async function StatsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  const series = buildWeeklyVolumeSeries(workouts);

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-zinc-500">
        Тижневий об&apos;єм по базових вправах. Розминка не враховується. Дата береться з кожного
        тренування — можна планувати наперед.
      </p>
      <WeeklyCharts series={series} />
    </div>
  );
}
