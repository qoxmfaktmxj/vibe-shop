const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const adminUrl = process.env.E2E_ADMIN_URL ?? "http://127.0.0.1:3200";

test("admin can review members, see statistics, and block a member account", async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const uniqueId = Date.now();
  const email = `member-${uniqueId}@example.com`;

  await page.goto("/signup", { waitUntil: "networkidle" });
  const signupInputs = page.locator("form input");
  await signupInputs.nth(0).fill("Member Block Target");
  await signupInputs.nth(1).fill(email);
  await signupInputs.nth(2).fill("password123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/account$/);

  await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill("admin@vibeshop.local");
  await page.locator('input[type="password"]').fill("admin1234!");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(`${adminUrl}/`);

  await expect(page.getByRole("heading", { name: "운영 통계" })).toBeVisible();
  await page.locator('input[name="memberQuery"]').fill(email);

  await expect(page.getByText(email)).toBeVisible();
  await page.locator('select[name^="memberStatus-"]').first().selectOption("BLOCKED");
  await page.getByRole("button", { name: "상태 저장" }).first().click();
  await expect(page.getByText("회원 상태를 변경했습니다.")).toBeVisible();

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("password123");
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText("차단된 계정입니다. 관리자에게 문의해 주세요.")).toBeVisible();

  await page.goto(`${adminUrl}/`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "회원 관리" })).toBeVisible();
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "13-admin-member-statistics.png"),
    fullPage: true,
  });
});
