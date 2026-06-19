import { test, expect } from "@playwright/test";
import { addExerciseWithOneSet, createEmptyWorkout, login } from "./helpers";

test.describe("тренування: підхід і таймер", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await createEmptyWorkout(page);
  });

  test("додає вправу, підхід і запускає таймер відпочинку", async ({ page }) => {
    await addExerciseWithOneSet(page, "Жим тест");

    await expect(page.getByText("Таймер відпочинку")).toBeVisible();
    await page.getByRole("button", { name: "Старт", exact: true }).click();
    await expect(page.getByRole("button", { name: "Стоп", exact: true })).toBeVisible();
  });
});
