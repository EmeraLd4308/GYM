import { describe, expect, it } from "vitest";
import { buildApproachMapPoints } from "@/features/stats/lib/approach-map";

describe("buildApproachMapPoints", () => {
  it("maps working SBD sets to reps and % of profile max", () => {
    const { points, hints } = buildApproachMapPoints(
      [
        {
          id: "w1",
          date: new Date("2026-06-10T12:00:00"),
          exercises: [
            {
              id: "e1",
              baseLift: "SQUAT",
              sets: [
                { id: "s1", isWarmup: true, weightKg: 60, reps: 5 },
                { id: "s2", isWarmup: false, weightKg: 100, reps: 5 },
              ],
            },
          ],
        },
      ] as never,
      { squat: 200, bench: null, deadlift: null },
    );

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ reps: 5, percentMax: 50, lift: "squat", weightKg: 100 });
    expect(hints.noTraining).toBe(false);
    expect(hints.missingMaxLifts).toEqual([]);
  });

  it("includes sets without profile max but flags missing max", () => {
    const { points, hints } = buildApproachMapPoints(
      [
        {
          id: "w1",
          date: new Date("2026-06-10T12:00:00"),
          exercises: [
            {
              id: "e1",
              baseLift: "BENCH",
              sets: [{ id: "s1", isWarmup: false, weightKg: 80, reps: 3 }],
            },
          ],
        },
      ] as never,
      { squat: null, bench: null, deadlift: null },
    );

    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ weightKg: 80, percentMax: null });
    expect(hints.noTraining).toBe(false);
    expect(hints.missingMaxLifts).toContain("bench");
  });
});
