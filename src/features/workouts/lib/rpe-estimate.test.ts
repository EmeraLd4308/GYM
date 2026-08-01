import { describe, expect, it } from "vitest";
import { estimateRpeFromProfileMax } from "@/features/workouts/lib/rpe-estimate";

describe("estimateRpeFromProfileMax", () => {
  const max = 200;

  it("rates ~80% × 5 as hard working effort, not a flat 10", () => {
    const r = estimateRpeFromProfileMax(160, 5, max);
    expect(r).not.toBeNull();
    expect(r as number).toBeGreaterThanOrEqual(8);
    expect(r as number).toBeLessThan(10);
  });

  it("rates ~70% × 5 as solid mid intensity", () => {
    const r = estimateRpeFromProfileMax(140, 5, max);
    expect(r).not.toBeNull();
    expect(r as number).toBeGreaterThanOrEqual(7);
    expect(r as number).toBeLessThan(9);
  });

  it("does not rate ordinary heavy triples as a flat 10", () => {
    const r = estimateRpeFromProfileMax(180, 3, max);
    expect(r).not.toBeNull();
    expect(r as number).toBeLessThan(10);
    expect(r as number).toBeGreaterThanOrEqual(8.5);
  });

  it("rates a true max single as 10", () => {
    expect(estimateRpeFromProfileMax(200, 1, max)).toBe(10);
  });

  it("returns null only for very light sets", () => {
    expect(estimateRpeFromProfileMax(60, 10, max)).toBeNull();
  });

  it("does not call every hard volume set a 10 when e1RM is only slightly above max", () => {
    // 92.5×6 vs 107.5 — hard, but not an automatic 10 after soft ceiling
    const r = estimateRpeFromProfileMax(92.5, 6, 107.5);
    expect(r).not.toBeNull();
    expect(r as number).toBeGreaterThanOrEqual(9);
    expect(r as number).toBeLessThan(10);
  });
});
