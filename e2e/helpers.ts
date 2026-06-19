import { expect, type Page } from "@playwright/test";

export async function login(page: Page): Promise<string> {
  const loginName = `pw${Date.now()}`;
  await page.goto("/");
  await page.getByLabel("Твій нік").fill(loginName);
  await page.getByRole("button", { name: "Увійти" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Привіт,/ })).toBeVisible();
  return loginName;
}

export async function createEmptyWorkout(page: Page): Promise<void> {
  await page.goto("/workouts/new");
  await page.getByRole("button", { name: "Створити тренування" }).click();
  await expect(page).toHaveURL(/\/workouts\/[^/]+$/);
  await expect(page.getByLabel("Назва тренування")).toBeVisible({ timeout: 20_000 });
}

export async function addExerciseWithOneSet(page: Page, exerciseName: string): Promise<void> {
  await page.getByPlaceholder("Назва вправи").fill(exerciseName);
  await page.getByRole("button", { name: "Додати", exact: true }).click();
  await page.getByRole("button", { name: "+1", exact: true }).click();
  await expect(page.locator('input[inputmode="decimal"]').first()).toBeVisible({ timeout: 10_000 });
}
