const { expect, test } = require("playwright/test");

test("guest account header button routes to auth with next=/account", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const accountButton = page.getByRole("link", { name: /내 정보 보기|로그인 후 내 정보 보기/ });
  await expect(accountButton).toBeVisible();
  await accountButton.click();

  await expect(page).toHaveURL(/\/auth\?tab=login&next=%2Faccount$/);
});
