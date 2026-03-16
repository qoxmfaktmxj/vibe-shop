const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");

test("login page exposes social login buttons and storefront favicon", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await page.goto("/login", { waitUntil: "networkidle" });

  await expect(page.getByRole("link", { name: "Google로 계속하기" })).toBeVisible();
  await expect(page.getByRole("link", { name: "카카오로 계속하기" })).toBeVisible();

  const faviconHref = await page.evaluate(() => {
    const icon = document.querySelector('link[rel="icon"]');
    return icon?.getAttribute("href") ?? "";
  });
  expect(faviconHref).toMatch(/icon|vibe-shop-favicon/i);
  const faviconResponse = await page.request.get("/vibe-shop-favicon.svg");
  expect(faviconResponse.ok()).toBeTruthy();

  await page.getByRole("link", { name: "Google로 계속하기" }).click();
  await expect(page).toHaveURL(/\/login\?error=social_google_unavailable/);
  await page.goto(page.url(), { waitUntil: "networkidle" });
  await expect(
    page.getByText("Google 로그인은 아직 연결되지 않았습니다", { exact: false }),
  ).toBeVisible();

  await page.getByRole("link", { name: "카카오로 계속하기" }).click();
  await expect(page).toHaveURL(/\/login\?error=social_kakao_unavailable/);
  await page.goto(page.url(), { waitUntil: "networkidle" });
  await expect(
    page.getByText("카카오 로그인은 아직 연결되지 않았습니다", { exact: false }),
  ).toBeVisible();

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "13-auth-social.png"),
    fullPage: true,
  });
});
