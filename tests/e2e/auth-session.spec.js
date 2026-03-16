const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

test("member auth flow keeps session and scopes orders to the account", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const email = `auth-${uniqueId}@example.com`;

  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//);
  await page.getByRole("button", { name: "Add to Bag" }).click();

  await expect
    .poll(async () => {
      const cartCookies = await page.context().cookies("http://127.0.0.1:8180");
      return cartCookies.some((cookie) => cookie.name === "vibe_shop_cart");
    })
    .toBeTruthy();

  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Auth Tester");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.locator('input[name="profileEmail"]')).toHaveValue(email);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07-account.png"),
    fullPage: true,
  });

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();

  await page.goto("/checkout", { waitUntil: "networkidle" });
  const checkoutInputs = page.locator("form input");
  await expect(checkoutInputs.nth(0)).toHaveValue("Auth Tester");
  await checkoutInputs.nth(1).fill("01077778888");
  await checkoutInputs.nth(2).fill("06236");
  await checkoutInputs.nth(3).fill("Teheran-ro 456, Gangnam-gu");
  await checkoutInputs.nth(4).fill("12F");
  await page.locator("form textarea").fill("Member delivery note.");
  await page.locator('input[name="paymentMethod"][value="CARD"]').check({
    force: true,
  });
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/orders\/[A-Z0-9]+$/);
  await expect(page.getByRole("heading", { name: "결제가 완료되었습니다." })).toBeVisible();
  const memberOrderNumber = new URL(page.url()).pathname.split("/").at(-1);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08-member-order.png"),
    fullPage: true,
  });

  await page.goto("/orders", { waitUntil: "networkidle" });
  await expect(page.getByText(memberOrderNumber)).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();
  await page.goto(`/orders/${memberOrderNumber}`, { waitUntil: "networkidle" });
  await expect(page).toHaveURL(
    new RegExp(`/lookup-order\\?orderNumber=${memberOrderNumber}$`),
  );
  await expect(page.locator("input").first()).toHaveValue(memberOrderNumber);
});
