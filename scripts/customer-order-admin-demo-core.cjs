const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const { chromium } = require("playwright");

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "output", "demo");
const VIDEO_DIR = path.join(OUTPUT_DIR, "video");
const FINAL_DIR = path.join(OUTPUT_DIR, "final");
const REVIEW_FRAMES_DIR = path.join(OUTPUT_DIR, "review-frames-2s");
const LOCAL_OUTPUT_DIR = path.join(ROOT_DIR, "output", "local");

const DEFAULT_BASE_URLS = process.env.DEMO_BASE_URL
  ? [process.env.DEMO_BASE_URL]
  : ["http://127.0.0.1:4100", "http://localhost:4100"];
const DEFAULT_API_BASE_URLS = process.env.DEMO_API_BASE_URL
  ? [process.env.DEMO_API_BASE_URL]
  : ["http://127.0.0.1:8180", "http://localhost:8180"];

const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@maru.local";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? "admin1234!";
const HEADLESS = process.env.DEMO_HEADLESS === "1";
const KEEP_OPEN = process.env.DEMO_KEEP_OPEN === "1";
const SHOULD_RECORD = process.env.DEMO_RECORD === "1";
const VIEWPORT = {
  width: Number(process.env.DEMO_VIEWPORT_WIDTH ?? "1440"),
  height: Number(process.env.DEMO_VIEWPORT_HEIGHT ?? "900"),
};
const DEFAULT_TYPE_DELAY = Number(process.env.DEMO_TYPE_DELAY ?? "45");
const LOG_PATH = path.join(
  LOCAL_OUTPUT_DIR,
  `${process.env.DEMO_LOG_NAME ?? "customer-order-admin-demo"}.log`,
);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function logStep(message) {
  const timestamp = new Date().toLocaleTimeString("ko-KR", { hour12: false });
  const line = `[${timestamp}] ${message}`;
  ensureDir(LOCAL_OUTPUT_DIR);
  fs.appendFileSync(LOG_PATH, `${line}\n`, "utf8");
  console.log(line);
}

function clearLog() {
  ensureDir(LOCAL_OUTPUT_DIR);
  fs.writeFileSync(LOG_PATH, "", "utf8");
}

function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}

async function sleep(page, ms) {
  if (ms > 0) {
    await page.waitForTimeout(ms);
  }
}

async function waitForVisible(locator, timeout = 20_000) {
  await locator.waitFor({ state: "visible", timeout });
}

async function isReachable(requestContext, baseUrl) {
  try {
    const response = await requestContext.get(`${normalizeUrl(baseUrl)}/`, {
      timeout: 5_000,
    });
    return response.ok();
  } catch {
    return false;
  }
}

async function isHealthReachable(requestContext, apiBaseUrl) {
  try {
    const response = await requestContext.get(
      `${normalizeUrl(apiBaseUrl)}/actuator/health`,
      { timeout: 5_000 },
    );
    return response.ok();
  } catch {
    return false;
  }
}

