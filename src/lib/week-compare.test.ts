import { describe, expect, it } from "vitest";
import type { WeeklyVolumeRow } from "@/lib/weekly-volume";
import { compareLastTwoWeeks } from "@/lib/week-compare";

function vol(
  bench: number,
  squat: number,
  deadlift: number,
  weekLabel: string,
): WeeklyVolumeRow {
  return {
    weekStartIso: "",
    weekLabel,
    bench,
    squat,
    deadlift,
  };
}

describe("compareLastTwoWeeks", () => {
  it("returns null when fewer than 2 weeks", () => {
    expect(compareLastTwoWeeks([vol(1, 2, 3, "W1")])).toBeNull();
    expect(compareLastTwoWeeks([])).toBeNull();
  });

  it("compares last two weeks", () => {
    const series = [vol(10, 20, 30, "A"), vol(100, 200, 300, "B")];
    const c = compareLastTwoWeeks(series);
    expect(c).not.toBeNull();
    expect(c!.prev.bench).toBe(10);
    expect(c!.curr.bench).toBe(100);
    expect(c!.prev.weekLabel).toBe("A");
    expect(c!.curr.weekLabel).toBe("B");
  });
});
