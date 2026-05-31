import { expect, test } from "@playwright/test";

test("user can create a career, build a roster, and simulate a match", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: /team name/i }).fill("System Test FC");
  await page.getByRole("button", { name: /start career/i }).click();

  await expect(page.getByRole("heading", { name: /system test fc/i })).toBeVisible();

  await page.getByRole("button", { name: /zeus/i }).click();
  await page.getByRole("button", { name: /oner/i }).click();
  await page.getByRole("button", { name: /faker/i }).click();
  await page.getByRole("button", { name: /gumayusi/i }).click();
  await page.getByRole("button", { name: /keria/i }).click();

  await page.getByRole("button", { name: /continue to match week/i }).click();
  await page.getByRole("button", { name: /simulate match/i }).click();

  await expect(page.getByText(/winner:/i)).toBeVisible();
});
