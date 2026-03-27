const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("playwright/test");

const OUTPUT_DIR = path.join(process.cwd(), "output", "playwright");
const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const adminUrl = `${storefrontUrl}/admin`;
const apiBaseUrl = process.env.API_BASE_URL ?? "http://127.0.0.1:8180";
const adminEmail =
  process.env.E2E_ADMIN_EMAIL ??
  process.env.APP_DEMO_ADMIN_EMAIL ??
  "admin@maru.local";
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ??
  process.env.APP_DEMO_ADMIN_PASSWORD ??
  "admin1234!";

test(
  "admin can review members, see statistics, and block a member account",
  async ({ page, request }) => {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const uniqueId = Date.now();
    const email = `member-${uniqueId}@example.com`;
    const memberPassword = "password123";

    const signupResponse = await request.post(`${apiBaseUrl}/api/v1/auth/signup`, {
      data: {
        name: "Member Block Target",
        email,
        password: memberPassword,
      },
    });
    expect(signupResponse.ok()).toBeTruthy();

    await page.goto(`${adminUrl}/login`, { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').fill(adminPassword);
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(adminUrl);

    await page.goto(`${adminUrl}/members`, { waitUntil: "networkidle" });
    await page.locator('input[name="memberQuery"]').fill(email);

    const memberRow = page.locator(`[data-member-email="${email}"]`);
    await expect(memberRow).toBeVisible();

    const statusSelect = memberRow.locator('select[name^="memberStatus-"]');
    const saveButton = memberRow.getByRole("button", { name: /상태 저장|Save status/ });
    await statusSelect.selectOption("BLOCKED");
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === "PUT" &&
          response.url().includes("/api/v1/admin/members/") &&
          response.ok(),
      ),
      saveButton.click(),
    ]);
    await expect(statusSelect).toHaveValue("BLOCKED");
    await expect(saveButton).toBeDisabled();

    await page.goto("/auth?tab=login", { waitUntil: "networkidle" });
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(memberPassword);
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/\/auth(?:\?.*)?$/, { timeout: 20_000 });
    await expect(page.getByRole("alert")).toBeVisible();

    await page.goto(`${adminUrl}/analytics`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /reporting without the rest of the console|통계/ })).toBeVisible();
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "13-admin-member-statistics.png"),
      fullPage: true,
    });
  },
);
