import { describe, expect, it } from "vitest";
import { workoutListWhere } from "@/lib/workout-list-where";

describe("workoutListWhere", () => {
  it("scopes by userId only when no filters", () => {
    expect(workoutListWhere("user-1", {})).toEqual({ userId: "user-1" });
  });

  it("adds weight filter for base lifts when weight range set", () => {
    const w = workoutListWhere("u", { weightMin: 100 });
    expect(w.userId).toBe("u");
    expect(w.exercises).toMatchObject({
      some: {
        baseLift: { in: ["BENCH", "SQUAT", "DEADLIFT"] },
        sets: {
          some: {
            isWarmup: false,
            weightKg: { gte: 100 },
          },
        },
      },
    });
  });
});
