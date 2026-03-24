import { access, rm } from "node:fs/promises";
import path from "node:path";

const LOCK_PATHS = [
  path.resolve("apps/storefront/.next/dev/lock"),
  path.resolve("apps/admin/.next/dev/lock"),
];

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1") {
    return;
  }

  await Promise.all(
    LOCK_PATHS.map(async (lockPath) => {
      if (await exists(lockPath)) {
        await rm(lockPath, { force: true });
      }
    }),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
