import { spawn } from "node:child_process";
import { mkdirSync, openSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const storefrontDir = path.join(rootDir, "apps", "storefront");
const outputDir = path.join(rootDir, "output", "local");
const pidFile = path.join(outputDir, "demo-stack-pids.json");

const apiHealthUrl = "http://127.0.0.1:8180/actuator/health";
const storefrontCandidates = ["http://127.0.0.1:4100", "http://localhost:4100"];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function spawnDetached(command, args, options) {
  mkdirSync(outputDir, { recursive: true });
  const stdout = openSync(options.stdoutPath, "a");
  const stderr = openSync(options.stderrPath, "a");
  const child = spawn(command, args, {
    ...options,
    detached: true,
    stdio: ["ignore", stdout, stderr],
  });
  child.unref();
  return child.pid;
}

async function ensureStorefrontBuild(env) {
  const buildIdPath = path.join(storefrontDir, ".next", "BUILD_ID");
  if (existsSync(buildIdPath)) {
    return;
  }

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(storefrontDir, "node_modules", "next", "dist", "bin", "next"), "build"],
      {
        cwd: storefrontDir,
        env,
        stdio: "inherit",
      },
    );
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`next build failed with ${code}`))));
    child.on("error", reject);
  });
}

async function waitForAny(urls, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const url of urls) {
      if (await isReachable(url)) {
        return url;
      }
    }
    await delay(1000);
  }
  return null;
}

async function main() {
  mkdirSync(outputDir, { recursive: true });

  const apiEnv = {
    ...process.env,
    APP_PORT: "8180",
    SPRING_PROFILES_ACTIVE: "default",
    MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS: "always",
    SPRING_DATASOURCE_URL: "jdbc:postgresql://127.0.0.1:55432/vibeshop",
    SPRING_DATASOURCE_USERNAME: "vibeshop",
    SPRING_DATASOURCE_PASSWORD: "vibeshop",
    APP_DEMO_SEED_ENABLED: "true",
    APP_DEMO_SEED_NORMALIZE_E2E_STOCK: "true",
    APP_DEMO_ADMIN_PASSWORD: process.env.DEMO_ADMIN_PASSWORD ?? "admin1234!",
    CORS_ALLOWED_ORIGINS:
      process.env.CORS_ALLOWED_ORIGINS ??
      "http://127.0.0.1:4100,http://localhost:4100,http://127.0.0.1:3000,http://localhost:3000",
  };

  const storefrontEnv = {
    ...process.env,
    API_BASE_URL: "http://127.0.0.1:8180",
    NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8180",
    NEXT_PUBLIC_APP_URL: "http://127.0.0.1:4100",
    APP_ORIGIN: "http://127.0.0.1:4100",
  };

  const pids = {};

  if (!(await isReachable(apiHealthUrl))) {
    pids.api = spawnDetached(
      process.execPath,
      [path.join(rootDir, "scripts", "run-api-gradle.mjs"), "bootRun"],
      {
        cwd: rootDir,
        env: apiEnv,
        stdoutPath: path.join(outputDir, "demo-api-8180.log"),
        stderrPath: path.join(outputDir, "demo-api-8180.err.log"),
      },
    );
  }

  const apiReady = await waitForAny([apiHealthUrl], 120_000);
  if (!apiReady) {
    throw new Error("API did not start on 8180.");
  }

  await ensureStorefrontBuild(storefrontEnv);

  if (!(await waitForAny(storefrontCandidates, 1000))) {
    pids.storefront = spawnDetached(
      process.execPath,
      [path.join(storefrontDir, "node_modules", "next", "dist", "bin", "next"), "start", "--hostname", "0.0.0.0", "--port", "4100"],
      {
        cwd: storefrontDir,
        env: storefrontEnv,
        stdoutPath: path.join(outputDir, "demo-storefront-4100.log"),
        stderrPath: path.join(outputDir, "demo-storefront-4100.err.log"),
      },
    );
  }

  const storefrontReady = await waitForAny(storefrontCandidates, 120_000);
  if (!storefrontReady) {
    throw new Error("Storefront did not start on 4100.");
  }

  writeFileSync(
    pidFile,
    JSON.stringify(
      {
        startedAt: new Date().toISOString(),
        apiHealthUrl,
        storefrontUrl: storefrontReady,
        pids,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        apiHealthUrl,
        storefrontUrl: storefrontReady,
        pids,
        pidFile,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
