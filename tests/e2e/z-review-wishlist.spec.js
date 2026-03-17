const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:3200";

test("member can wishlist and review a product, then admin can moderate it", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const email = `engagement-${uniqueId}@example.com`;
  const reviewTitle = `Review ${uniqueId}`;

  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Engagement Tester");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account$/);

  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/products\/brew-mug$/);

  await page.getByRole("button", { name: /찜 추가|찜 해제/ }).click();
  await expect(page.getByRole("button", { name: /찜 해제/ })).toBeVisible();

  await page.getByRole("button", { name: "Add to Bag" }).click();
  await expect
    .poll(async () => {
      return (await page.getByRole("link", { name: /Bag/i }).textContent()) ?? "";
    })
    .toContain("Bag 1");

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Engagement Tester");
  await checkoutInputs.nth(1).fill("01033334444");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 222, Gangnam-gu");
  await checkoutInputs.nth(4).fill("9F");
  await page.locator("form textarea").fill("Review and wishlist flow.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({ force: true });
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+$/);

  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await page.locator('input[name="title"]').fill(reviewTitle);
  await page.locator('textarea[name="content"]').fill("Keeps the daily coffee ritual calm and tidy.");
  await page.getByRole("button", { name: "리뷰 등록" }).click();
  await expect(page.getByText("리뷰가 등록되었습니다.")).toBeVisible();
  await expect(page.getByText(reviewTitle)).toBeVisible();

  await page.goto("/account", { waitUntil: "networkidle" });
  await expect(page.getByText(reviewTitle)).toBeVisible();
  await expect(page.getByRole("button", { name: "찜 해제" })).toBeVisible();

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(`${adminUrl}/`);

  const reviewCard = page.locator('[data-review-id]').filter({ hasText: reviewTitle });
  await expect(reviewCard).toBeVisible();
  await reviewCard.locator("select").selectOption("HIDDEN");
  await reviewCard.getByRole("button", { name: "상태 저장" }).click();
  await expect(page.getByText(/리뷰 .* 상태를 저장했습니다\./)).toBeVisible();

  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
  await expect(page.getByText(reviewTitle)).toHaveCount(0);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "15-review-wishlist-admin.png"),
    fullPage: true,
  });
});
