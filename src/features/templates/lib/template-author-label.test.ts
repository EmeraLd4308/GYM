import { describe, expect, it } from "vitest";
import { templateOptionLabel } from "@/features/templates/lib/template-author-label";

describe("templateOptionLabel", () => {
  it("includes login in parentheses when nickname exists", () => {
    expect(templateOptionLabel("Ноги", { login: "vadya", nickname: "Iron" })).toBe(
      "Ноги — Iron (vadya)",
    );
  });

  it("uses login only when no nickname", () => {
    expect(templateOptionLabel("Жим", { login: "vadya", nickname: null })).toBe("Жим — vadya");
  });
});
