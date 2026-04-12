import { describe, expect, it } from "vitest";
import { workoutListWhere, workoutListQueryString } from "@/lib/workout-list-where";

describe("workoutListWhere", () => {
  it("scopes by userId only when no filters", () => {
    expect(workoutListWhere("user-1", {})).toEqual({ userId: "user-1" });
  });

  it("adds weight filter for base lifts when weight range set", () => {
    const w = workoutListWhere("u", { weightMin: 100 });
    expect(w).toEqual({
      AND: [
        { userId: "u" },
        {
          exercises: {
            some: {
              baseLift: { in: ["BENCH", "SQUAT", "DEADLIFT"] },
              sets: {
                some: {
                  isWarmup: false,
                  weightKg: { gte: 100 },
                },
              },
            },
          },
        },
      ],
    });
  });

  it("adds search on title or exercise name", () => {
    const w = workoutListWhere("u", { search: "жим" });
    expect(w).toMatchObject({
      AND: [
        { userId: "u" },
        {
          OR: [
            { title: { contains: "жим", mode: "insensitive" } },
            { exercises: { some: { name: { contains: "жим", mode: "insensitive" } } } },
          ],
        },
      ],
    });
  });
});

describe("workoutListQueryString", () => {
  it("includes search q and pagination", () => {
    expect(workoutListQueryString({ dateFrom: "2025-01-01", search: "жим" }, 2, 6)).toBe(
      "from=2025-01-01&q=%D0%B6%D0%B8%D0%BC&page=2",
    );
  });

  it("includes pageSize when not default", () => {
    expect(workoutListQueryString({}, 1, 12)).toBe("pageSize=12");
  });
});
