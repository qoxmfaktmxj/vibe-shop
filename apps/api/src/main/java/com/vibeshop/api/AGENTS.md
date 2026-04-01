<!-- Parent: ../../../../../../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# api (Java Source)

## Purpose
Main Java source package for the vibe-shop API. Organized by domain module — each package encapsulates a feature area with its own controller, service, DTOs, entities, and repositories.

## Key Files

| File | Description |
|------|-------------|
| `ApiApplication.java` | Spring Boot entry point with `@ConfigurationPropertiesScan` |

## Subdirectories (Domain Modules)

| Package | Purpose |
|---------|---------|
| `account/` | User profile management, shipping addresses |
| `admin/` | Admin dashboard: members, statistics, operations, display settings, reviews |
| `auth/` | Authentication: login/signup, social identity, sessions, user entity |
| `cart/` | Shopping cart: add/remove/update items |
| `catalog/` | Product catalog: categories, search, home page display sections |
| `common/` | Shared error handling: exception types, API error response format |
| `config/` | App configuration: CORS, demo data seeder, session cookies, password encoder |
| `display/` | Home page display sections and items (hero banners, featured products) |
| `order/` | Order lifecycle: checkout, payment (mock gateway), status tracking |
| `recommendation/` | Product view tracking and recommendation engine |
| `review/` | Product reviews: CRUD, helpful votes, images, admin moderation |
| `wishlist/` | User wishlist functionality |

## For AI Agents

### Working In This Directory
- Each domain module is self-contained: Controller → Service → Repository → Entity
- DTOs are typically inner records or `*Dtos.java` files with multiple record definitions
- Entity classes are JPA `@Entity` with Lombok annotations
- Repository interfaces extend `JpaRepository` or `CrudRepository`
- Add new features as new packages — do not pile unrelated code into existing modules

### Testing Requirements
- Each controller should have a corresponding `*ControllerTest.java` in `src/test/`
- Service-level tests for complex business logic
- Tests use H2 in-memory DB with same Flyway migrations

### Common Patterns
- Controller methods return DTOs, never entities directly
- `@Valid` on request bodies for input validation
- `ResourceNotFoundException` (404) and `UnauthorizedException` (401) for error cases
- `AdminAccessGuard` checks admin role before admin operations
- `SessionCookieFactory` manages auth session cookies
- `DemoDataSeeder` populates seed data on startup (conditional via `DemoSeedProperties`)

## Dependencies

### Internal
- `src/main/resources/db/migration/` — Flyway migrations define the schema
- `src/main/resources/application.properties` — Spring config

### External
- Spring Boot Starter Web MVC, JPA, Validation, Actuator
- Flyway for schema migrations
- PostgreSQL driver (runtime), H2 (test)
- Lombok for boilerplate reduction
- Spring Security Crypto for password hashing

<!-- MANUAL: -->
