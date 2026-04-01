<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# scripts

## Purpose
Build, dev-tooling, and demo automation scripts. Invoked by root `package.json` scripts or run directly.

## Key Files

| File | Description |
|------|-------------|
| `run-api-gradle.mjs` | Wrapper to run Gradle commands for the API app |
| `run-storefront-tool.mjs` | Wrapper to run Next.js/ESLint commands for the storefront |
| `ensure-postgres.mjs` | Ensures PostgreSQL is running before E2E tests |
| `clear-next-dev-locks.mjs` | Clears stale Next.js dev lock files |
| `start-demo-stack.mjs` | Starts full demo stack (DB + API + storefront) |
| `stop-demo-stack.mjs` | Stops the demo stack |
| `executive-demo.playwright.cjs` | Playwright script for executive demo recording |
| `executive-demo-60s.playwright.cjs` | 60-second cut of executive demo |
| `customer-order-admin-demo-core.cjs` | Core logic for customer order admin demo |
| `customer-order-admin-demo-record.cjs` | Records the customer order admin demo |
| `customer-order-admin-demo.playwright.cjs` | Playwright driver for admin demo |
| `generate_local_product_images.py` | Generates placeholder product images locally |
| `curate_generated_product_images.py` | Curates and filters generated product images |
| `fetch_commons_product_sources.py` | Fetches product image source metadata |
| `report_product_image_duplicates.py` | Detects duplicate product images |

## For AI Agents

### Working In This Directory
- `.mjs` scripts are Node ESM — use `import`, not `require`
- `.cjs` scripts are CommonJS — used for Playwright demo scripts
- `.py` scripts are for image asset management (Python 3)
- Demo scripts are designed for `npm run demo:start` / `demo:stop` workflow
- Gradle and storefront wrappers handle cross-platform path resolution

<!-- MANUAL: -->
