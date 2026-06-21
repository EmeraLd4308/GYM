import { describe, expect, it } from "vitest";
import { countWorkingSets, workingSetNumber } from "./working-set-number";

describe("workingSetNumber", () => {
  const sets = [
    { isWarmup: true },
    { isWarmup: false },
    { isWarmup: false },
    { isWarmup: true },
    { isWarmup: false },
  ];

  it("returns null for warmup sets", () => {
    expect(workingSetNumber(sets, 0)).toBeNull();
    expect(workingSetNumber(sets, 3)).toBeNull();
  });

  it("counts only working sets in order", () => {
    expect(workingSetNumber(sets, 1)).toBe(1);
    expect(workingSetNumber(sets, 2)).toBe(2);
    expect(workingSetNumber(sets, 4)).toBe(3);
  });
});

describe("countWorkingSets", () => {
  it("excludes warmups", () => {
    expect(
      countWorkingSets([
        { isWarmup: true },
        { isWarmup: false },
        { isWarmup: false },
      ]),
    ).toBe(2);
  });
});
