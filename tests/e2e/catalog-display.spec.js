const { expect, test } = require("playwright/test");

test("catalog display sections, recommendations, and search filters work", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('form[action="/search"] input[name="q"]')).toBeVisible();
  await expect(page.locator('a[href^="/category/"]').first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/products/linen-bed-set", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/search?q=linen%20living", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/q=linen%20living/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/search?q=linen%20living&category=kitchen", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/category=kitchen/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/category/kitchen", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
});
