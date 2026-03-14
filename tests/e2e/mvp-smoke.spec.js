const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const NAVIGATION_TIMEOUT = 60_000;

test("storefront MVP smoke flow", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-home.png"),
    fullPage: true,
  });

  await page.getByRole("link", { name: "대표 카테고리 보기" }).click();
  await expect(page).toHaveURL(/\/category\//, { timeout: NAVIGATION_TIMEOUT });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-category.png"),
    fullPage: true,
  });

  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//, { timeout: NAVIGATION_TIMEOUT });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-product.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await expect(page.getByRole("button", { name: "장바구니에 담았어요" })).toBeVisible();

  await expect
    .poll(async () => {
      const cartCookies = await page.context().cookies("http://127.0.0.1:8180");
      return cartCookies.some((cookie) => cookie.name === "vibe_shop_cart");
    })
    .toBeTruthy();

  await page.getByRole("link", { name: /장바구니/ }).first().click();
  await expect(page).toHaveURL(/\/cart$/, { timeout: NAVIGATION_TIMEOUT });
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-cart.png"),
    fullPage: true,
  });

  await page.getByRole("link", { name: "주문서 작성" }).click();
  await expect(page).toHaveURL(/\/checkout$/, { timeout: NAVIGATION_TIMEOUT });
  await page.getByLabel("받는 분").fill("Kim Minsu");
  await page.getByLabel("연락처").fill("01012345678");
  await page.getByLabel("우편번호").fill("06236");
  await page.getByLabel("기본 주소").fill("Teheran-ro 123, Gangnam-gu");
  await page.getByLabel("상세 주소").fill("8F");
  await page.getByLabel("배송 메모").fill("Leave at the door.");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-checkout.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "주문 완료하기" }).click();
  await expect(page).toHaveURL(/\/orders\//, { timeout: NAVIGATION_TIMEOUT });
  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-order-complete.png"),
    fullPage: true,
  });

  const result = {
    title: await page.title(),
    url: page.url(),
    orderNumber: page.url().split("/").at(-1),
    orderHeading: await page.locator("h1").first().textContent(),
    receiptLines: await page.locator("aside .space-y-4 > div").allTextContents(),
  };

  await page.getByRole("link", { name: "비회원 주문조회" }).click();
  await expect(page).toHaveURL(/\/lookup-order$/, { timeout: NAVIGATION_TIMEOUT });
  await page.getByLabel("주문번호").fill(result.orderNumber);
  await page.getByLabel("연락처").fill("01012345678");
  await page.getByRole("button", { name: "주문 조회하기" }).click();
  await expect(page).toHaveURL(new RegExp(`/orders/${result.orderNumber}$`), {
    timeout: NAVIGATION_TIMEOUT,
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "qa-result.json"),
    JSON.stringify(result, null, 2),
    "utf8",
  );
});
