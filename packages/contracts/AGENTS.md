<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# contracts

## Purpose
Shared TypeScript type definitions for the API contract between the storefront frontend and the Spring Boot backend. Single source of truth for request/response shapes.

## Key Files

| File | Description |
|------|-------------|
| `src/index.ts` | Barrel export — re-exports all contracts |
| `src/storefront.ts` | Customer-facing API types (catalog, cart, orders, auth, reviews, etc.) |
| `src/admin.ts` | Admin dashboard API types (members, statistics, operations, display) |

## For AI Agents

### Working In This Directory
- When adding a new API endpoint, define the request/response types here first
- Keep types in sync with Java DTOs in `apps/api/`
- Storefront imports these via `packages/contracts`
- Changes here affect both frontend and backend — coordinate updates

### Common Patterns
- Types are plain TypeScript interfaces/types — no runtime validation
- Grouped by domain in dedicated files (storefront vs admin)
- Barrel export pattern via `index.ts`

## Dependencies

### Internal
- Consumed by `apps/storefront/`
- Must mirror Java DTOs in `apps/api/`

<!-- MANUAL: -->
