const { defineConfig } = require("playwright/test");

function getPort(url, fallbackPort) {
  try {
    return String(new URL(url).port || fallbackPort);
  } catch {
    return String(fallbackPort);
  }
}

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8180";

const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:4100";
const apiPort = process.env.E2E_API_PORT ?? getPort(apiBaseUrl, 8180);
const storefrontPort = process.env.E2E_STOREFRONT_PORT ?? getPort(storefrontUrl, 3100);
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "output/playwright-report" }],
  ],
  outputDir: "output/test-results",
  use: {
    baseURL: storefrontUrl,
    viewport: { width: 1440, height: 1200 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: `node scripts/run-api-gradle.mjs bootRun`,
      cwd: ".",
      url: `${apiBaseUrl}/actuator/health`,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        APP_PORT: process.env.APP_PORT ?? apiPort,
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE ?? "local",
        DB_HOST: process.env.DB_HOST ?? "127.0.0.1",
        DB_PORT: process.env.DB_PORT ?? "55432",
        DB_NAME: process.env.DB_NAME ?? "vibeshop",
        DB_USERNAME: process.env.DB_USERNAME ?? "vibeshop",
        DB_PASSWORD: process.env.DB_PASSWORD ?? "vibeshop",
        APP_DEMO_SEED_NORMALIZE_E2E_STOCK: process.env.APP_DEMO_SEED_NORMALIZE_E2E_STOCK ?? "true",
        APP_DEMO_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD ?? process.env.APP_DEMO_ADMIN_PASSWORD ?? "admin1234!",
        CORS_ALLOWED_ORIGINS:
          process.env.CORS_ALLOWED_ORIGINS ??
          `${storefrontUrl},http://127.0.0.1:3000,http://localhost:3000`,
      },
    },
    {
      command:
        `node scripts/run-storefront-tool.mjs next build && ` +
        `node scripts/run-storefront-tool.mjs next start --hostname 127.0.0.1 --port ${storefrontPort}`,
      cwd: ".",
      url: storefrontUrl,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        API_BASE_URL: apiBaseUrl,
        NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
        NEXT_PUBLIC_APP_URL: storefrontUrl,
        APP_ORIGIN: storefrontUrl,
        GOOGLE_CLIENT_ID: process.env.E2E_GOOGLE_CLIENT_ID ?? "",
        GOOGLE_CLIENT_SECRET: process.env.E2E_GOOGLE_CLIENT_SECRET ?? "",
        KAKAO_CLIENT_ID: process.env.E2E_KAKAO_CLIENT_ID ?? "",
        KAKAO_CLIENT_SECRET: process.env.E2E_KAKAO_CLIENT_SECRET ?? "",
      },
    },
  ],
});
