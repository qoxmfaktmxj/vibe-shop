const { expect, test } = require("playwright/test");

test("catalog display sections, recommendations, and search filters work", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('form[action="/search"] input[name="q"]')).toBeVisible();
  await expect(page.locator('a[href^="/category/"]').first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/products/linen-bed-set", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByRole("textbox").first().fill("linen living");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.locator("form select").selectOption("kitchen");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/category=kitchen/);
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/category/kitchen", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
});
