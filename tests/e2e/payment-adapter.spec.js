const { expect, test } = require("playwright/test");

test("mobile payment failure keeps the cart for retry", async ({ page }) => {
  await page.goto("/products/brew-mug", { waitUntil: "networkidle" });

  const addToCartButton = page.locator("button.button-hot").first();
  await addToCartButton.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "PUT" &&
        response.url().includes("/api/v1/cart/items/") &&
        response.ok(),
    ),
    addToCartButton.click(),
  ]);

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(
    page.locator("button").filter({ hasText: /삭제|제거|Remove/ }).first(),
  ).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Retry Guest");
  await checkoutInputs.nth(1).fill("01055556666");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 789, Gangnam-gu");
  await checkoutInputs.nth(4).fill("5F");
  await page.locator("form textarea").fill("Retry after mobile failure.");
  await page.locator('input[name="paymentMethod"][value="MOBILE"]').check({
    force: true,
  });
  await page
    .getByRole("button", { name: /주문하기|Place order|바로 주문/ })
    .click();

  await expect(page).toHaveURL(/\/orders\/[^?]+\?phone=01055556666$/);
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(
    page.locator("button").filter({ hasText: /삭제|제거|Remove/ }).first(),
  ).toBeVisible();
});
