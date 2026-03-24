# E2E

브라우저 기반 핵심 사용자/관리자 시나리오를 Playwright로 검증합니다.
`npm run qa:e2e`는 로컬 API/스토어프론트 서버를 자동 기동한 뒤 전체 E2E를 실행합니다.

## Expected local services

- postgres: `127.0.0.1:55432`
- storefront: `http://127.0.0.1:4100`
- admin: `http://127.0.0.1:4100/admin`
- api: `http://127.0.0.1:8180`

## Recommended local flow

1. `npm run infra:up`
2. `npm run qa:e2e:install`
3. `npm run qa:e2e`

## Environment overrides

- `E2E_STOREFRONT_URL`
- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `E2E_ADMIN_PASSWORD`
- `PLAYWRIGHT_REUSE_EXISTING_SERVER=1`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

Artifacts are written to `output/playwright/`, `output/playwright-report/`, and `output/test-results/`.
