const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:3200";

test("admin dashboard can manage display, products, and order status", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const heroTitle = `운영 셀렉션 ${uniqueId}`;

  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//);
  await page.getByRole("button", { name: "Add to Bag" }).click();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Admin Flow");
  await checkoutInputs.nth(1).fill("01011112222");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 789, Gangnam-gu");
  await checkoutInputs.nth(4).fill("15F");
  await page.locator("form textarea").fill("Admin dashboard test order.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({
    force: true,
  });
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+(?:\?phone=.*)?$/);
  const orderNumber = new URL(page.url()).pathname.split("/").at(-1);

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(`${adminUrl}/`);
  await expect(page.getByRole("heading", { name: "운영 현황과 판매 흐름을 한 화면에 모았습니다." })).toBeVisible();

  await page.locator('input[name="heroTitle"]').fill(heroTitle);
  await page.locator('textarea[name="heroSubtitle"]').fill("관리자 대시보드에서 직접 수정한 메인 소개 문구입니다.");
  await page.getByRole("button", { name: "전시 문구 저장" }).click();
  await expect(page.getByText("메인 전시 문구를 저장했습니다.")).toBeVisible();

  await page.locator('input[name="productBadge"]').fill("OPS PICK");
  await page.locator('input[name="productStock"]').fill("5");
  await page.getByRole("button", { name: "상품 저장" }).click();
  await expect(page.getByText("상품 정보를 저장했습니다.")).toBeVisible();

  const orderCard = page.locator(`[data-order-number="${orderNumber}"]`);
  await expect(orderCard).toBeVisible();
  await orderCard.locator("select").selectOption("PREPARING");
  await orderCard.getByRole("button", { name: `${orderNumber} 상태 저장` }).click();
  await expect(page.getByText(`${orderNumber} 상태를 저장했습니다.`)).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: heroTitle })).toBeVisible();

  await page.goto(`${adminUrl}/`, { waitUntil: "networkidle" });
  await expect(page.locator(`[data-order-number="${orderNumber}"]`)).toContainText("상품 준비중");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "12-admin-dashboard.png"),
    fullPage: true,
  });
});
