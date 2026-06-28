import { describe, expect, it } from "vitest";
import { formatWeekProgramText } from "@/features/workouts/lib/week-program-text";

describe("formatWeekProgramText", () => {
  it("formats day and exercise order without sets", () => {
    const text = formatWeekProgramText("2026-06-22", "2026-06-28", [
      {
        date: new Date("2026-06-27T10:00:00"),
        title: "Силове A",
        exercises: [{ name: "Присід" }, { name: "  Жим  " }],
      },
    ]);
    expect(text).toContain("SBD · План тижня");
    expect(text).toContain("Силове A");
    expect(text).toContain("1. Присід");
    expect(text).toContain("2. Жим");
    expect(text).not.toContain("кг");
  });

  it("uses default title when missing", () => {
    const text = formatWeekProgramText("2026-06-22", "2026-06-28", [
      {
        date: new Date("2026-06-27T10:00:00"),
        exercises: [{ name: "Присід" }],
      },
    ]);
    expect(text).toContain("Тренування");
  });

  it("handles empty week", () => {
    const text = formatWeekProgramText("2026-06-22", "2026-06-28", []);
    expect(text).toContain("На цьому тижні тренувань немає.");
  });
});
