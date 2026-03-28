import { existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const pidFile = path.join(rootDir, "output", "local", "demo-stack-pids.json");

function stopPid(pid) {
  if (!pid) {
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // already gone
  }
}

function main() {
  if (!existsSync(pidFile)) {
    console.log("No demo stack pid file found.");
    return;
  }

  const data = JSON.parse(readFileSync(pidFile, "utf8"));
  stopPid(data.pids?.storefront);
  stopPid(data.pids?.api);
  unlinkSync(pidFile);
  console.log("Stopped demo stack processes recorded in pid file.");
}

main();
