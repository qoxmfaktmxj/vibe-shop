<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# apps

## Purpose
Contains the two main applications: a Spring Boot API backend and a Next.js storefront frontend. Both apps are developed independently but share contract types from `packages/contracts/`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | Spring Boot 4 + Java 21 REST API (see `api/AGENTS.md`) |
| `storefront/` | Next.js 16 + React 19 + Tailwind 4 frontend (see `storefront/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Frontend and backend are separate applications — do not mix concerns
- Frontend communicates with backend exclusively through API client layers
- Shared types are defined in `packages/contracts/`, not duplicated in either app
- API runs on port 8081 (local dev), storefront on port 3200

### Common Patterns
- API endpoints follow REST conventions; storefront proxies via `/api/v1/[...path]` route
- Admin features live inside the storefront app under `/admin` routes, not as a separate app

<!-- MANUAL: -->
