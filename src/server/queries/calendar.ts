import { prisma } from "@/shared/lib/prisma";
import { formatDateForInput } from "@/shared/lib/date-local";
import { strongerWorkoutTag } from "@/features/workouts/lib/workout-tags";

export async function getCalendarPageData(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    select: { date: true, autoTag: true },
  });

  const workoutDayKeys = [
    ...new Set(workouts.map((w) => formatDateForInput(w.date.toISOString()))),
  ];

  const dayTagByKey: Record<string, "HEAVY" | "MEDIUM" | "LIGHT"> = {};
  for (const w of workouts) {
    if (!w.autoTag) continue;
    const key = formatDateForInput(w.date.toISOString());
    const next = strongerWorkoutTag(dayTagByKey[key], w.autoTag);
    if (next) dayTagByKey[key] = next;
  }

  return { workoutDayKeys, dayTagByKey };
}
