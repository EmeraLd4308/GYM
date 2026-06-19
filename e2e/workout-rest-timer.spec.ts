import { test, expect } from "@playwright/test";

test.describe("тренування: підхід і таймер", () => {
  test.beforeEach(async ({ page }) => {
    const login = `pw${Date.now()}`;
    await page.goto("/");
    await page.getByLabel("Твій нік").fill(login);
    await page.getByRole("button", { name: "Увійти" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/workouts/new");
    await page.getByRole("button", { name: "Створити" }).click();
    await expect(page).toHaveURL(/\/workouts\/[^/]+$/);
    await expect(page.getByLabel("Назва тренування")).toBeVisible({ timeout: 20_000 });
  });

  test("додає вправу, підхід і показує таймер відпочинку", async ({ page }) => {
    await page.getByPlaceholder("Назва вправи").fill("Жим тест");
    await page.getByRole("button", { name: "Додати", exact: true }).click();

    await expect(page.getByText("Підхід 1")).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText("Таймер відпочинку")).toBeVisible();
    await page.getByRole("button", { name: "Старт", exact: true }).click();
    await expect(page.getByText(/Залишилось/)).toBeVisible();
  });
});
