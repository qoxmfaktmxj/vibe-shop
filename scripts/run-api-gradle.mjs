import { spawn, spawnSync } from "node:child_process";
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
const javaExecutableName = isWindows ? "java.exe" : "java";

function parseJavaMajorVersion(output) {
  const match = output.match(/version "([^"]+)"/);
  if (!match) {
    return null;
  }

  const [major, fallbackMajor] = match[1].split(/[._+-]/);
  const parsedMajor = Number(major);
  if (!Number.isFinite(parsedMajor)) {
    return null;
  }

  return parsedMajor === 1 ? Number(fallbackMajor) : parsedMajor;
}

function resolveJavaMajor(commandPath) {
  const result = spawnSync(commandPath, ["-version"], {
    encoding: "utf8",
    shell: isWindows,
  });

  if (result.error) {
    return null;
  }

  return parseJavaMajorVersion(`${result.stdout ?? ""}\n${result.stderr ?? ""}`);
}

function resolveGradleEnv() {
  const nextEnv = { ...process.env };
  const javaHome = process.env.JAVA_HOME?.trim();
  const pathJavaMajor = resolveJavaMajor(javaExecutableName);

  if (!javaHome || !pathJavaMajor || pathJavaMajor < 17) {
    return nextEnv;
  }

  const javaHomeExecutable = path.join(javaHome, "bin", javaExecutableName);
  const javaHomeMajor = resolveJavaMajor(javaHomeExecutable);

  if (!javaHomeMajor || javaHomeMajor < 17) {
    delete nextEnv.JAVA_HOME;
  }

  const isBootRun = args[0] === "bootRun";
  if (
    isBootRun &&
    !nextEnv.SPRING_PROFILES_ACTIVE &&
    !nextEnv.SPRING_PROFILE_ACTIVE
  ) {
    nextEnv.SPRING_PROFILES_ACTIVE = "local";
  }

  return nextEnv;
}

const child = spawn(command, args, {
  cwd: projectDir,
  env: resolveGradleEnv(),
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
