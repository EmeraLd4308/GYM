import { describe, expect, it } from "vitest";
import {
  WORKOUT_LIST_PAGE_SIZE_DEFAULT,
  parseWorkoutListPageSize,
  workoutListPageSizeOptionsForTotal,
} from "@/lib/workout-list-page-size";

describe("parseWorkoutListPageSize", () => {
  it("defaults to 6", () => {
    expect(parseWorkoutListPageSize(undefined)).toBe(WORKOUT_LIST_PAGE_SIZE_DEFAULT);
    expect(parseWorkoutListPageSize("")).toBe(WORKOUT_LIST_PAGE_SIZE_DEFAULT);
    expect(parseWorkoutListPageSize("bogus")).toBe(WORKOUT_LIST_PAGE_SIZE_DEFAULT);
  });

  it("accepts canonical steps", () => {
    expect(parseWorkoutListPageSize("12")).toBe(12);
    expect(parseWorkoutListPageSize("60")).toBe(60);
    expect(parseWorkoutListPageSize("72")).toBe(72);
  });
});

describe("workoutListPageSizeOptionsForTotal", () => {
  it("includes steps up to smallest tier that covers total", () => {
    expect(workoutListPageSizeOptionsForTotal(100)).toEqual([
      6, 12, 24, 36, 48, 60, 72, 84, 96, 108,
    ]);
  });

  it("adds 12 when between 6 and 12 workouts", () => {
    expect(workoutListPageSizeOptionsForTotal(10)).toEqual([6, 12]);
  });

  it("uses only 6 when few workouts", () => {
    expect(workoutListPageSizeOptionsForTotal(3)).toEqual([6]);
  });
});
