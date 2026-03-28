process.env.DEMO_STEP_MS = process.env.DEMO_STEP_MS ?? "900";
process.env.DEMO_SHOT_PREFIX = process.env.DEMO_SHOT_PREFIX ?? "executive-demo";

require("./executive-demo-60s.playwright.cjs");
