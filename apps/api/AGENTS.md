<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# api

## Purpose
Spring Boot 4 REST API backend serving the storefront and admin dashboard. Handles authentication, catalog, cart, orders, reviews, recommendations, wishlists, and admin operations. Uses PostgreSQL with Flyway migrations.

## Key Files

| File | Description |
|------|-------------|
| `build.gradle` | Gradle build config — Spring Boot 4, Java 21, Flyway, JPA, Lombok |
| `settings.gradle` | Gradle project settings |
| `Dockerfile` | Production container build |
| `.env.example` | Environment variable template |
| `gradlew` / `gradlew.bat` | Gradle wrapper scripts |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/main/java/com/vibeshop/api/` | Java source code organized by domain module (see `src/main/java/com/vibeshop/api/AGENTS.md`) |
| `src/main/resources/` | Application config and Flyway SQL migrations |
| `src/test/` | JUnit 5 tests with H2 in-memory DB |
| `gradle/wrapper/` | Gradle wrapper JAR and properties |

## For AI Agents

### Working In This Directory
- Run API: `npm run dev:api` from root, or `./gradlew bootRun` from this dir
- Run tests: `npm run test:api` from root, or `./gradlew test` from this dir
- API binds to port 8081 in local dev (`application-local.properties`)
- Tests use H2 in-memory database, not PostgreSQL
- Use Lombok `@Data`, `@Builder`, etc. — annotations are standard here

### Testing Requirements
- Unit tests in `src/test/java/com/vibeshop/api/`
- Tests must pass with `./gradlew test` before committing
- New endpoints need corresponding controller tests

### Common Patterns
- Domain-driven package structure: each feature is a package (account, auth, cart, catalog, order, etc.)
- Controllers handle HTTP, Services hold business logic, Repositories are Spring Data JPA
- DTOs are inner records or dedicated `*Dtos.java` files
- Validation via `spring-boot-starter-validation` annotations
- Session-based auth with cookie — no JWT

## Dependencies

### Internal
- `packages/contracts/` — TypeScript types mirror Java DTOs (keep in sync)

### External
- Spring Boot 4.0.3 (Web MVC, JPA, Validation, Actuator)
- Flyway (database migrations)
- PostgreSQL 17 (runtime), H2 (tests)
- Lombok (boilerplate reduction)
- Spring Security Crypto (password encoding)

<!-- MANUAL: -->
