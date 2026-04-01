<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# components

## Purpose
Reusable React components organized by feature area. Most are client components (`"use client"`) since they handle user interaction, state, or browser APIs.

## Key Files (Root-level Admin Components)

| File | Description |
|------|-------------|
| `admin-shell.tsx` | Admin layout shell with sidebar navigation |
| `admin-login-form.tsx` | Admin authentication form |
| `admin-product-manager.tsx` | Product CRUD management interface |
| `admin-order-manager.tsx` | Order listing and status management |
| `admin-member-manager.tsx` | Member listing and management |
| `admin-review-manager.tsx` | Review moderation interface |
| `admin-display-manager.tsx` | Homepage display section editor |
| `admin-hero-editor.tsx` | Hero banner configuration |
| `admin-category-manager.tsx` | Category management |
| `admin-statistics-panel.tsx` | Analytics dashboard panel |
| `admin-operations-panel.tsx` | Operational tools panel |
| `admin-catalog-workspace.tsx` | Catalog workspace combining products + categories |
| `admin-pagination.tsx` | Reusable admin pagination component |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `account/` | Account dashboard (`account-dashboard.tsx`) |
| `auth/` | Login form, signup form, social login buttons, auth shell |
| `cart/` | Add-to-cart button, cart screen |
| `catalog/` | Product card, sort tabs |
| `checkout/` | Checkout form with address and payment |
| `content/` | Static content page renderer |
| `engagement/` | Reviews section, rating stars, review composer, wishlist toggle |
| `order/` | Order history, guest lookup, cancel button |
| `recommendation/` | Product view tracker, recently viewed shelf, recommendation shelf |
| `search/` | Search form component |
| `shell/` | Site header, footer, account button, cart button, auth actions |
| `ui/` | Generic UI primitives (pagination) |

## For AI Agents

### Working In This Directory
- Admin components are at root level (flat); customer components are in feature subdirs
- All customer-facing components use Korean text
- Components receive data via props — API calls happen in pages or parent components
- Tailwind 4 classes for all styling — no CSS modules or styled-components

### Common Patterns
- `"use client"` at the top of files that need interactivity
- Props interfaces defined inline or at top of file
- State managed via React hooks + context stores (`auth-store.tsx`, `cart-store.tsx`)
- Admin components use `admin-client-api.ts` for API calls
- Customer components use `client-api.ts` for API calls

## Dependencies

### Internal
- `@/lib/client-api` and `@/lib/admin-client-api` — API call functions
- `@/lib/auth-store` and `@/lib/cart-store` — global state
- `@/lib/contracts` — TypeScript types
- `@/lib/currency` — Korean Won formatting

<!-- MANUAL: -->
