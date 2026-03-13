# E2E

브라우저 기반 핵심 시나리오를 이 디렉터리 기준으로 관리한다.
`npm run qa:e2e` runs the storefront MVP smoke flow against a live local app.

Expected local services:

- storefront at `http://127.0.0.1:3000`
- api at `http://127.0.0.1:8080`

Artifacts are written to `output/playwright/`.
