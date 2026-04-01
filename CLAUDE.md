# vibe-shop Agent Instructions

Korean e-commerce monorepo: Next.js 16 storefront + Spring Boot 4 API + PostgreSQL 17.
All user-facing text is Korean. Brand name is "MARU" (마루).

## Architecture at a Glance

| Layer | Location | Tech |
|-------|----------|------|
| Frontend | `apps/storefront/` | Next.js 16, React 19, Tailwind 4, TypeScript |
| Backend | `apps/api/` | Spring Boot 4, Java 21, Lombok, JPA |
| Contracts | `packages/contracts/src/` | TypeScript type definitions |
| Migrations | `apps/api/src/main/resources/db/migration/` | Flyway SQL (V1–V24+) |
| E2E Tests | `tests/e2e/` | Playwright `.spec.js` |
| API Docs | `docs/api-contract-v1.md` | REST endpoint documentation |

## Commands Reference

```
npm run infra:up                  # Start PostgreSQL (required first)
npm run dev                       # Start API (8081) + storefront (3200)
npm run qa                        # Full QA: lint → typecheck → build → API tests
npm run test:api                  # Java unit tests only (H2 in-memory DB)
npm run lint:storefront           # ESLint
npm run typecheck:storefront      # TypeScript strict check
npm run build:storefront          # Next.js production build
npm run qa:e2e                    # Build + Playwright E2E (requires PostgreSQL)
```

## Hard Rules (Never Violate)

1. **Contract-first development.** When adding or changing an API endpoint, update
   `packages/contracts/src/storefront.ts` or `admin.ts` FIRST, then Java DTO, then API clients.

2. **Four API client files must stay in sync.** Every exposed endpoint needs functions in:
   - `apps/storefront/src/lib/server-api.ts` — Server Components (customer)
   - `apps/storefront/src/lib/client-api.ts` — Client Components (customer)
   - `apps/storefront/src/lib/admin-server-api.ts` — Server Components (admin)
   - `apps/storefront/src/lib/admin-client-api.ts` — Client Components (admin)
   Never import server-api from a `"use client"` file.

3. **Schema changes require Flyway migrations.** Never modify existing migration files.
   New migrations: `V{N}__{description}.sql` where N = current max + 1.
   Check current max: `ls apps/api/src/main/resources/db/migration/ | sort -V | tail -1`

4. **All user-facing strings must be in Korean.** Button labels, error messages,
   placeholders, page titles, status labels, tooltips. Java validation messages too.

5. **Domain-driven package structure in Java.** Each feature is a self-contained package
   under `com.vibeshop.api.{domain}/` with Controller, Service, Repository, Entity, DTOs.

6. **Types are never duplicated.** Shared types live in `packages/contracts/`. The storefront
   re-exports via `src/lib/contracts.ts` and `src/lib/admin-contracts.ts`.

7. **Run `npm run qa` before declaring any work complete.** Non-negotiable.

## Feature Development Flow

### Step 1: Contract Types
Define request/response types in `packages/contracts/src/storefront.ts` (or `admin.ts`).

### Step 2: Database Migration (if schema change needed)
Create `apps/api/src/main/resources/db/migration/V{N}__{description}.sql`.
Use `BIGSERIAL PRIMARY KEY`, `TIMESTAMPTZ`, named constraints/indexes.

### Step 3: Java Backend
- **Entity:** JPA `@Entity` with Lombok. Column names match migration (snake_case).
- **Repository:** `JpaRepository<Entity, Long>`
- **DTOs:** Inner records in `*Dtos.java`. Field names must match TS contracts (camelCase).
- **Service:** Business logic. Returns DTOs, never entities.
- **Controller:** `@RestController` at `/api/v1/...`. `@Valid` on request bodies.
  Auth: `@CookieValue(value = "vibe_shop_session", required = false)`.
  Admin: `AdminAccessGuard.requireAdmin(sessionToken)`.

### Step 4: Java Tests
`@SpringBootTest` + `@AutoConfigureMockMvc` + `JdbcClient` for test data.
Verify: `npm run test:api`

