# Full QA Pipeline

Run the complete quality assurance pipeline. Execute each step sequentially and stop at the first failure.

## Steps

1. **Lint storefront:**
   ```
   npm run lint:storefront
   ```
   Fix all ESLint errors before proceeding.

2. **TypeScript strict check:**
   ```
   npm run typecheck:storefront
   ```
   Common cause of failure: contract type mismatch between `packages/contracts/` and API client usage.

3. **Build storefront:**
   ```
   npm run build:storefront
   ```
   Common cause: import error or Server/Client Component boundary violation.

4. **API unit tests:**
   ```
   npm run test:api
   ```
   Tests run on H2 in-memory DB with Flyway migrations.

5. **Report results:**
   Summarize which steps passed and which failed.
   Do NOT declare work complete if any step failed.
