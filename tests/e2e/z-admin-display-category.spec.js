const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const adminUrl = `${storefrontUrl}/admin`;
const adminEmail =
  process.env.E2E_ADMIN_EMAIL ??
  process.env.APP_DEMO_ADMIN_EMAIL ??
  "admin@maru.local";
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ??
  process.env.APP_DEMO_ADMIN_PASSWORD ??
  "admin1234!";

test("admin can manage display banners and categories", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const bannerTitle = `기획 배너 ${uniqueId}`;
  const categoryName = `오브제 ${uniqueId}`;
  const categorySlug = `objet-${uniqueId}`;

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(adminUrl);

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /New banner/ }).click();
  await page.locator('select[name="displayItemSectionCode"]').selectOption("PROMOTION");
  await page.locator('input[name="displayItemTitle"]').fill(bannerTitle);
  await page
    .locator('textarea[name="displayItemSubtitle"]')
    .fill("브라우저 테스트용 임시 기획 배너입니다.");
  await page.locator('input[name="displayItemImageUrl"]').fill("/images/products/kitchen-03.jpg");
  await page.locator('input[name="displayItemImageAlt"]').fill(`${bannerTitle} 이미지`);
  await page.locator('input[name="displayItemHref"]').fill("/search?category=kitchen");
  await page.locator('input[name="displayItemCtaLabel"]').fill("기획전 보기");
  await page.locator('input[name="displayItemAccentColor"]').fill("#245d5a");
  const bannerForm = page.locator("form").filter({ has: page.locator('input[name="displayItemTitle"]') });
  const createBannerButton = bannerForm.getByRole("button", { name: /Create banner|Update banner/ }).first();
  await expect(createBannerButton).toBeEnabled();
  await createBannerButton.click();
  await expect(page.locator("button").filter({ hasText: bannerTitle }).first()).toBeVisible();
  await expect(page.locator('input[name="displayItemTitle"]')).toHaveValue(bannerTitle);

  await page.goto(`${adminUrl}/products`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /New category|새 카테고리/ }).click();
  await page.locator('input[name="categorySlug"]').fill(categorySlug);
  await page.locator('input[name="categoryName"]').fill(categoryName);
  await page
    .locator('textarea[name="categoryDescription"]')
    .fill("브라우저 테스트용 임시 카테고리입니다.");
  await page.locator('input[name="categoryAccentColor"]').fill("#4a6b8a");
  await page.locator('input[name="categoryDisplayOrder"]').fill("5");
  await page.locator('input[name="categoryCoverImageUrl"]').fill("/images/products/living-02.jpg");
  await page.locator('input[name="categoryCoverImageAlt"]').fill(`${categoryName} 커버`);
  await page.locator('input[name="categoryHeroTitle"]').fill(`${categoryName} 셀렉션`);
  await page
    .locator('textarea[name="categoryHeroSubtitle"]')
    .fill("브라우저 테스트용 임시 카테고리 소개 문구입니다.");
  const categoryForm = page.locator("form").filter({ has: page.locator('input[name="categorySlug"]') });
  const createCategoryButton = categoryForm.getByRole("button", { name: /Create category|Update category/ }).first();
  await expect(createCategoryButton).toBeEnabled();
  await createCategoryButton.click();
  await expect(page.locator("button").filter({ hasText: categoryName }).first()).toBeVisible();

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "14-admin-display-category.png"),
    fullPage: true,
  });
});
