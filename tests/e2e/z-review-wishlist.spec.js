const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const adminUrl = `${storefrontUrl}/admin`;
const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8180";

test("member can create photo review, another member can mark it helpful, then admin can moderate it", async ({ page, browser }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const email = `engagement-${uniqueId}@example.com`;
  const helperEmail = `engagement-helper-${uniqueId}@example.com`;
  const reviewTitle = `Review ${uniqueId}`;
  const photoUrl = `https://picsum.photos/seed/${uniqueId}/1200/1200`;

  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Engagement Tester");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account$/);

  const orderAndReviewResult = await page.evaluate(
    async ({ apiBaseUrl, photoUrl, reviewTitle, uniqueId }) => {
      const productResponse = await fetch(`${apiBaseUrl}/api/v1/products/brew-mug`, {
        credentials: "include",
      });
      if (!productResponse.ok) {
        throw new Error("Failed to load brew-mug product detail");
      }

      const product = await productResponse.json();
      const orderResponse = await fetch(`${apiBaseUrl}/api/v1/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotencyKey: `engagement-${uniqueId}`,
          customerName: "Engagement Tester",
          phone: "01033334444",
          postalCode: "06236",
          address1: "Teheran-ro 222, Gangnam-gu",
          address2: "9F",
          note: "Review and wishlist flow.",
          paymentMethod: "CARD",
          items: [
            {
              productId: product.id,
              quantity: 1,
            },
          ],
        }),
      });
      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const reviewResponse = await fetch(`${apiBaseUrl}/api/v1/products/${product.id}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: 5,
          title: reviewTitle,
          content: "Keeps the daily coffee ritual calm and tidy.",
          fitTag: "Daily ritual",
          repurchaseYn: true,
          deliverySatisfaction: 5,
          packagingSatisfaction: 5,
          imageUrls: [photoUrl],
        }),
      });
      if (!reviewResponse.ok) {
        throw new Error("Failed to create review");
      }

      return reviewResponse.json();
    },
    { apiBaseUrl, photoUrl, reviewTitle, uniqueId },
  );

  expect(orderAndReviewResult.title).toBe(reviewTitle);

  await page.goto("/products/brew-mug", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(reviewTitle)).toBeVisible();

  const helperContext = await browser.newContext({
    baseURL: process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100",
  });
  const helperPage = await helperContext.newPage();

  await helperPage.goto("/signup", { waitUntil: "networkidle" });
  const helperInputs = helperPage.locator("form input");
  await helperInputs.nth(0).fill("Helpful Tester");
  await helperInputs.nth(1).fill(helperEmail);
  await helperInputs.nth(2).fill("password123");
  await helperPage.locator('button[type="submit"]').click();
  await expect(helperPage).toHaveURL(/\/account$/);

  await helperPage.goto("/products/brew-mug", { waitUntil: "domcontentloaded" });
  const helperReviewCard = helperPage.locator("article").filter({ hasText: reviewTitle }).first();
  await expect(helperReviewCard).toBeVisible();
  await helperReviewCard.getByRole("button").last().click();

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(adminUrl);

  await page.goto(`${adminUrl}/reviews`, { waitUntil: "networkidle" });
  const reviewCard = page.locator('[data-review-id]').filter({ hasText: reviewTitle });
  await expect(reviewCard).toBeVisible();
  await reviewCard.locator("select").selectOption("HIDDEN");
  await reviewCard.getByRole("button").click();

  await helperPage.goto("/products/brew-mug", { waitUntil: "domcontentloaded" });
  await expect(helperPage.getByText(reviewTitle)).toHaveCount(0);

  await helperPage.screenshot({
    path: path.join(OUTPUT_DIR, "15-review-wishlist-admin.png"),
    fullPage: true,
  });

  await helperContext.close();
});
