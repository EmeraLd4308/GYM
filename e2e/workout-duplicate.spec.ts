import { test, expect } from "@playwright/test";
import { addExerciseWithOneSet, createEmptyWorkout, login } from "./helpers";

test.describe("дублювання тренування", () => {
  test("копіює тренування на сьогодні", async ({ page }) => {
    await login(page);
    await createEmptyWorkout(page);
    await addExerciseWithOneSet(page, "Присяд");

    await page.getByRole("button", { name: "Копія на сьогодні" }).click();
    await expect(page).toHaveURL(/\/workouts\/[^/]+$/);
    await expect(page.getByLabel("Назва тренування")).toBeVisible({ timeout: 20_000 });
  });
});
