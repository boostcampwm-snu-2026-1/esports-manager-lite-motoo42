import { expect, test } from "@playwright/test";

test("acceptance: roster confirmation requires all five roles", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /start career/i }).click();

  await expect(page.getByText("Missing top player.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /continue to match week/i }),
  ).toBeDisabled();
});
