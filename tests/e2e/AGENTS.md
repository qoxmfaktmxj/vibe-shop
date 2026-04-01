<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# e2e

## Purpose
Playwright end-to-end test specs covering the full storefront and admin flows. Tests run against a built storefront with real API and PostgreSQL.

## Key Files

| File | Description |
|------|-------------|
| `README.md` | Test setup and running instructions |
| `mvp-smoke.spec.js` | Core MVP smoke tests — homepage, navigation, basic flows |
| `catalog-display.spec.js` | Product catalog and display section tests |
| `auth-session.spec.js` | Authentication and session management tests |
| `auth-social.spec.js` | Social login (Google, Kakao) flow tests |
| `account-header.spec.js` | Account header button and dropdown tests |
| `admin-dashboard.spec.js` | Admin dashboard and login tests |
| `mobile-storefront.spec.js` | Mobile responsive layout tests |
| `payment-adapter.spec.js` | Payment flow and mock gateway tests |
| `z-admin-display-category.spec.js` | Admin display and category management |
| `z-admin-member-statistics.spec.js` | Admin member and statistics views |
| `z-review-wishlist.spec.js` | Review and wishlist feature tests |

## For AI Agents

### Working In This Directory
- Run all: `npm run qa:e2e` from root
- Run headed: `npm run qa:e2e:headed` for visual debugging
- Run UI mode: `npm run qa:e2e:ui` for interactive test runner
- Files prefixed with `z-` run last (alphabetical order matters)
- Tests are plain JavaScript (`.spec.js`), not TypeScript

### Testing Requirements
- Full stack must be running (PostgreSQL + API + storefront)
- `npm run qa:e2e` handles build + postgres check + test execution
- New features should have corresponding E2E specs

### Common Patterns
- Each spec file covers a feature area
- Tests expect demo seed data to be present (seeded by API on startup)
- Use Playwright locators — prefer `getByRole`, `getByText` over CSS selectors

<!-- MANUAL: -->
