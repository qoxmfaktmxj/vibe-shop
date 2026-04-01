# New Feature Scaffold

Guide for implementing a new feature end-to-end.

## Input Required
- Feature name (e.g., "coupon", "notification")
- Domain area (customer or admin)
- Whether a new DB table is needed

## Scaffold Sequence

### 1. Contract Types
Define TypeScript types first — this is the source of truth.

Customer features: `packages/contracts/src/storefront.ts`
Admin features: `packages/contracts/src/admin.ts`

Define at minimum:
- Response type(s) for GET endpoints
- Request payload type(s) for POST/PUT endpoints

### 2. Database Migration (if needed)
```
ls apps/api/src/main/resources/db/migration/ | sort -V | tail -1
```
Create: `V{max+1}__{feature_name}.sql`

Conventions: `BIGSERIAL PRIMARY KEY`, `TIMESTAMPTZ NOT NULL`, named constraints/indexes,
foreign keys with `ON DELETE CASCADE`.

### 3. Java Backend Package
Create: `apps/api/src/main/java/com/vibeshop/api/{feature}/`

Files in order:
1. **Entity** — JPA `@Entity` with Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
2. **Repository** — `extends JpaRepository<Entity, Long>`
3. **DTOs** — Inner records matching TypeScript contract field names exactly (camelCase)
4. **Service** — Business logic, returns DTOs not entities
5. **Controller** — `@RestController` at `/api/v1/...`, `@Valid` on request bodies

Admin features: use `AdminAccessGuard.requireAdmin(sessionToken)`.

### 4. Java Test
Create: `apps/api/src/test/java/com/vibeshop/api/{feature}/{Feature}ControllerTest.java`

Pattern: `@SpringBootTest` + `@AutoConfigureMockMvc` + `JdbcClient` for test data.
Verify: `npm run test:api`

### 5. Frontend API Clients
Customer features:
- `apps/storefront/src/lib/server-api.ts` (Server Components)
- `apps/storefront/src/lib/client-api.ts` (Client Components)

Admin features:
- `apps/storefront/src/lib/admin-server-api.ts`
- `apps/storefront/src/lib/admin-client-api.ts`

Import types from `@/lib/contracts` or `@/lib/admin-contracts`.

### 6. React UI
Customer pages: `apps/storefront/src/app/(store)/{route}/page.tsx`
Admin pages: `apps/storefront/src/app/admin/{route}/page.tsx`

Customer components: `apps/storefront/src/components/{feature}/`
Admin components: `apps/storefront/src/components/admin-{feature}.tsx`

All user-facing text in Korean. Tailwind 4 classes. Server Components by default.

### 7. Verify
```
npm run qa
```