async function resolveStack(context) {
  for (const baseUrl of DEFAULT_BASE_URLS) {
    if (await isReachable(context.request, baseUrl)) {
      const apiBaseUrl = DEFAULT_API_BASE_URLS.find(async () => true);
      logStep(`Using storefront candidate ${baseUrl}`);
      return {
        baseUrl: normalizeUrl(baseUrl),
        apiBaseUrl: normalizeUrl(DEFAULT_API_BASE_URLS[0]),
      };
    }
  }

  logStep("Demo stack is not reachable. Bootstrapping local demo stack.");
  execFileSync(process.execPath, [path.join(ROOT_DIR, "scripts", "start-demo-stack.mjs")], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  for (const baseUrl of DEFAULT_BASE_URLS) {
    if (await isReachable(context.request, baseUrl)) {
      logStep(`Using storefront after bootstrap ${baseUrl}`);
      return {
        baseUrl: normalizeUrl(baseUrl),
        apiBaseUrl: normalizeUrl(DEFAULT_API_BASE_URLS[0]),
      };
    }
  }

  throw new Error(
    `Demo storefront is not reachable. Tried: ${DEFAULT_BASE_URLS.join(", ")}`,
  );
}

async function setSubtitle(page, text) {
  await page.evaluate((caption) => {
    const styleId = "__demo_subtitle_style__";
    const nodeId = "__demo_subtitle__";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        #${nodeId} {
          position: fixed;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          z-index: 2147483647;
          max-width: min(1080px, calc(100vw - 96px));
          padding: 14px 22px;
          border-radius: 18px;
          background: rgba(11, 16, 24, 0.82);
          color: #ffffff;
          font-family: "Segoe UI", "Noto Sans KR", sans-serif;
          font-size: 24px;
          line-height: 1.45;
          font-weight: 600;
          letter-spacing: -0.02em;
          text-align: center;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
      `;
      document.head.appendChild(style);
    }

    let node = document.getElementById(nodeId);
    if (!node) {
      node = document.createElement("div");
      node.id = nodeId;
      document.body.appendChild(node);
    }

    node.textContent = caption;
  }, text);
}

async function clearSubtitle(page) {
  await page.evaluate(() => {
    document.getElementById("__demo_subtitle__")?.remove();
    document.getElementById("__demo_subtitle_style__")?.remove();
  });
}

async function typeSlow(locator, value, delay = DEFAULT_TYPE_DELAY) {
  await locator.click({ timeout: 10_000 });
  await locator.fill("");
  await locator.type(value, { delay });
}

function computeTimestamp(segments) {
  let elapsed = 0;
  const lines = [];

  function toSrtTime(ms) {
    const total = Math.max(0, Math.floor(ms));
    const hours = String(Math.floor(total / 3_600_000)).padStart(2, "0");
    const minutes = String(Math.floor((total % 3_600_000) / 60_000)).padStart(2, "0");
    const seconds = String(Math.floor((total % 60_000) / 1_000)).padStart(2, "0");
    const millis = String(total % 1_000).padStart(3, "0");
    return `${hours}:${minutes}:${seconds},${millis}`;
  }

  segments.forEach((segment, index) => {
    const start = elapsed;
    elapsed += segment.durationMs;
    lines.push(
      `${index + 1}\n${toSrtTime(start)} --> ${toSrtTime(elapsed)}\n${segment.text}\n`,
    );
  });

  return lines.join("\n");
}

function findFfmpegPath() {
  const candidates = [
    process.env.DEMO_FFMPEG_PATH,
    path.join(
      "C:\\Users\\sp20171217yw\\Desktop\\Devdev\\vibe-rec\\output\\tools\\ffmpeg\\extract\\ffmpeg-8.1-essentials_build\\bin",
      "ffmpeg.exe",
    ),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function runFfmpeg(ffmpegPath, args) {
  const result = spawnSync(ffmpegPath, args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      `ffmpeg failed with code ${result.status}\n${result.stderr || result.stdout || ""}`.trim(),
    );
  }
}

async function exportArtifacts(videoPath, timestamp, subtitleSegments) {
  ensureDir(FINAL_DIR);
  ensureDir(REVIEW_FRAMES_DIR);

  const ffmpegPath = findFfmpegPath();
  const finalBase = `vibe-shop-customer-admin-demo-${timestamp}`;
  const finalWebmPath = path.join(FINAL_DIR, `${finalBase}.webm`);
  fs.copyFileSync(videoPath, finalWebmPath);

  const subtitlePath = path.join(FINAL_DIR, `${finalBase}-captions.srt`);
  fs.writeFileSync(subtitlePath, computeTimestamp(subtitleSegments), "utf8");

  let finalMp4Path = null;
  if (ffmpegPath) {
    finalMp4Path = path.join(FINAL_DIR, `${finalBase}.mp4`);
    runFfmpeg(ffmpegPath, [
      "-y",
      "-i",
      videoPath,
      "-c:v",
      "libx264",
      "-preset",
      process.env.DEMO_FFMPEG_PRESET ?? "slow",
      "-crf",
      process.env.DEMO_FFMPEG_CRF ?? "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      finalMp4Path,
    ]);

    runFfmpeg(ffmpegPath, [
      "-y",
      "-i",
      finalMp4Path,
      "-vf",
      "fps=0.5",
      path.join(REVIEW_FRAMES_DIR, "frame-%03d.jpg"),
    ]);
  }

  return {
    finalWebmPath,
    finalMp4Path,
    subtitlePath,
  };
}

function step(segmentList, text, durationMs) {
  segmentList.push({ text, durationMs });
}

async function runDemoFlow(options = {}) {
  clearLog();
  ensureDir(OUTPUT_DIR);
  ensureDir(VIDEO_DIR);

  const headless = options.headless ?? HEADLESS;
  const record = options.record ?? SHOULD_RECORD;
  const keepOpen = options.keepOpen ?? KEEP_OPEN;
  const slowMo = options.slowMo ?? Number(process.env.DEMO_SLOW_MO ?? "0");
  const subtitleSegments = [];
  const unique = Date.now();
  const candidateEmail = process.env.DEMO_CUSTOMER_EMAIL ?? `shop-demo-${unique}@example.com`;
  const candidatePassword = process.env.DEMO_CUSTOMER_PASSWORD ?? "password123";
  const candidateName = process.env.DEMO_CUSTOMER_NAME ?? "데모 고객";
  const orderPhone = process.env.DEMO_ORDER_PHONE ?? "01012345678";
  const orderPostalCode = process.env.DEMO_ORDER_POSTAL_CODE ?? "06236";
  const orderAddress1 = process.env.DEMO_ORDER_ADDRESS1 ?? "Teheran-ro 123, Gangnam-gu";
  const orderAddress2 = process.env.DEMO_ORDER_ADDRESS2 ?? "8F";
  const orderNote = process.env.DEMO_ORDER_NOTE ?? "1분 데모 주문입니다.";
  const productSlug = process.env.DEMO_PRODUCT_SLUG ?? "linen-bed-set";
  const newProductSlug = process.env.DEMO_NEW_PRODUCT_SLUG ?? `demo-product-${unique}`;
  const newProductName = process.env.DEMO_NEW_PRODUCT_NAME ?? `데모 신규 상품 ${unique}`;

  const browser = await chromium.launch({
    headless,
    slowMo,
    channel: process.env.DEMO_BROWSER_CHANNEL || undefined,
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: record
      ? {
          dir: VIDEO_DIR,
          size: VIEWPORT,
        }
      : undefined,
  });

  const page = await context.newPage();
  const videoHandle = record ? page.video() : null;

  try {
    const { baseUrl, apiBaseUrl } = await resolveStack(context);
    if (!(await isHealthReachable(context.request, apiBaseUrl))) {
      throw new Error(`API health is not reachable at ${apiBaseUrl}/actuator/health`);
    }

    logStep("Open home");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await setSubtitle(page, "메인 화면에서 쇼핑 플로우를 시작합니다.");
    await sleep(page, 2_200);
    step(subtitleSegments, "메인 화면에서 쇼핑 플로우를 시작합니다.", 2200);

    logStep("Sign up");
    await page.goto(`${baseUrl}/auth?tab=signup&next=%2Faccount`, {
      waitUntil: "networkidle",
    });
    await setSubtitle(page, "새 고객 계정을 만들고 개인 계정 영역으로 진입합니다.");
    await sleep(page, 1_600);
    step(subtitleSegments, "새 고객 계정을 만들고 개인 계정 영역으로 진입합니다.", 1600);
    const signupInputs = page.locator("form input");
    await typeSlow(signupInputs.nth(0), candidateName);
    await typeSlow(signupInputs.nth(1), candidateEmail);
    await typeSlow(signupInputs.nth(2), candidatePassword);
    await sleep(page, 500);
    step(subtitleSegments, "회원가입 폼에 이름, 이메일, 비밀번호를 입력합니다.", 500);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/account$/, { timeout: 30_000 });
    await setSubtitle(page, "가입 직후 계정 대시보드로 연결됩니다.");
    await sleep(page, 1_700);
    step(subtitleSegments, "가입 직후 계정 대시보드로 연결됩니다.", 1700);

    logStep("Open product");
    await page.goto(`${baseUrl}/products/${productSlug}`, {
      waitUntil: "networkidle",
    });
    await setSubtitle(page, "가입된 고객 상태 그대로 대표 상품을 장바구니에 담습니다.");
    await sleep(page, 1_700);
    step(subtitleSegments, "가입된 고객 상태 그대로 대표 상품을 장바구니에 담습니다.", 1700);
    await page.locator("button.button-hot").first().click();
    await sleep(page, 1_200);
    step(subtitleSegments, "상품을 장바구니에 추가합니다.", 1200);

    logStep("Go to cart");
    await page.goto(`${baseUrl}/cart`, { waitUntil: "networkidle" });
    await setSubtitle(page, "장바구니에서 주문 단계로 이동합니다.");
    await sleep(page, 1_400);
    step(subtitleSegments, "장바구니에서 주문 단계로 이동합니다.", 1400);
    await page.locator('a[href="/checkout"]').first().click();
    await page.waitForURL(/\/checkout$/, { timeout: 30_000 });

    logStep("Fill checkout");
    await setSubtitle(page, "배송 정보와 결제 수단을 입력하고 주문을 완료합니다.");
    await sleep(page, 900);
    step(subtitleSegments, "배송 정보와 결제 수단을 입력하고 주문을 완료합니다.", 900);
    const checkoutInputs = page.locator("form input");
    const existingName = await checkoutInputs.nth(0).inputValue();
    if (!existingName) {
      await typeSlow(checkoutInputs.nth(0), candidateName);
    }
    await typeSlow(checkoutInputs.nth(1), orderPhone);
    await typeSlow(checkoutInputs.nth(2), orderPostalCode);
    await typeSlow(checkoutInputs.nth(3), orderAddress1);
    await typeSlow(checkoutInputs.nth(4), orderAddress2);
    await page.locator("form textarea").fill(orderNote);
    await page.locator('input[name="paymentMethod"][value="CARD"]').check({
      force: true,
    });
    await sleep(page, 900);
    step(subtitleSegments, "주문서 필드를 모두 채우고 카드 결제를 선택합니다.", 900);
    await page.locator('button[form="checkout-form"]').first().click();
    await page.waitForURL(/\/orders\/[A-Z0-9]+$/, { timeout: 30_000 });
    const orderNumber = new URL(page.url()).pathname.split("/").at(-1);
    if (!orderNumber) {
      throw new Error("Order number was not captured.");
    }
    await setSubtitle(page, `주문이 생성되고 주문번호 ${orderNumber}를 확인합니다.`);
    await sleep(page, 2_200);
    step(
      subtitleSegments,
      `주문이 생성되고 주문번호 ${orderNumber}를 확인합니다.`,
      2200,
    );

    logStep("Customer logout");
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await setSubtitle(page, "고객 세션을 종료하고 관리자 화면으로 전환합니다.");
    await sleep(page, 1000);
    step(subtitleSegments, "고객 세션을 종료하고 관리자 화면으로 전환합니다.", 1000);
    await page.getByRole("banner").locator("button").first().click();
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll("a")).some((anchor) =>
        anchor.getAttribute("href")?.includes("/auth?tab=login"),
      ),
    );
    await sleep(page, 700);
    step(subtitleSegments, "고객 로그아웃이 완료됩니다.", 700);

    logStep("Admin login");
    await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
    await setSubtitle(page, "관리자 계정으로 로그인해 운영 콘솔로 들어갑니다.");
    await sleep(page, 1400);
    step(subtitleSegments, "관리자 계정으로 로그인해 운영 콘솔로 들어갑니다.", 1400);
    await typeSlow(page.locator('input[type="email"]'), ADMIN_EMAIL);
    await typeSlow(page.locator('input[type="password"]'), ADMIN_PASSWORD);
    await sleep(page, 400);
    step(subtitleSegments, "관리자 이메일과 비밀번호를 입력합니다.", 400);
    await page.locator('form button[type="submit"]').click();
    await page.waitForURL(/\/admin$/, { timeout: 30_000 });
    await sleep(page, 900);
    step(subtitleSegments, "운영 콘솔 메인 화면이 열립니다.", 900);

    logStep("Admin orders");
    await page.goto(`${baseUrl}/admin/orders`, { waitUntil: "networkidle" });
    await page.getByText(orderNumber).first().waitFor({
      state: "visible",
      timeout: 30_000,
    });
    await setSubtitle(page, "관리자는 주문 목록에서 방금 생성된 주문을 바로 확인합니다.");
    await sleep(page, 2_100);
    step(
      subtitleSegments,
      "관리자는 주문 목록에서 방금 생성된 주문을 바로 확인합니다.",
      2100,
    );

    logStep("Create product");
    await page.goto(`${baseUrl}/admin/products`, { waitUntil: "networkidle" });
    await setSubtitle(page, "같은 콘솔에서 새 상품을 추가 등록해 운영 확장성을 보여줍니다.");
    await sleep(page, 1_500);
    step(
      subtitleSegments,
      "같은 콘솔에서 새 상품을 추가 등록해 운영 확장성을 보여줍니다.",
      1500,
    );
    await page.getByRole("button", { name: "새 상품 등록" }).click();
    await page
      .getByRole("heading", { name: "새 상품을 만드는 중입니다" })
      .waitFor({ state: "visible", timeout: 30_000 });
    await page.locator('select[name="productCategorySlug"]').selectOption({
      index: 0,
    });
    await typeSlow(page.locator('input[name="productSlug"]'), newProductSlug, 28);
    await typeSlow(page.locator('input[name="productName"]'), newProductName, 28);
    await page
      .locator('textarea[name="productSummary"]')
      .fill("데모 비디오용으로 추가한 신규 상품입니다.");
    await page
      .locator('textarea[name="productDescription"]')
      .fill("주문 이후 운영자가 같은 콘솔에서 상품을 확장할 수 있다는 점을 보여주기 위한 데모 등록 상품입니다.");
    await page.locator('input[name="productBadge"]').fill("DEMO");
    await page.locator('input[name="productPrice"]').fill("59000");
    await page.locator('input[name="productStock"]').fill("12");
    await page.locator('input[name="productPopularityScore"]').fill("25");
    await page.locator('input[name="productImageAlt"]').fill(`${newProductName} 이미지`);
    await sleep(page, 700);
    step(
      subtitleSegments,
      "카테고리, 슬러그, 이름, 요약, 가격, 재고를 입력해 신규 상품을 준비합니다.",
      700,
    );
    await page.getByRole("button", { name: "상품 등록", exact: true }).click();
    await page.getByText("상품을 등록했습니다.").waitFor({
      state: "visible",
      timeout: 30_000,
    });
    await setSubtitle(page, "신규 상품 등록이 완료되면서 데모를 마칩니다.");
    await sleep(page, 2_300);
    step(subtitleSegments, "신규 상품 등록이 완료되면서 데모를 마칩니다.", 2300);

    await clearSubtitle(page);

    const result = {
      baseUrl,
      apiBaseUrl,
      candidateEmail,
      candidatePassword,
      orderNumber,
      adminEmail: ADMIN_EMAIL,
      newProductSlug,
      newProductName,
      subtitleSegments,
    };

    if (!record || !videoHandle) {
      return result;
    }

    const timestamp = Date.now();
    const rawVideoPath = await videoHandle.path();
    const rawTargetPath = path.join(
      VIDEO_DIR,
      `vibe-shop-customer-admin-demo-${timestamp}.webm`,
    );
    fs.copyFileSync(rawVideoPath, rawTargetPath);

    const exported = await exportArtifacts(rawTargetPath, timestamp, subtitleSegments);
    return {
      ...result,
      rawVideoPath: rawTargetPath,
      ...exported,
    };
  } finally {
    if (headless || !keepOpen) {
      await context.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  }
}

module.exports = {
  runDemoFlow,
};
