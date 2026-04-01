# Verify Contract Sync Between Frontend and Backend

Check that TypeScript contract types, Java DTOs, and API client functions are aligned.

## Step 1: List All TypeScript Contract Types
Read `packages/contracts/src/storefront.ts` and `packages/contracts/src/admin.ts`.
List every exported type/interface name.

## Step 2: Check Re-exports
Verify:
- `apps/storefront/src/lib/contracts.ts` re-exports from storefront.ts
- `apps/storefront/src/lib/admin-contracts.ts` re-exports from admin.ts

## Step 3: Check API Client Coverage
For each response type:
1. Search for usage in `server-api.ts` or `admin-server-api.ts`
2. Search for usage in `client-api.ts` or `admin-client-api.ts`
3. Flag any defined but unused response types

For each request/payload type:
1. Search for usage in client API files
2. Flag any defined but unused payload types

## Step 4: Check Java DTO Alignment
For each key contract type, verify the Java DTO record has matching field names.
TypeScript (camelCase) must match Java record parameters (camelCase).

Key files to check:
- `apps/api/src/main/java/com/vibeshop/api/cart/CartDtos.java`
- `apps/api/src/main/java/com/vibeshop/api/order/OrderDtos.java`
- `apps/api/src/main/java/com/vibeshop/api/auth/AuthDtos.java`
- `apps/api/src/main/java/com/vibeshop/api/catalog/HomeResponse.java`
- `apps/api/src/main/java/com/vibeshop/api/review/*Response.java`
- `apps/api/src/main/java/com/vibeshop/api/admin/AdminDtos.java`

## Step 5: Report
Produce a table:

| Contract Type | Java DTO | server-api | client-api | Status |
|---|---|---|---|---|

Status: `OK`, `MISSING_JAVA`, `MISSING_API_CLIENT`, `FIELD_MISMATCH`
