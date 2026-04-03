import { describe, expect, it } from "vitest";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";

describe("parseStatsFiltersFromSearchParams", () => {
  it("parses from, to, wMin, wMax", () => {
    const out = parseStatsFiltersFromSearchParams({
      from: "2025-01-01",
      to: "2025-01-31",
      wMin: "50",
      wMax: "120.5",
    });
    expect(out.dateFrom).toBe("2025-01-01");
    expect(out.dateTo).toBe("2025-01-31");
    expect(out.weightMin).toBe(50);
    expect(out.weightMax).toBe(120.5);
  });

  it("returns empty object when params missing", () => {
    expect(parseStatsFiltersFromSearchParams({})).toEqual({});
  });

  it("ignores invalid numbers for weight", () => {
    const out = parseStatsFiltersFromSearchParams({ wMin: "x", wMax: "" });
    expect(out.weightMin).toBeUndefined();
    expect(out.weightMax).toBeUndefined();
  });
});
