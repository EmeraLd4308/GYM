import { describe, expect, it, vi } from "vitest";
import { applyOrderedSortOrderUpdates } from "./sort-order-update";

describe("applyOrderedSortOrderUpdates", () => {
  it("writes temp offsets then final indices in order", async () => {
    const calls: Array<[string, number]> = [];
    const update = vi.fn(async (id: string, sortOrder: number) => {
      calls.push([id, sortOrder]);
    });

    await applyOrderedSortOrderUpdates(["a", "b", "c"], update);

    expect(calls).toEqual([
      ["a", 1_000_000],
      ["b", 1_000_001],
      ["c", 1_000_002],
      ["a", 0],
      ["b", 1],
      ["c", 2],
    ]);
  });
});
