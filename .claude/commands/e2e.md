# Run E2E Tests

## Prerequisites
1. PostgreSQL must be running: `npm run infra:up`
2. Playwright browsers installed: `npm run qa:e2e:install`

## Run All E2E Tests
```
npm run qa:e2e
```
Builds storefront, ensures PostgreSQL, then runs all Playwright specs.

## Run Specific Test File
```
node node_modules/playwright/cli.js test tests/e2e/{spec-name}.spec.js
```

## Run in Headed Mode (visual debugging)
```
npm run qa:e2e:headed
```

## Run with Interactive UI
```
npm run qa:e2e:ui
```

## Available Test Specs

| Spec | Coverage |
|------|----------|
| `mvp-smoke.spec.js` | Homepage → category → product → cart → checkout → order |
| `catalog-display.spec.js` | Product catalog and display sections |
| `auth-session.spec.js` | Login, signup, session management |
| `auth-social.spec.js` | Google/Kakao social login |
| `account-header.spec.js` | Account header button states |
| `admin-dashboard.spec.js` | Admin login and dashboard operations |
| `mobile-storefront.spec.js` | Mobile responsive layouts |
| `payment-adapter.spec.js` | Payment flow with mock gateway |
| `z-admin-display-category.spec.js` | Admin display/category management |
| `z-admin-member-statistics.spec.js` | Admin member/statistics views |
| `z-review-wishlist.spec.js` | Reviews and wishlist features |

## Writing New E2E Tests
- Plain JavaScript (`.spec.js`), not TypeScript
- Prefer Playwright locators: `getByRole`, `getByText`, `getByLabel`
- Tests expect demo seed data (API seeds on startup)
- Use Korean text in locators: `page.getByRole("button", { name: /장바구니 담기/ })`
- Prefix with `z-` if the test must run after others (alphabetical ordering)
