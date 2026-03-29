const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const DEFAULT_BASE_URLS = process.env.DEMO_BASE_URL
  ? [process.env.DEMO_BASE_URL]
  : ["http://localhost:4100", "http://127.0.0.1:4100"];
const DEMO_API_BASE_URL = process.env.DEMO_API_BASE_URL ?? null;
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@maru.local";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? "admin1234!";
const HEADLESS = process.env.DEMO_HEADLESS === "1";
const SLOW_MO = Number(process.env.DEMO_SLOW_MO ?? (HEADLESS ? 0 : 180));
const STEP_MS = Number(process.env.DEMO_STEP_MS ?? (HEADLESS ? 0 : 550));
const SHOT_PREFIX = process.env.DEMO_SHOT_PREFIX ?? "executive-demo-60s";
const OUTPUT_DIR = path.join(process.cwd(), "output", "demo");
const LOCAL_OUTPUT_DIR = path.join(process.cwd(), "output", "local");
const LOG_PATH = path.join(LOCAL_OUTPUT_DIR, `${SHOT_PREFIX}.log`);

function logStep(message) {
  const timestamp = new Date().toLocaleTimeString("ko-KR", { hour12: false });
  const line = `[${timestamp}] ${message}`;
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
  fs.appendFileSync(LOG_PATH, `${line}\n`, "utf8");
  console.log(line);
}

async function pause(page, ms = STEP_MS) {
  if (ms > 0) {
    await page.waitForTimeout(ms);
  }
}

async function saveShot(page, suffix) {
  if (HEADLESS) {
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${SHOT_PREFIX}-${suffix}.png`),
    fullPage: true,
  });
}

async function resolveBaseUrl(context) {
  logStep(`Checking demo storefront candidates: ${DEFAULT_BASE_URLS.join(", ")}`);
  for (const baseUrl of DEFAULT_BASE_URLS) {
    try {
      const response = await context.request.get(`${baseUrl}/`, { timeout: 5000 });
      if (response.ok()) {
        logStep(`Using storefront: ${baseUrl}`);
        return baseUrl;
      }
    } catch {
      // try next candidate
    }
  }

  logStep("Storefront not reachable. Bootstrapping demo stack.");
  execFileSync(process.execPath, [path.join(process.cwd(), "scripts", "start-demo-stack.mjs")], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  for (const baseUrl of DEFAULT_BASE_URLS) {
    try {
      const response = await context.request.get(`${baseUrl}/`, { timeout: 5000 });
      if (response.ok()) {
        logStep(`Using storefront after bootstrap: ${baseUrl}`);
        return baseUrl;
      }
    } catch {
      // try next candidate after boot
    }
  }

  throw new Error(`Demo storefront is not reachable. Tried: ${DEFAULT_BASE_URLS.join(", ")}`);
}

function resolveApiBaseUrl(baseUrl) {
  if (DEMO_API_BASE_URL) {
    return DEMO_API_BASE_URL;
  }

  const url = new URL(baseUrl);
  url.port = "8180";
  return url.toString().replace(/\/$/, "");
}

async function createMemberSession(context, baseUrl) {
  logStep("Creating member session");
  const email = `executive-demo-${Date.now()}@example.com`;
  const response = await context.request.post(`${resolveApiBaseUrl(baseUrl)}/api/v1/auth/signup`, {
    timeout: 10000,
    data: {
      name: "Executive Demo",
      email,
      password: "Password123!",
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create demo member session (${response.status()}): ${await response.text()}`);
  }

  logStep(`Created member session for ${email}`);
  return { email };
}

async function adminLogin(page, baseUrl) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await pause(page, STEP_MS / 2);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/admin$/, { timeout: 20_000 });
}

async function openTargetProduct(page) {
  const preferredProduct = page.locator('a[href="/products/linen-bed-set"]').first();
  if (await preferredProduct.isVisible({ timeout: 3000 }).catch(() => false)) {
    await preferredProduct.click();
    return;
  }

  const firstVisibleProduct = page.locator('a[href^="/products/"]').first();
  if (await firstVisibleProduct.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstVisibleProduct.click();
    return;
  }

  await page.goto(`${page.url().startsWith("http") ? new URL(page.url()).origin : ""}/products/linen-bed-set`, {
    waitUntil: "networkidle",
  });
}

