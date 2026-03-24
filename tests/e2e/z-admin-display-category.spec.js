const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:4200";

test("admin can manage display banners and categories", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const bannerTitle = `Campaign ${uniqueId}`;
  const categoryName = `Objects ${uniqueId}`;
  const categorySlug = `objects-${uniqueId}`;

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(`${adminUrl}/`);

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  await page.locator('select[name="displayItemSectionCode"]').selectOption("PROMOTION");
  await page.locator('input[name="displayItemTitle"]').fill(bannerTitle);
  await page.locator('textarea[name="displayItemSubtitle"]').fill("Created from Playwright.");
  await page.locator('input[name="displayItemImageUrl"]').fill("/images/products/kitchen-03.jpg");
  await page.locator('input[name="displayItemImageAlt"]').fill(`${bannerTitle} image`);
  await page.locator('input[name="displayItemHref"]').fill("/search?category=kitchen");
  await page.locator('input[name="displayItemCtaLabel"]').fill("Open campaign");
  await page.locator('input[name="displayItemAccentColor"]').fill("#245d5a");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="displayItemTitle"]') })
    .getByRole("button")
    .first()
    .click();
  await expect(page.locator('input[name="displayItemTitle"]')).toHaveValue(bannerTitle);

  await page.goto(`${adminUrl}/products`, { waitUntil: "networkidle" });
  await page
    .locator("article")
    .filter({ hasText: "Categories" })
    .getByRole("button")
    .first()
    .click();
  await page.locator('input[name="categorySlug"]').fill(categorySlug);
  await page.locator('input[name="categoryName"]').fill(categoryName);
  await page.locator('textarea[name="categoryDescription"]').fill("Category created from Playwright.");
  await page.locator('input[name="categoryAccentColor"]').fill("#4a6b8a");
  await page.locator('input[name="categoryDisplayOrder"]').fill("5");
  await page.locator('input[name="categoryCoverImageUrl"]').fill("/images/products/living-02.jpg");
  await page.locator('input[name="categoryCoverImageAlt"]').fill(`${categoryName} cover`);
  await page.locator('input[name="categoryHeroTitle"]').fill(`${categoryName} Hero`);
  await page.locator('textarea[name="categoryHeroSubtitle"]').fill("Category subtitle from Playwright.");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="categorySlug"]') })
    .getByRole("button")
    .first()
    .click();
  await expect(page.locator("article").filter({ hasText: categoryName })).toBeVisible();

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "14-admin-display-category.png"),
    fullPage: true,
  });
});
