import { describe, expect, it } from "vitest";
import type { WeeklyAttendanceRow } from "@/lib/weekly-attendance";
import { streakWeeksWithThreePlus } from "@/lib/streak";

function row(count: number): WeeklyAttendanceRow {
  return {
    weekStartIso: "",
    weekLabel: "",
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
