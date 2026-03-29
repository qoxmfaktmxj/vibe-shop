const { runDemoFlow } = require("./customer-order-admin-demo-core.cjs");

runDemoFlow({
  headless: true,
  record: true,
  keepOpen: false,
  slowMo: Number(process.env.DEMO_SLOW_MO ?? "160"),
})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exit(1);
  });

