import { describe, expect, it } from "vitest";
import {
  ipfGlPointsBenchPress,
  ipfGlPointsPowerliftingTotal,
  ipfGlProfilePreview,
} from "@/lib/ipf-gl";

describe("ipf-gl", () => {
  it("computes classic men powerlifting total", () => {
    const pts = ipfGlPointsPowerliftingTotal(200, 140, 240, 80, "MALE", "CLASSIC");
    expect(pts).not.toBeNull();
    expect(pts!).toBeGreaterThan(0);
    expect(pts!).toBeLessThan(200);
  });

  it("computes classic women bench", () => {
    const pts = ipfGlPointsBenchPress(100, 70, "FEMALE", "CLASSIC");
    expect(pts).not.toBeNull();
    expect(pts!).toBeGreaterThan(0);
  });
});

describe("ipfGlProfilePreview", () => {
  it("uses total when SBD complete", () => {
    const r = ipfGlProfilePreview({
      bodyweightKg: 80,
      squatKg: 200,
      benchKg: 130,
      deadliftKg: 230,
      sex: "MALE",
      equipment: "CLASSIC",
    });
    expect(r.kind).toBe("total");
    if (r.kind === "total") expect(r.points).toBeGreaterThan(0);
  });

  it("falls back to bench when SBD incomplete", () => {
    const r = ipfGlProfilePreview({
      bodyweightKg: 80,
      squatKg: null,
      benchKg: 140,
      deadliftKg: null,
      sex: "MALE",
      equipment: "CLASSIC",
    });
    expect(r.kind).toBe("bench");
  });
});