async function fillCheckout(page) {
  const inputs = page.locator("form input");
  await inputs.nth(0).fill("Executive Demo");
  await inputs.nth(1).fill("01012345678");
  await inputs.nth(2).fill("06236");
  await inputs.nth(3).fill("Teheran-ro 123, Gangnam-gu");
  await inputs.nth(4).fill("8F");
  const note = page.locator("form textarea");
  if (await note.count()) {
    await note.fill("Executive demo order.");
  }
}

async function main() {
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_PATH, "", "utf8");
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: process.env.DEMO_RECORD === "1"
      ? { dir: path.join(OUTPUT_DIR, "video"), size: { width: 1440, height: 900 } }
      : undefined,
  });

  try {
    const baseUrl = await resolveBaseUrl(context);
    await createMemberSession(context, baseUrl);

    const page = await context.newPage();

    logStep("Home and search");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await saveShot(page, "01-home");
    await pause(page);

    const searchForm = page.locator('form[action="/search"]').first();
    await searchForm.locator('input[name="q"]').fill("linen");
    await pause(page, STEP_MS / 2);
    await searchForm.locator('button[type="submit"]').click();
    await page.waitForURL(/\/search\?q=linen/, { timeout: 15_000 });
    await saveShot(page, "02-search");
    await pause(page);

    logStep("Product detail");
    await openTargetProduct(page);
    await page.waitForURL(/\/products\//, { timeout: 15_000 });
    await saveShot(page, "03-product");
    await pause(page);

    logStep("Add to cart");
    await page
      .getByRole("complementary")
      .getByRole("button", { name: /장바구니 담기|Add to Bag/ })
      .click();
    await pause(page);

    const cartLink = page.locator('a[href="/cart"]').first();
    if (await cartLink.isVisible().catch(() => false)) {
      await cartLink.click();
    } else {
      await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    }
    await page.waitForURL(/\/cart$/, { timeout: 15_000 });
    await saveShot(page, "04-cart");
    await pause(page);

    logStep("Checkout");
    await page.locator('a[href="/checkout"]').first().click();
    await page.waitForURL(/\/checkout$/, { timeout: 15_000 });
    await fillCheckout(page);
    await saveShot(page, "05-checkout");
    await pause(page);

    await page.getByRole("button", { name: /주문하기|바로 주문|Place order/ }).click();
    await page.waitForURL(/\/orders\/[^/]+/, { timeout: 20_000 });
    const orderNumber = new URL(page.url()).pathname.split("/").at(-1);
    if (!orderNumber) {
      throw new Error("Order number was not captured.");
    }
    await saveShot(page, "06-order-complete");
    await pause(page);

    logStep("Customer logout");
    const logoutButton = page.getByRole("button", { name: /^로그아웃$/ }).first();
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      await pause(page, STEP_MS / 2);
    }

    logStep("Admin login");
    await adminLogin(page, baseUrl);
    await saveShot(page, "07-admin-dashboard");
    await pause(page);

    logStep("Admin orders");
    await page.getByRole("link", { name: "주문" }).first().click();
    await page.waitForURL(/\/admin\/orders$/, { timeout: 15_000 });
    await page.getByText(orderNumber).first().waitFor({ state: "visible", timeout: 15_000 });
    await saveShot(page, "08-admin-orders");
    await pause(page);

    logStep("Admin products");
    await page.getByRole("link", { name: "상품" }).first().click();
    await page.waitForURL(/\/admin\/products$/, { timeout: 15_000 });
    await page.getByRole("button", { name: "새 상품 등록" }).first().click();
    await page.getByText("새 상품을 만드는 중입니다.").first().waitFor({ state: "visible", timeout: 10_000 });
    await saveShot(page, "09-admin-products");
    await pause(page);

    console.log(JSON.stringify({
      baseUrl,
      orderNumber,
      adminEmail: ADMIN_EMAIL,
      outputDir: OUTPUT_DIR,
    }, null, 2));
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((error) => {
  fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });
  fs.appendFileSync(
    LOG_PATH,
    `${error instanceof Error ? error.stack ?? error.message : String(error)}\n`,
    "utf8",
  );
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
