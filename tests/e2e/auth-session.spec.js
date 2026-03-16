const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

test("auth session flow keeps account session and preserves cart", async ({ page }) => {
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
  await page.waitForTimeout(1200);
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Auth Tester");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { name: "내 계정" })).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07-account.png"),
    fullPage: true,
  });

  await page.goto("/cart", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "Remove" })).toBeVisible();

  await page.getByRole("button", { name: "Logout" }).click();
  await page.goto("/account", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/login\?next=(%2Faccount|\/account)$/);
  await expect(page.getByRole("heading", { name: "회원 로그인" })).toBeVisible();
});
