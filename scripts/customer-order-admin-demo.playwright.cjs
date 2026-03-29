const { runDemoFlow } = require("./customer-order-admin-demo-core.cjs");

runDemoFlow({
  headless: process.env.DEMO_HEADLESS === "1",
  record: process.env.DEMO_RECORD === "1",
  keepOpen: process.env.DEMO_KEEP_OPEN === "1",
  slowMo: Number(process.env.DEMO_SLOW_MO ?? "140"),
})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });

