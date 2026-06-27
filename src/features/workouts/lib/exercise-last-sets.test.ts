import { describe, expect, it } from "vitest";
import { setsCreateFromSnapshot, type ExerciseSetSnapshot } from "@/features/workouts/lib/exercise-last-sets";
import { Prisma } from "@prisma/client";

function snap(partial: Partial<ExerciseSetSnapshot> & Pick<ExerciseSetSnapshot, "sortOrder" | "reps">): ExerciseSetSnapshot {
  return {
    weightKg: new Prisma.Decimal(100),
    isWarmup: false,
    rpe: null,
    ...partial,
  };
}

describe("setsCreateFromSnapshot", () => {
  it("maps sets without rpe when null", () => {
    expect(setsCreateFromSnapshot([snap({ sortOrder: 0, reps: 5 })])).toEqual([
      { sortOrder: 0, weightKg: new Prisma.Decimal(100), reps: 5, isWarmup: false },
    ]);
  });

  it("includes rpe when present", () => {
    const rpe = new Prisma.Decimal(8.5);
    expect(setsCreateFromSnapshot([snap({ sortOrder: 1, reps: 3, rpe })])).toEqual([
      {
        sortOrder: 1,
        weightKg: new Prisma.Decimal(100),
        reps: 3,
        isWarmup: false,
        rpe,
      },
    ]);
  });
});
