import net from "node:net";
import { spawn } from "node:child_process";
import process from "node:process";

const DB_HOST = process.env.DB_HOST ?? "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT ?? "5433");
const STARTUP_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with code ${code}\n${stderr || stdout}`.trim(),
        ),
      );
    });
  });
}

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });

    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1_500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function waitForDatabase(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await canConnect(host, port)) {
      return;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Postgres did not become reachable on ${host}:${port} within ${timeoutMs}ms.`);
}

async function main() {
  if (await canConnect(DB_HOST, DB_PORT)) {
    console.log(`Postgres is already reachable on ${DB_HOST}:${DB_PORT}.`);
    return;
  }

  console.log(`Starting Postgres via Docker Compose for ${DB_HOST}:${DB_PORT}...`);
  await run("docker", ["compose", "up", "-d", "postgres"]);
  await waitForDatabase(DB_HOST, DB_PORT, STARTUP_TIMEOUT_MS);
  console.log(`Postgres is ready on ${DB_HOST}:${DB_PORT}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
