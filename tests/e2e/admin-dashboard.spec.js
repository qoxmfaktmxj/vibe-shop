const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:4200";

test("admin dashboard can manage display, products, and order status", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const heroTitle = `Ops Edit ${uniqueId}`;

  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href^="/category/"]').first().click();
  await expect(page).toHaveURL(/\/category\//);
  await page.waitForLoadState("networkidle");
  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/products\/brew-mug$/);
  await page.getByRole("complementary").getByRole("button", { name: "Add to Bag" }).click();

  await expect
    .poll(async () => {
      return (await page.getByRole("link", { name: /Bag/i }).textContent()) ?? "";
    })
    .toContain("Bag 1");

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Admin Flow");
  await checkoutInputs.nth(1).fill("01011112222");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 789, Gangnam-gu");
  await checkoutInputs.nth(4).fill("15F");
  await page.locator("form textarea").fill("Admin dashboard test order.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({ force: true });
  await page.getByRole("button", { name: "주문하기" }).click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+(?:\?phone=.*)?$/);
  const orderNumber = new URL(page.url()).pathname.split("/").at(-1);

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.locator('form button[type="submit"]').click();

  await expect(page).toHaveURL(`${adminUrl}/`);
  await expect(page.locator('input[name="heroTitle"]')).toBeVisible();

  await page.locator('input[name="heroTitle"]').fill(heroTitle);
  await page
    .locator('textarea[name="heroSubtitle"]')
    .fill("운영자가 직접 수정한 메인 카피입니다.");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="heroTitle"]') })
    .locator('button[type="submit"]')
    .click();

  await page.locator('input[name="productBadge"]').fill("OPS PICK");
  await page.locator('input[name="productStock"]').fill("5");
  await page
    .locator("form")
    .filter({ has: page.locator('input[name="productName"]') })
    .locator('button[type="submit"]')
    .click();

  const orderCard = page.locator(`[data-order-number="${orderNumber}"]`);
  await expect(orderCard).toBeVisible();
  await orderCard.locator("select").selectOption("PREPARING");
  await orderCard.getByRole("button").click();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: heroTitle })).toBeVisible();

  await page.goto(`${adminUrl}/`, { waitUntil: "networkidle" });
  await expect(orderCard.locator("select")).toHaveValue("PREPARING");
  await expect(page.getByRole("heading", { name: "운영 보조 대시보드" })).toBeVisible();
  await expect(page.getByText("Low Stock Queue")).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "12-admin-dashboard.png"),
    fullPage: true,
  });
});
