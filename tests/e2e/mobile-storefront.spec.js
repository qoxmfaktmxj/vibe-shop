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
    await expect(page.getByRole("link", { name: /로그인 후 내 정보 보기|내 정보 보기/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /장바구니/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^로그인$/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/search", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /^검색$/ })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/products/brew-mug", { waitUntil: "networkidle" });
    await expect(page.locator("button.button-hot").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.locator("button.button-hot").first().click();
    await page.goto("/cart", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /주문서로 이동/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/checkout", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: /바로 주문|주문하기/ }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("account entry on mobile routes to auth without overflow", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /로그인 후 내 정보 보기|내 정보 보기/ }).click();
    await expect(page).toHaveURL(/\/auth\?tab=login&next=%2Faccount$/);
    await expectNoHorizontalOverflow(page);
  });
});
