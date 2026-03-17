const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:3200";

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

  await page.getByRole("button", { name: /프로모션 배너/i }).click();
  await page.getByRole("button", { name: "새 배너" }).click();
  await page.locator('select[name="displayItemSectionCode"]').selectOption("PROMOTION");
  await page.locator('input[name="displayItemTitle"]').fill(bannerTitle);
  await page.locator('textarea[name="displayItemSubtitle"]').fill("운영자가 직접 생성한 프로모션 배너입니다.");
  await page.locator('input[name="displayItemImageUrl"]').fill("/images/products/kitchen-03.jpg");
  await page.locator('input[name="displayItemImageAlt"]').fill(`${bannerTitle} image`);
  await page.locator('input[name="displayItemHref"]').fill("/search?category=kitchen");
  await page.locator('input[name="displayItemCtaLabel"]').fill("프로모션 보기");
  await page.locator('input[name="displayItemAccentColor"]').fill("#245d5a");
  await page.getByRole("button", { name: "배너 추가" }).click();
  await expect(page.getByText("배너를 추가했습니다.")).toBeVisible();

  await page.getByRole("button", { name: "새 카테고리" }).click();
  await page.locator('input[name="categorySlug"]').fill(categorySlug);
  await page.locator('input[name="categoryName"]').fill(categoryName);
  await page.locator('textarea[name="categoryDescription"]').fill("운영 검증용 카테고리");
  await page.locator('input[name="categoryAccentColor"]').fill("#4a6b8a");
  await page.locator('input[name="categoryDisplayOrder"]').fill("5");
  await page.locator('input[name="categoryCoverImageUrl"]').fill("/images/products/living-02.jpg");
  await page.locator('input[name="categoryCoverImageAlt"]').fill(`${categoryName} cover`);
  await page.locator('input[name="categoryHeroTitle"]').fill(`${categoryName} Hero`);
  await page.locator('textarea[name="categoryHeroSubtitle"]').fill("브라우저 QA에서 생성한 카테고리입니다.");
  await page.getByRole("button", { name: "카테고리 생성" }).click();
  await expect(page.getByText("카테고리를 생성했습니다.")).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: bannerTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: `${categoryName} Hero` })).toBeVisible();

  await page.goto(`${adminUrl}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: new RegExp(categoryName) }).click();
  await page.getByRole("button", { name: "카테고리 삭제" }).click();
  await expect(page.getByText("카테고리를 삭제했습니다.")).toBeVisible();

  await page.getByRole("button", { name: /프로모션 배너/i }).click();
  await page.getByRole("button", { name: new RegExp(bannerTitle) }).click();
  await page.getByRole("button", { name: "배너 삭제" }).click();
  await expect(page.getByText("배너를 삭제했습니다.")).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: bannerTitle })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: `${categoryName} Hero` })).toHaveCount(0);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "14-admin-display-category.png"),
    fullPage: true,
  });
});
