const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const adminUrl = `${storefrontUrl}/admin`;
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? process.env.APP_DEMO_ADMIN_PASSWORD ?? "admin1234!";

test("admin can manage display banners and categories", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const bannerTitle = `기획 배너 ${uniqueId}`;
  const categoryName = `오브제 ${uniqueId}`;
  const categorySlug = `objet-${uniqueId}`;

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(adminUrl);

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  await page.locator('select[name="displayItemSectionCode"]').selectOption("PROMOTION");
  await page.locator('input[name="displayItemTitle"]').fill(bannerTitle);
  await page.locator('textarea[name="displayItemSubtitle"]').fill("브라우저 테스트에서 생성한 임시 배너입니다.");
  await page.locator('input[name="displayItemImageUrl"]').fill("/images/products/kitchen-03.jpg");
  await page.locator('input[name="displayItemImageAlt"]').fill(`${bannerTitle} 이미지`);
  await page.locator('input[name="displayItemHref"]').fill("/search?category=kitchen");
  await page.locator('input[name="displayItemCtaLabel"]').fill("기획전 보기");
  await page.locator('input[name="displayItemAccentColor"]').fill("#245d5a");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="displayItemTitle"]') })
    .getByRole("button")
    .first()
    .click();
  await expect(page.locator('input[name="displayItemTitle"]')).toHaveValue(bannerTitle);

  await page.goto(`${adminUrl}/products`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "카테고리", exact: true }).click();
  await page.getByRole("button", { name: "새 카테고리", exact: true }).click();
  await expect(page.locator('input[name="categorySlug"]')).toHaveValue("");
  await page.locator('input[name="categorySlug"]').fill(categorySlug);
  await page.locator('input[name="categoryName"]').fill(categoryName);
  await page.locator('textarea[name="categoryDescription"]').fill("브라우저 테스트에서 생성한 임시 카테고리입니다.");
  await page.locator('input[name="categoryAccentColor"]').fill("#4a6b8a");
  await page.locator('input[name="categoryDisplayOrder"]').fill("5");
  await page.locator('input[name="categoryCoverImageUrl"]').fill("/images/products/living-02.jpg");
  await page.locator('input[name="categoryCoverImageAlt"]').fill(`${categoryName} 커버`);
  await page.locator('input[name="categoryHeroTitle"]').fill(`${categoryName} 셀렉션`);
  await page.locator('textarea[name="categoryHeroSubtitle"]').fill("브라우저 테스트용 임시 카테고리 서브타이틀입니다.");
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

  await page
    .locator("form")
    .filter({ has: page.locator('input[name="categorySlug"]') })
    .getByRole("button", { name: "카테고리 삭제" })
    .click();
  await expect(page.getByRole("button", { name: new RegExp(categoryName) })).toHaveCount(0);

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /기획전 PROMOTION/ }).click();
  await page.getByRole("button", { name: new RegExp(bannerTitle) }).click();
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="displayItemTitle"]') })
    .getByRole("button", { name: "Delete banner" })
    .click();
});
