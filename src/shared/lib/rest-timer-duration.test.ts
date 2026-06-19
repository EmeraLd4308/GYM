import { describe, expect, it } from "vitest";
import {
  commitRestDurationFromMinutesField,
  formatMinutesForInput,
  formatRestTimerPresetLabel,
  minutesToSec,
  parseMinutesInput,
} from "@/shared/lib/rest-timer-duration";

describe("rest-timer-duration", () => {
  it("converts minutes to seconds", () => {
    expect(minutesToSec(3)).toBe(180);
    expect(minutesToSec(1.5)).toBe(90);
    expect(minutesToSec(0.5)).toBe(30);
  });

  it("commits from minutes field", () => {
    expect(commitRestDurationFromMinutesField("3", 180)).toBe(180);
    expect(commitRestDurationFromMinutesField("1.5", 180)).toBe(90);
    expect(commitRestDurationFromMinutesField("1,5", 180)).toBe(90);
    expect(commitRestDurationFromMinutesField("", 180)).toBe(180);
  });

  it("parses minute strings", () => {
    expect(parseMinutesInput("2")).toBe(2);
    expect(parseMinutesInput("0")).toBeNull();
  });

  it("formats minutes for input", () => {
    expect(formatMinutesForInput(180)).toBe("3");
    expect(formatMinutesForInput(90)).toBe("1.5");
  });

  it("formats preset labels", () => {
    expect(formatRestTimerPresetLabel(420)).toBe("7 хв");
  });
});
