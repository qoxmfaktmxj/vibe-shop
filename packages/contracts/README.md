# Shared Contracts

`packages/contracts` is the single TypeScript source of truth for the storefront and admin API
request/response contracts used by the frontend apps.

- `src/storefront.ts`: storefront-facing contract types
- `src/admin.ts`: admin-facing contract types

Each app keeps a thin local `src/lib/contracts.ts` re-export so existing imports continue to work
without duplicating the actual type definitions.
