import { describe, expect, it } from "vitest";
import { calendarWeekBounds, dateKeyInWeek } from "@/shared/lib/calendar-week";

describe("calendarWeekBounds", () => {
  it("returns monday-sunday for a wednesday", () => {
    const wed = new Date(2026, 5, 17, 12, 0, 0);
    const { weekStart, weekEnd } = calendarWeekBounds(wed);
    expect(weekStart).toBe("2026-06-15");
    expect(weekEnd).toBe("2026-06-21");
  });

  it("dateKeyInWeek respects bounds", () => {
    expect(dateKeyInWeek("2026-06-17T10:00:00.000Z", "2026-06-15", "2026-06-21")).toBe(true);
    expect(dateKeyInWeek("2026-06-22T10:00:00.000Z", "2026-06-15", "2026-06-21")).toBe(false);
  });
});
