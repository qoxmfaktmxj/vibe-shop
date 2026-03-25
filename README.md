# Maru

Maru is a commerce monorepo with a single Next.js web app in `apps/storefront` and a Spring Boot API in `apps/api`. The storefront app serves both customer routes and admin routes under `/admin`.

## Apps

- `apps/storefront`
  - Next.js web app
  - customer routes at `/...`
  - admin routes at `/admin/...`
- `apps/api`
  - Spring Boot API
  - auth/session, catalog, orders, account, review, wishlist, recommendation, and admin endpoints
- `tests/e2e`
  - Playwright browser coverage for key storefront and admin flows

## Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Spring Boot 4, Java 21, JPA, Flyway
- Database: PostgreSQL
- QA: lint, typecheck, build, API tests, Playwright E2E

## Quick Start

1. Install dependencies

```bash
npm ci
npm ci --prefix apps/storefront
```

2. Start local Postgres

```bash
npm run infra:up
```

The local compose stack exposes Postgres on `127.0.0.1:55432` by default.

3. Run the apps

```bash
npm run dev:api
npm run dev:storefront
```

Default local ports:

- storefront: `http://127.0.0.1:3000`
- admin: `http://127.0.0.1:3000/admin`
- api: `http://127.0.0.1:8080`

## Quality Gates

Use these from the repo root:

```bash
npm run lint:storefront
npm run typecheck
npm run build:storefront
npm run test:api
npm run qa
npm run qa:e2e
```

`npm run qa` is the repo-wide non-E2E gate:

- storefront lint + typecheck + build
- API tests

## Deployment

Deployment assets live at the root:

- `compose.deploy.yaml`
- `.env.deploy.example`
- `docs/deploy-shop-minseok91-cloud.md`

The deployment stack includes:

- PostgreSQL
- API
- storefront web app (customer + admin routes)

## Source of Truth

Current documentation lives here:

- `docs/README.md`
- `docs/api-contract-v1.md`
- `docs/erd-v1.md`
- `docs/design-system.md`
- `docs/screen-inventory-and-ux-audit-2026-03-24.md`

Historical planning documents remain in `docs/`, but they are explicitly marked `Status: historical` and should not be treated as the current product contract.

## Current Risks

- API, storefront, and `/admin` routes still need coordinated regression coverage after large route or auth changes.
- Demo and deployment configuration must stay environment-driven; avoid restoring hard-coded production defaults.
- Frontend contracts are centralized now, but API schema generation is still a future step.
