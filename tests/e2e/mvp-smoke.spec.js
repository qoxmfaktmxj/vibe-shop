const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const NAVIGATION_TIMEOUT = 60_000;

test.setTimeout(180_000);

test("storefront MVP smoke flow", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-home.png"),
    fullPage: true,
  });

  await page.goto("/category/living", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/category\/living/, { timeout: NAVIGATION_TIMEOUT });
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-category.png"),
    fullPage: true,
  });

  await page.goto("/products/brew-mug", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/products\/brew-mug$/, { timeout: NAVIGATION_TIMEOUT });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-product.png"),
    fullPage: true,
  });

  await page.locator("button.button-hot").first().click();
  await expect(page.getByRole("link", { name: /장바구니 1개 상품/ })).toBeVisible();
  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /삭제|제거|Remove/ })).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-cart.png"),
    fullPage: true,
  });

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await checkoutInputs.nth(0).fill("Kim Minsu");
  await checkoutInputs.nth(1).fill("01012345678");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 123, Gangnam-gu");
  await checkoutInputs.nth(4).fill("8F");
  await page.locator("form textarea").fill("Leave at the door.");
  await page.locator('input[name="paymentMethod"][value="BANK_TRANSFER"]').check({
    force: true,
  });
  await page.getByRole("checkbox").check();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("vibe_shop_guest_checkout_draft"))).toBeNull();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-checkout.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: /주문하기|Place order|바로 주문/ }).click();
  await expect(page).toHaveURL(/\/orders\/[^?]+$/, {
    timeout: NAVIGATION_TIMEOUT,
  });
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.getByText("010-****-5678")).toBeVisible();
  await expect(page.getByText("01012345678")).toHaveCount(0);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-order-complete.png"),
    fullPage: true,
  });

  const currentOrderUrl = new URL(page.url());
  const orderNumber = currentOrderUrl.pathname.split("/").at(-1);

  const result = {
    title: await page.title(),
    url: page.url(),
    orderNumber,
    orderHeading: await page.locator("h1").first().textContent(),
    receiptLines: await page.locator("aside .space-y-4 > div").allTextContents(),
  };

  await page.getByRole("button").filter({ hasText: /취소|Cancel/ }).first().click();
  await expect(page.getByRole("heading").first()).toBeVisible({
    timeout: NAVIGATION_TIMEOUT,
  });

  await page.locator('a[href="/lookup-order"]').first().click();
  await expect(page).toHaveURL(/\/lookup-order$/, { timeout: NAVIGATION_TIMEOUT });
  const lookupInputs = page.locator("form input");
  await lookupInputs.nth(0).fill(result.orderNumber);
  await lookupInputs.nth(1).fill("01012345678");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(`/orders/${result.orderNumber}$`), {
    timeout: NAVIGATION_TIMEOUT,
  });

  await page.goto("/search", { waitUntil: "networkidle" });
  await page.getByRole("textbox").first().fill("linen");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/search\?.*q=linen/, {
    timeout: NAVIGATION_TIMEOUT,
  });
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.goto("/orders", { waitUntil: "networkidle" });
  await expect(page.getByRole("main").getByRole("link", { name: "비회원 주문 조회" })).toBeVisible();
  await expect(page.locator("form input")).toHaveCount(0);

  await page.goto("/faq", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toBeVisible();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "qa-result.json"),
    JSON.stringify(result, null, 2),
    "utf8",
  );
});
