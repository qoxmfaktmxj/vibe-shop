# Create a New Flyway Migration

## Step 1: Determine Version Number
```
ls apps/api/src/main/resources/db/migration/ | sort -V | tail -1
```
Extract the version number and add 1.

## Step 2: Create the File
`apps/api/src/main/resources/db/migration/V{N}__{description}.sql`

Rules:
- Double underscore between version and description
- Description uses snake_case, no spaces
- Example: `V25__add_coupons.sql`

## Step 3: Write the SQL
PostgreSQL 17 syntax. Project conventions:

```sql
CREATE TABLE table_name (
    id BIGSERIAL PRIMARY KEY,
    foreign_id BIGINT NOT NULL REFERENCES other_table (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT table_name_some_rule CHECK (amount >= 0),
    CONSTRAINT table_name_unique_field UNIQUE (some_field)
);

CREATE INDEX table_name_foreign_created_idx
    ON table_name (foreign_id, created_at DESC);
```

## Step 4: Verify
```
npm run test:api
```
Flyway migrations run against H2 in-memory DB during tests.

## Step 5: Check Entity Alignment
JPA `@Entity` class `@Column(name = "...")` must match migration column names.
JPA: `snake_case` DB columns mapped to `camelCase` Java fields.

## Never Do
- Never modify an existing V{N} migration file
- Never skip version numbers
- Never use `DROP TABLE` without confirming data loss is acceptable
