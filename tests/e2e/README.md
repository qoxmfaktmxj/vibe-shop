# E2E

브라우저 기반 핵심 시나리오를 이 디렉터리 기준으로 관리한다.
`npm run qa:e2e` runs the storefront MVP smoke flow with Playwright and starts the local API/storefront servers automatically.

Expected local services:

- postgres at `localhost:5433`
- storefront at `http://127.0.0.1:3100`
- api at `http://127.0.0.1:8180`

Recommended local flow:

1. `npm run infra:up`
2. `npm run qa:e2e:install`
3. `npm run qa:e2e`

Environment overrides:

- `E2E_STOREFRONT_URL`
- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `PLAYWRIGHT_REUSE_EXISTING_SERVER=1`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

Artifacts are written to `output/playwright/`, `output/playwright-report/`, and `output/test-results/`.
