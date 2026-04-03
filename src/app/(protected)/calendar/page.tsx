import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { TrainingCalendar } from "@/components/TrainingCalendar";
import { formatDateForInput } from "@/lib/date-local";

export default async function CalendarPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    select: { date: true },
  });

  const workoutDayKeys = [...new Set(workouts.map((w) => formatDateForInput(w.date.toISOString())))];

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-zinc-500">
        Календар за датою тренування: дні з записом підсвічені. Можна гортати місяці.
      </p>
      <TrainingCalendar workoutDayKeys={workoutDayKeys} />
    </div>
  );
}
