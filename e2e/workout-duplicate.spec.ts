import { test, expect } from "@playwright/test";

test.describe("дублювання тренування", () => {
  test("копіює тренування на сьогодні", async ({ page }) => {
    const login = `pw${Date.now()}`;
    await page.goto("/");
    await page.getByLabel("Твій нік").fill(login);
    await page.getByRole("button", { name: "Увійти" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/workouts/new");
    await page.getByRole("button", { name: "Створити" }).click();
    await expect(page).toHaveURL(/\/workouts\/[^/]+$/);

    await page.getByPlaceholder("Назва вправи").fill("Присяд");
    await page.getByRole("button", { name: "Додати", exact: true }).click();
    await expect(page.getByText("Підхід 1")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Копія на сьогодні" }).click();
    await expect(page).toHaveURL(/\/workouts\/[^/]+$/);
    await expect(page.getByLabel("Назва тренування")).toBeVisible({ timeout: 20_000 });
  });
});
