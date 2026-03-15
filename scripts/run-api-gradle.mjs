import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/run-api-gradle.mjs <gradle-task> [...args]");
  process.exit(1);
}

const projectDir = path.resolve("apps/api");
const isWindows = process.platform === "win32";
const command = isWindows ? "gradlew.bat" : "./gradlew";

const child = spawn(command, args, {
  cwd: projectDir,
  stdio: "inherit",
  shell: isWindows,
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
