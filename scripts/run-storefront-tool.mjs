import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const [tool, ...args] = process.argv.slice(2);

if (!tool) {
  console.error("Usage: node scripts/run-storefront-tool.mjs <next|eslint|tsc> [...args]");
  process.exit(1);
}

const toolEntrypoints = {
  next: path.resolve("apps/storefront/node_modules/next/dist/bin/next"),
  eslint: path.resolve("apps/storefront/node_modules/eslint/bin/eslint.js"),
  tsc: path.resolve("apps/storefront/node_modules/typescript/bin/tsc"),
};

const entrypoint = toolEntrypoints[tool];

if (!entrypoint) {
  console.error(`Unsupported storefront tool: ${tool}`);
  process.exit(1);
}

const child = spawn(process.execPath, [entrypoint, ...args], {
  cwd: path.resolve("apps/storefront"),
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
