const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const adminUrl = `${storefrontUrl}/admin`;
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? process.env.APP_DEMO_ADMIN_PASSWORD ?? "admin1234!";

test("admin dashboard can manage display, products, and order status", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const heroTitle = `운영 메인 카피 ${uniqueId}`;

  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await page
    .getByRole("complementary")
    .getByRole("button", { name: /장바구니 담기|Add to Bag/ })
    .click();
  await expect(
    page.getByRole("complementary").getByRole("button", { name: /담기 완료|Added/ }),
  ).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Admin Flow");
  await checkoutInputs.nth(1).fill("01011112222");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 789, Gangnam-gu");
  await checkoutInputs.nth(4).fill("15F");
  await page.locator("form textarea").fill("Admin dashboard test order.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({ force: true });
  await page.getByRole("button", { name: /주문하기|Place order|바로 주문/ }).click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+(?:\?phone=.*)?$/);

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(adminUrl);

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  const heroTitleInput = page.locator('input[name="heroTitle"]');
  const originalHeroTitle = await heroTitleInput.inputValue();
  await heroTitleInput.fill(heroTitle);
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="heroTitle"]') })
    .locator('button[type="submit"]')
    .click();
  await expect(heroTitleInput).toHaveValue(heroTitle);

  await page.goto(`${adminUrl}/products`, { waitUntil: "networkidle" });
  const productBadgeInput = page.locator('input[name="productBadge"]');
  const productStockInput = page.locator('input[name="productStock"]');
  const originalBadge = await productBadgeInput.inputValue();
  const originalStock = await productStockInput.inputValue();
  await productBadgeInput.fill("OPS PICK");
  await productStockInput.fill("5");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="productName"]') })
    .locator('button[type="submit"]')
    .click();

  await page.goto(`${adminUrl}/orders`, { waitUntil: "networkidle" });
  const orderSelect = page.getByRole("combobox").first();
  await expect(orderSelect).toBeVisible();
  const originalStatus = await orderSelect.inputValue();
  await orderSelect.selectOption("PREPARING");
  await page.getByRole("button", { name: /상태 저장|Save status/ }).first().click();
  await expect(orderSelect).toHaveValue("PREPARING");

  await page.goto(`${adminUrl}/`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: /핵심 운영 지표를 빠르게 확인하는 메인 보드/ }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "12-admin-dashboard.png"),
    fullPage: true,
  });

  await page.goto(`${adminUrl}/orders`, { waitUntil: "networkidle" });
  const restoreOrderSelect = page.getByRole("combobox").first();
  await restoreOrderSelect.selectOption(originalStatus);
  await page.getByRole("button", { name: /상태 저장|Save status/ }).first().click();

  await page.goto(`${adminUrl}/products`, { waitUntil: "networkidle" });
  await productBadgeInput.fill(originalBadge);
  await productStockInput.fill(originalStock);
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="productName"]') })
    .locator('button[type="submit"]')
    .click();

  await page.goto(`${adminUrl}/display`, { waitUntil: "networkidle" });
  await heroTitleInput.fill(originalHeroTitle);
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="heroTitle"]') })
    .locator('button[type="submit"]')
    .click();
});
