import { describe, expect, it } from "vitest";
import { parseDraftExercises } from "@/features/workouts/components/NewWorkoutCustomExercises";

describe("parseDraftExercises", () => {
  it("trims names and drops empty rows", () => {
    expect(
      parseDraftExercises([
        { clientKey: "a", name: "  Жим  ", baseLift: "NONE" },
        { clientKey: "b", name: "   ", baseLift: "BENCH" },
      ]),
    ).toEqual([{ name: "Жим", baseLift: "NONE" }]);
  });
});
