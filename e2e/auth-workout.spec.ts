import { test, expect } from "@playwright/test";
import { createEmptyWorkout, login } from "./helpers";

test.describe("реєстрація та нове тренування", () => {
  test("користувач реєструється і створює порожнє тренування", async ({ page }) => {
    await login(page);
    await createEmptyWorkout(page);
    await expect(page.getByRole("button", { name: "Видалити" })).toBeVisible();
    await expect(page.getByLabel("Назва тренування")).toBeVisible();
  });
});
