const { defineConfig } = require("playwright/test");

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8180";

const storefrontUrl = process.env.E2E_STOREFRONT_URL ?? "http://127.0.0.1:3100";
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
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
      command: "node scripts/run-api-gradle.mjs bootRun",
      cwd: ".",
      url: `${apiBaseUrl}/actuator/health`,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        APP_PORT: process.env.APP_PORT ?? "8180",
        DB_HOST: process.env.DB_HOST ?? "127.0.0.1",
        DB_PORT: process.env.DB_PORT ?? "5433",
        DB_NAME: process.env.DB_NAME ?? "vibeshop",
        DB_USERNAME: process.env.DB_USERNAME ?? "vibeshop",
        DB_PASSWORD: process.env.DB_PASSWORD ?? "vibeshop",
        CORS_ALLOWED_ORIGINS:
          process.env.CORS_ALLOWED_ORIGINS ??
          "http://127.0.0.1:3100,http://127.0.0.1:3000,http://localhost:3000",
      },
    },
    {
      command: "node scripts/run-storefront-tool.mjs next dev --hostname 127.0.0.1 --port 3100",
      cwd: ".",
      url: storefrontUrl,
      reuseExistingServer,
      timeout: 120_000,
      env: {
        ...process.env,
        API_BASE_URL: apiBaseUrl,
        NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
      },
    },
  ],
});
