import { describe, expect, it } from "vitest";
import type { WeeklySbdPeakRow } from "@/lib/weekly-volume";
import type { WeeklySbdRpeRow } from "@/lib/weekly-rpe";
import { compareLastTwoWeeks, compareLastTwoWeeksRpe } from "@/lib/week-compare";

function peak(bench: number, squat: number, deadlift: number, weekLabel: string): WeeklySbdPeakRow {
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
    expect(compareLastTwoWeeks([peak(1, 2, 3, "W1")])).toBeNull();
    expect(compareLastTwoWeeks([])).toBeNull();
  });

  it("compares last two weeks", () => {
    const series = [peak(10, 20, 30, "A"), peak(100, 200, 300, "B")];
    const c = compareLastTwoWeeks(series);
    expect(c).not.toBeNull();
    expect(c!.prev.bench).toBe(10);
    expect(c!.curr.bench).toBe(100);
    expect(c!.prev.weekLabel).toBe("A");
    expect(c!.curr.weekLabel).toBe("B");
  });
});

function rpeRow(
  bench: number | null,
  squat: number | null,
  deadlift: number | null,
  weekLabel: string,
): WeeklySbdRpeRow {
  return { weekStartIso: "", weekLabel, bench, squat, deadlift };
}

describe("compareLastTwoWeeksRpe", () => {
  it("returns null when fewer than 2 weeks", () => {
    expect(compareLastTwoWeeksRpe([rpeRow(8, null, 7, "W1")])).toBeNull();
  });

  it("compares last two weeks with nullable lifts", () => {
    const c = compareLastTwoWeeksRpe([rpeRow(8, 7, null, "A"), rpeRow(9, 7.5, 8, "B")]);
    expect(c).not.toBeNull();
    expect(c!.prev.bench).toBe(8);
    expect(c!.curr.bench).toBe(9);
    expect(c!.prev.deadlift).toBeNull();
  });
});
