import { describe, expect, it } from "vitest";
import { templateDisplayName, templateOptionLabel } from "@/lib/template-author-label";

describe("templateDisplayName", () => {
  it("prefers trimmed nickname", () => {
    expect(templateDisplayName({ login: "vadya", nickname: "  Iron  " })).toBe("Iron");
  });

  it("falls back to login", () => {
    expect(templateDisplayName({ login: "vadya", nickname: null })).toBe("vadya");
    expect(templateDisplayName({ login: "vadya", nickname: "   " })).toBe("vadya");
  });
});

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
