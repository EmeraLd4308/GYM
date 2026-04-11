import type { WeeklyAttendanceRow } from "@/lib/weekly-attendance";

export function streakWeeksWithThreePlus(rows: WeeklyAttendanceRow[]): number {
  if (rows.length === 0) return 0;
  let streak = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].workoutCount >= 3) streak++;
    else break;
  }
  return streak;
}
