import type { Workout } from "@prisma/client";
import { addWeeks, startOfWeek } from "date-fns";

export type WeeklyAttendanceRow = {
  weekStartIso: string;
  weekLabel: string;

  workoutCount: number;

  weekDelta: number;

  cumulative: number;
};

export function buildWeeklyAttendanceSeries(
  workouts: Pick<Workout, "date">[],
): WeeklyAttendanceRow[] {
  if (workouts.length === 0) return [];

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  let firstWeek = startOfWeek(workouts[0].date, { weekStartsOn: 1 });
  for (const w of workouts) {
    const sw = startOfWeek(w.date, { weekStartsOn: 1 });
    if (sw < firstWeek) firstWeek = sw;
  }

  let lastWorkoutWeek = firstWeek;
  for (const w of workouts) {
    const sw = startOfWeek(w.date, { weekStartsOn: 1 });
    if (sw > lastWorkoutWeek) lastWorkoutWeek = sw;
  }

  const rangeEnd = lastWorkoutWeek > currentWeekStart ? lastWorkoutWeek : currentWeekStart;

  const counts = new Map<string, number>();
  for (const w of workouts) {
    const sw = startOfWeek(w.date, { weekStartsOn: 1 });
    const key = sw.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const rows: WeeklyAttendanceRow[] = [];
  let cursor = firstWeek;
  let cumulative = 0;

  while (cursor <= rangeEnd) {
    const key = cursor.toISOString().slice(0, 10);
    const workoutCount = counts.get(key) ?? 0;
    const weekDelta = workoutCount >= 3 ? 1 : -(3 - workoutCount);
    cumulative += weekDelta;

    const weekEnd = new Date(cursor.getTime() + 6 * 24 * 60 * 60 * 1000);
    const weekLabel =
      cursor.toLocaleDateString("uk-UA", { day: "2-digit", month: "short" }) +
      " — " +
      weekEnd.toLocaleDateString("uk-UA", { day: "2-digit", month: "short" });

    rows.push({
      weekStartIso: key,
      weekLabel,
      workoutCount,
      weekDelta,
      cumulative,
    });

    cursor = addWeeks(cursor, 1);
  }

  return rows;
}
