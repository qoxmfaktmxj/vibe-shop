const { expect, test } = require("playwright/test");

async function expectNoHorizontalOverflow(page) {
  const hasOverflow = await page.evaluate(() => {
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    return scrollWidth > width + 1;
  });

  expect(hasOverflow).toBeFalsy();
}

test.describe("mobile storefront smoke", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("guest flow has no mobile overflow on key storefront routes", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator('a[href="/cart"]')).toBeVisible();
    await expect(page.locator('a[href*="next=%2Faccount"]')).toBeVisible();
    await expect(page.locator('a[href^="/auth?tab=login"]').last()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/search", { waitUntil: "networkidle" });
    await expect(page.locator('form button[type="submit"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
    const addToCartButton = page.locator("button.button-hot").first();
    await expect(addToCartButton).toBeVisible();
    await expectNoHorizontalOverflow(page);

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
    await expect(page.locator('a[href="/checkout"]').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/checkout", { waitUntil: "networkidle" });
    await expect(page.locator('button[form]').last()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("account entry on mobile routes to auth without overflow", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator('a[href*="next=%2Faccount"]').click();
    await expect(page).toHaveURL(/\/auth\?tab=login&next=%2Faccount$/);
    await expectNoHorizontalOverflow(page);
  });
});
