const { expect, test } = require("playwright/test");

test("mobile payment failure keeps the cart for retry", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href^="/category/"]').first().click();
  await expect(page).toHaveURL(/\/category\//);
  await page.waitForLoadState("networkidle");
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Add to Bag" }).click();

  await expect
    .poll(async () => {
      return (await page.getByRole("link", { name: /Bag/i }).textContent()) ?? "";
    })
    .toContain("Bag 1");

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();

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
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/orders\/[^?]+\?phone=01055556666$/);
  await expect(page.getByRole("heading", { name: "결제에 실패했습니다." })).toBeVisible();
  await expect(page.getByText("결제 실패")).toBeVisible();

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();
});
