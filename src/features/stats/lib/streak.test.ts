import { describe, expect, it } from "vitest";
import type { WeeklyAttendanceRow } from "@/features/stats/lib/weekly-attendance";
import {
  buildStreakWeekChips,
  streakStatusMessage,
  streakWeeksWithThreePlus,
} from "@/features/stats/lib/streak";

function row(count: number, weekStartIso = "2026-01-05"): WeeklyAttendanceRow {
  return {
    weekStartIso,
    weekLabel: weekStartIso,
    workoutCount: count,
    weekDelta: 0,
    cumulative: 0,
  };
}

describe("streakWeeksWithThreePlus", () => {
  it("returns 0 for empty series", () => {
    expect(streakWeeksWithThreePlus([])).toBe(0);
  });

  it("counts trailing weeks with ≥3 workouts from end of array", () => {
    const rows = [row(2), row(3), row(4), row(3)];
    expect(streakWeeksWithThreePlus(rows)).toBe(3);
  });

  it("stops at first week below 3 from the end", () => {
    const rows = [row(3), row(2), row(3), row(3)];
    expect(streakWeeksWithThreePlus(rows)).toBe(2);
  });
});

describe("buildStreakWeekChips", () => {
  it("marks trailing qualifying weeks as inStreak", () => {
    const rows = [
      row(1, "2026-01-05"),
      row(3, "2026-01-12"),
      row(4, "2026-01-19"),
      row(2, "2026-01-26"),
    ];
    const chips = buildStreakWeekChips(rows, 4);
    expect(chips.map((c) => c.inStreak)).toEqual([false, false, false, false]);
    expect(chips.at(-1)?.isCurrentWeek).toBe(true);
  });

  it("highlights active streak weeks", () => {
    const rows = [row(2), row(3), row(4), row(3)];
    const chips = buildStreakWeekChips(rows, 4);
    expect(chips.map((c) => c.inStreak)).toEqual([false, true, true, true]);
  });
});

describe("streakStatusMessage", () => {
  it("describes active streak", () => {
    expect(streakStatusMessage(3, 4)).toContain("3");
    expect(streakStatusMessage(3, 4)).toContain("тижні");
  });

  it("describes current week progress when streak is broken", () => {
    expect(streakStatusMessage(0, 2)).toContain("2/3");
  });
});
