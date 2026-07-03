import type { WeeklyAttendanceRow } from "@/features/stats/lib/weekly-attendance";

export const STREAK_MIN_WORKOUTS = 3;

export function streakWeeksWithThreePlus(rows: WeeklyAttendanceRow[]): number {
  if (rows.length === 0) return 0;
  let streak = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].workoutCount >= STREAK_MIN_WORKOUTS) streak++;
    else break;
  }
  return streak;
}

export type StreakWeekChip = {
  weekLabel: string;
  shortLabel: string;
  workoutCount: number;
  qualifies: boolean;
  inStreak: boolean;
  isCurrentWeek: boolean;
};

export function formatStreakWeekShortLabel(weekStartIso: string): string {
  const d = new Date(`${weekStartIso}T12:00:00`);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export function buildStreakWeekChips(
  rows: WeeklyAttendanceRow[],
  maxWeeks = 8,
): StreakWeekChip[] {
  if (rows.length === 0) return [];

  const slice = rows.slice(-maxWeeks);
  const streak = streakWeeksWithThreePlus(rows);
  const streakStartIdx = rows.length - streak;
  const currentIdx = rows.length - 1;

  return slice.map((row, i) => {
    const globalIdx = rows.length - slice.length + i;
    return {
      weekLabel: row.weekLabel,
      shortLabel: formatStreakWeekShortLabel(row.weekStartIso),
      workoutCount: row.workoutCount,
      qualifies: row.workoutCount >= STREAK_MIN_WORKOUTS,
      inStreak: streak > 0 && globalIdx >= streakStartIdx,
      isCurrentWeek: globalIdx === currentIdx,
    };
  });
}

export function streakStatusMessage(
  weeks: number,
  currentWeekCount: number,
): string {
  const remaining = STREAK_MIN_WORKOUTS - currentWeekCount;

  if (weeks > 0) {
    const weekWord = weeks === 1 ? "тиждень" : weeks < 5 ? "тижні" : "тижнів";
    return `${weeks} ${weekWord} підряд з ≥${STREAK_MIN_WORKOUTS} тренуваннями`;
  }

  if (currentWeekCount >= STREAK_MIN_WORKOUTS) {
    return `Цей тиждень виконано — ${currentWeekCount} тренувань`;
  }

  if (currentWeekCount === 0) {
    return `Почни серію — щонайменше ${STREAK_MIN_WORKOUTS} тренування цього тижня`;
  }

  const needWord = remaining === 1 ? "тренування" : "тренування";
  return `Цей тиждень: ${currentWeekCount}/${STREAK_MIN_WORKOUTS} — ще ${remaining} ${needWord} для серії`;
}
