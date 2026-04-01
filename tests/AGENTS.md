<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# tests

## Purpose
End-to-end browser test suites using Playwright. Tests cover the full stack: storefront UI, admin dashboard, authentication, catalog, and payment flows.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `e2e/` | Playwright E2E test specs (see `e2e/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Run E2E tests with `npm run qa:e2e` from root (builds storefront first)
- Use `npm run qa:e2e:headed` for visible browser debugging
- PostgreSQL must be running (`npm run infra:up`)
- Install browsers first if needed: `npm run qa:e2e:install`

<!-- MANUAL: -->
