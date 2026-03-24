const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

test("member can manage my page profile and shipping addresses", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const email = `mypage-${uniqueId}@example.com`;

  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await page.getByRole("complementary").getByRole("button", { name: "Add to Bag" }).click();

  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Mypage Tester");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/account$/);
  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Mypage Tester");
  await checkoutInputs.nth(1).fill("01055556666");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 456, Gangnam-gu");
  await checkoutInputs.nth(4).fill("12F");
  await page.locator("form textarea").fill("Account page smoke test.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({
    force: true,
  });
  await page.getByRole("button", { name: /주문하기|Place order|바로 주문/ }).click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+$/);
  const memberOrderNumber = new URL(page.url()).pathname.split("/").at(-1);

  await page.goto("/account", { waitUntil: "networkidle" });
  await expect(page.locator('input[name="profileEmail"]').first()).toHaveValue(email);

  await page.locator('input[name="profileName"]').fill("Mypage QA");
  await page.getByRole("button").filter({ hasText: /Save|계정/ }).first().click();

  await page.locator('input[name="label"]').fill("Home");
  await page.locator('input[name="recipientName"]').fill("Mypage QA");
  await page.locator('input[name="phone"]').fill("01055556666");
  await page.locator('input[name="postalCode"]').fill("06236");
  await page.locator('input[name="address1"]').fill("Teheran-ro 456, Gangnam-gu");
  await page.locator('input[name="address2"]').fill("12F");
  await page.locator('input[name="isDefault"]').check();
  await page.getByRole("button").filter({ hasText: /Address|배송지|등록/ }).first().click();

  await expect(page.getByText(memberOrderNumber)).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "11-account-mypage.png"),
    fullPage: true,
  });
});
