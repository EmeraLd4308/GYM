import { test, expect } from "@playwright/test";

test.describe("реєстрація та нове тренування", () => {
  test("користувач реєструється і створює порожнє тренування", async ({ page }) => {
    const login = `pw${Date.now()}`;
    await page.goto("/");
    await page.getByLabel("Логін").fill(login);
    await page.getByRole("button", { name: "Реєстрація" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Головна" })).toBeVisible();

    await page.goto("/workouts/new");
    await page.getByRole("button", { name: "Створити" }).click();
    await expect(page).toHaveURL(/\/workouts\/[^/]+$/);
    await expect(page.getByRole("button", { name: "Видалити" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel("Назва тренування")).toBeVisible();
  });
});
