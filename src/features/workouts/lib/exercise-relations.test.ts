import { describe, expect, it } from "vitest";
import { buildExerciseBlocks, canHaveChild } from "@/features/workouts/lib/exercise-relations";
import type { ExerciseRow } from "@/features/workouts/lib/workout-session-types";
import { formatWorkoutShareText } from "@/features/workouts/lib/workout-share-text";

function ex(
  partial: Partial<ExerciseRow> & Pick<ExerciseRow, "id" | "name" | "sortOrder">,
): ExerciseRow {
  return {
    baseLift: "NONE",
    parentId: null,
    sets: [],
    ...partial,
  };
}

describe("exercise-relations", () => {
  it("allows children only on base lifts", () => {
    expect(canHaveChild(ex({ id: "1", name: "S", sortOrder: 0, baseLift: "SQUAT" }))).toBe(true);
    expect(canHaveChild(ex({ id: "2", name: "A", sortOrder: 1 }))).toBe(false);
    expect(
      canHaveChild(ex({ id: "3", name: "C", sortOrder: 2, parentId: "1", baseLift: "NONE" })),
    ).toBe(false);
  });

  it("builds combo and single blocks", () => {
    const exercises = [
      ex({ id: "s", name: "Присід", sortOrder: 0, baseLift: "SQUAT" }),
      ex({ id: "c", name: "Пауза", sortOrder: 1, parentId: "s" }),
      ex({ id: "a", name: "Підйоми", sortOrder: 2 }),
    ];
    const blocks = buildExerciseBlocks(exercises);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: "combo", parent: { id: "s" } });
    expect(blocks[1]).toMatchObject({ kind: "single", exercise: { id: "a" } });
  });
});

describe("formatWorkoutShareText children", () => {
  it("nests child under parent", () => {
    const text = formatWorkoutShareText({
      title: "Тест",
      date: new Date("2026-07-31T12:00:00Z"),
      notes: null,
      exercises: [
        {
          id: "s",
          name: "Присід",
          baseLift: "SQUAT",
          parentId: null,
          sets: [{ weightKg: 100, reps: 5, isWarmup: false }],
        },
        {
          id: "c",
          name: "Пауза",
          baseLift: "NONE",
          parentId: "s",
          sets: [{ weightKg: 60, reps: 3, isWarmup: false }],
        },
      ],
    });
    expect(text).toContain("1. Присід");
    expect(text).toContain("↳ Пауза (дочірня)");
    expect(text).not.toMatch(/^2\. Пауза/m);
  });
});
