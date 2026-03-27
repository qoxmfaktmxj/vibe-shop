const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

test("login page exposes social login buttons and storefront favicon", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await page.goto("/login", { waitUntil: "networkidle" });

  const googleLink = page.locator('a[href*="/api/auth/social/login/google"]');
  const kakaoLink = page.locator('a[href*="/api/auth/social/login/kakao"]');
  await expect(googleLink).toBeVisible();
  await expect(kakaoLink).toBeVisible();

  const faviconHref = await page.evaluate(() => {
    const icon = document.querySelector('link[rel="icon"]');
    return icon?.getAttribute("href") ?? "";
  });
  expect(faviconHref).toMatch(/icon|vibe-shop-favicon/i);

  const faviconResponse = await page.request.get("/vibe-shop-favicon.svg");
  expect(faviconResponse.ok()).toBeTruthy();

  await googleLink.click();
  await expect(page).toHaveURL(/\/auth\?tab=login(?:&.*)?error=social_google_unavailable/);
  await expect(page.locator('p[role="alert"]')).toBeVisible();

  await page.goto("/login", { waitUntil: "networkidle" });
  await kakaoLink.click();
  await expect(page).toHaveURL(/\/auth\?tab=login(?:&.*)?error=social_kakao_unavailable/);
  await expect(page.locator('p[role="alert"]')).toBeVisible();

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "13-auth-social.png"),
    fullPage: true,
  });
});
