const { expect, test } = require("playwright/test");

test("catalog display sections and search filters work", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "신상품 드롭" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "베스트셀러" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "카테고리 셀렉션" })).toBeVisible();

  await page.goto("/search", { waitUntil: "networkidle" });
  await page.locator("form select").selectOption("kitchen");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/search\?category=kitchen$/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.locator('a[href*="sort=popular"]').first().click();
  await expect(page).toHaveURL(/sort=popular/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/category/kitchen", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "이번 주 신상품" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "인기 상품" })).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
});
