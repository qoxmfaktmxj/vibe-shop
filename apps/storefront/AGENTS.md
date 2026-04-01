<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# storefront

## Purpose
Next.js 16 frontend serving both the customer-facing shop and the admin dashboard. Uses React 19, Tailwind CSS 4, and TypeScript. Proxies API calls to the Spring Boot backend.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies: Next.js 16, React 19, Tailwind 4 |
| `next.config.ts` | Next.js config with Turbopack root set to monorepo root |
| `tsconfig.json` | TypeScript strict configuration |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `eslint.config.mjs` | ESLint config (Next.js preset) |
| `.env.example` | API URL and auth config template |
| `.env.local.example` | Local dev overrides template |
| `Dockerfile` | Production container build |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and API routes (see `src/app/AGENTS.md`) |
| `src/components/` | React components organized by feature (see `src/components/AGENTS.md`) |
| `src/lib/` | Utilities, API clients, stores, fonts (see `src/lib/AGENTS.md`) |
| `public/` | Static assets: product images, icons, social login images |

## For AI Agents

### Working In This Directory
- Run: `npm run dev:storefront` from root (port 3200)
- Build: `npm run build:storefront` from root
- Lint: `npm run lint:storefront` from root
- Typecheck: `npm run typecheck:storefront` from root
- API proxy: `/api/v1/[...path]` routes forward to the backend

### Testing Requirements
- `npm run lint:storefront` and `npm run typecheck:storefront` must pass
- E2E tests in `tests/e2e/` cover storefront flows
- No unit test framework set up for frontend — rely on E2E

### Common Patterns
- App Router with `(store)` route group for customer pages and `admin` for admin pages
- Server Components by default; `"use client"` only when needed (state, effects, events)
- API calls: `server-api.ts` for server components, `client-api.ts` for client components
- Admin API calls: `admin-server-api.ts` and `admin-client-api.ts` (separate auth)
- Tailwind 4 utility classes — no CSS modules
- Korean UI text — all user-facing strings are in Korean
- GmarketSans font family (Light, Medium, Bold)

## Dependencies

### Internal
- `packages/contracts/` — shared TypeScript types

### External
- Next.js 16.1.6 with Turbopack
- React 19.2.3
- Tailwind CSS 4
- TypeScript 5

<!-- MANUAL: -->