### Step 5: Frontend API Clients
Add functions to the correct client file(s). Import types from `@/lib/contracts`.
Server-side: `await getCookieHeaders()`. Client-side: `fetchJson<T>()` with `credentials: "include"`.

### Step 6: React Components / Pages
Server Components by default. `"use client"` only for state/effects/events.
Tailwind 4 classes. Korean text. `@/` path alias.

### Step 7: Quality Gate
Run `npm run qa`. If E2E relevant, run `npm run qa:e2e`.

## Bug Fix Flow

1. Reproduce: identify failing behavior and which layer(s) are involved
2. Read the relevant `AGENTS.md` in the directory you are working in
3. Check contract types match between TS and Java
4. Fix the root cause, not the symptom
5. Add or update test to cover the bug
6. Run `npm run qa`

## Refactoring Flow

1. Identify all affected files (`grep` across both `apps/api` and `apps/storefront`)
2. If contract type changes needed, follow Feature Development Flow
3. Verify `npm run qa` passes after each logical change
4. Do not rename API paths without updating all four API client files

## File Location Rules

| What | Where |
|------|-------|
| New API endpoint (customer) | `apps/api/src/main/java/com/vibeshop/api/{domain}/` |
| New API endpoint (admin) | `apps/api/src/main/java/com/vibeshop/api/admin/` |
| New contract type (customer) | `packages/contracts/src/storefront.ts` |
| New contract type (admin) | `packages/contracts/src/admin.ts` |
| New customer page | `apps/storefront/src/app/(store)/{route}/page.tsx` |
| New admin page | `apps/storefront/src/app/admin/{route}/page.tsx` |
| New customer component | `apps/storefront/src/components/{feature}/` |
| New admin component | `apps/storefront/src/components/admin-{name}.tsx` |
| New shared utility | `apps/storefront/src/lib/{name}.ts` |
| New DB migration | `apps/api/src/main/resources/db/migration/V{N}__*.sql` |
| New Java test | `apps/api/src/test/java/com/vibeshop/api/{domain}/` |
| New E2E test | `tests/e2e/{feature}.spec.js` |

## Naming Conventions

- **Java classes:** PascalCase. Entity = domain noun, DTO = `*Response`/`*Request`/`*Dtos`
- **Java packages:** lowercase single word matching the domain (`cart`, `catalog`, `order`)
- **TypeScript types:** PascalCase from contracts (`CartResponse`, `AdminOrder`)
- **API client functions:** camelCase verbs (`getProducts`, `createOrder`)
- **React components:** PascalCase export from kebab-case file (`product-card.tsx` → `ProductCard`)
- **Routes:** kebab-case directories (`lookup-order`, not `lookupOrder`)
- **Migrations:** `V{N}__{snake_case_description}.sql` (double underscore)

## Common Error Patterns and Recovery

### "Type X is not assignable to type Y" in storefront
**Cause:** Contract type updated but API client or component still uses old shape.
**Fix:** Trace contract → API client → component. Update all three.

### Flyway migration checksum mismatch
**Cause:** Existing migration file was modified.
**Fix:** Revert the change. Create a new V{N} file instead.

### "Cannot find module @/lib/contracts"
**Cause:** Re-export in `src/lib/contracts.ts` missing the new type.
**Fix:** Check `packages/contracts/src/index.ts` exports both `./storefront` and `./admin`.

### Next.js hydration mismatch
**Cause:** Server Component importing client-only code, or `"use client"` missing.
**Fix:** Extract interactive parts into a separate `"use client"` component file.

### Admin endpoints returning 401
**Cause:** Wrong cookie name or missing `AdminAccessGuard.requireAdmin()`.
**Fix:** Admin uses `vibe_shop_admin_session`, customer uses `vibe_shop_session`.

## Environment

- Node.js >= 22, npm >= 10
- Java 21 (Gradle toolchain auto-downloads)
- Docker for PostgreSQL 17 (`compose.yaml`, port 55432)
- Playwright browsers: `npm run qa:e2e:install`
