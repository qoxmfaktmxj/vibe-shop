const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const STOREFRONT_URL =
  process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:3000";

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
  });
  const page = await context.newPage();

  await page.goto(STOREFRONT_URL, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-home.png"),
    fullPage: true,
  });

  await page.locator('a[href^="/category/"]').first().click();
  await page.waitForURL(/\/category\//);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-category.png"),
    fullPage: true,
  });

  await page.locator('a[href^="/products/"]').first().click();
  await page.waitForURL(/\/products\//);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-product.png"),
    fullPage: true,
  });

  await page.locator('button[type="button"]').first().click();
  await page.waitForTimeout(700);

  const cartState = await page.evaluate(() =>
    localStorage.getItem("vibe-shop-cart"),
  );
  if (!cartState) {
    throw new Error("Cart state was not persisted");
  }

  await page.locator('a[href="/cart"]').first().click();
  await page.waitForURL("**/cart");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-cart.png"),
    fullPage: true,
  });

  await page.locator('a[href="/checkout"]').click();
  await page.waitForURL("**/checkout");
  await page.waitForFunction(() => document.querySelectorAll("form input").length >= 5);
  await page.waitForTimeout(1200);

  const inputs = page.locator("form input");
  await inputs.nth(0).fill("Kim Minsu");
  await inputs.nth(1).fill("01012345678");
  await inputs.nth(2).fill("06236");
  await inputs.nth(3).fill("Teheran-ro 123, Gangnam-gu");
  await inputs.nth(4).fill("8F");
  await page.locator("form textarea").fill("Leave at the door.");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-checkout.png"),
    fullPage: true,
  });

  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/orders\//, { timeout: 60000 });
  await page.waitForLoadState("domcontentloaded");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-order-complete.png"),
    fullPage: true,
  });

  const result = {
    title: await page.title(),
    url: page.url(),
    orderHeading: await page.locator("h1").first().textContent(),
    receiptLines: await page.locator("aside .space-y-4 > div").allTextContents(),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "qa-result.json"),
    JSON.stringify(result, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
