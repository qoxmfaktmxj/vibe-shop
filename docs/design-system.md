Status: current
Owner: frontend
Last reviewed: 2026-03-24

# Design System Baseline

This document promotes the current token and UX rules out of scattered CSS files and audit notes into a versioned baseline.

## Scope

This is the active design source of truth for:

- `apps/storefront/src/app/globals.css`
- `apps/storefront/src/app/admin/admin.css`
- `docs/screen-inventory-and-ux-audit-2026-03-24.md`

It does not replace a future component library, but it defines the rules the current apps should follow.

## Product Direction

- Storefront is a search-first commerce experience, not a pure editorial landing page.
- Admin is an operations tool served under `/admin` and should keep a distinct tone without becoming a separate app.
- Search, category browsing, recommendation, cart, checkout, account, and admin workflows must feel like one product family without sharing identical layouts.

## Brand Rules

- Product name: `Maru`
- Customer app title: `Maru`
- Admin app title: `Maru Admin`
- Avoid introducing alternate product names in metadata, nav, or headers.

## Storefront Tokens

Source: `apps/storefront/src/app/globals.css`

- Backgrounds
  - `--background`, `--surface`, `--surface-low`, `--surface-high`, `--surface-card`
- Text
  - `--ink`, `--ink-soft`, `--ink-muted`
- Brand accents
  - `--primary`, `--primary-dim`, `--secondary`, `--secondary-soft`
- Border and elevation
  - `--line`, `--line-strong`, `--shadow`, `--shadow-soft`
- Editorial accents
  - `--accent-caramel`, `--accent-sienna`, `--accent-taupe`

## Admin Surface Rules

Source: `apps/storefront/src/app/admin/admin.css`

- Admin routes inherit the storefront token set and fonts from the shared app root.
- Admin-only styling should stay in prefixed `admin-*` classes.
- Do not redefine a second global token system for admin after the merge.

## Typography

- Storefront display type uses `--font-display` for editorial headings and eyebrow labels.
- Storefront body copy uses `--font-body`.
- Admin display type uses `--font-space` for high-signal labels and headings.
- Avoid default browser typography for hero, CTA, and admin section headings.

## Core Component Rules

### Buttons

- Storefront
  - `button-primary` is the primary conversion action
  - `button-secondary` is the neutral fallback action
  - `button-hot` is reserved for heightened commerce emphasis
- Admin
  - `admin-button` is the primary mutation action
  - `admin-button-secondary` is the low-risk secondary action
  - `admin-button-ghost` is for actions placed on dark admin surfaces

### Inputs

- Storefront inputs use `soft-input` and should preserve low-chrome editorial styling.
- Admin inputs use `admin-input` and should prioritize clarity, density, and fast scanning.

### Cards and Surfaces

- Storefront cards should preserve whitespace and editorial pacing.
- Admin cards should preserve scannability, quick comparison, and action density.
- Do not use the same card hierarchy interchangeably between storefront and admin.

## UX Rules

### Storefront

- Home must let users start search directly.
- Search entry points should not be duplicated across the same navigation level.
- Category browsing and search browsing must have different jobs:
  - home starts discovery
  - search refines results
  - category pages anchor collection browsing
- Account, checkout, and order pages should favor clarity and trust over editorial flourish.

### Admin

- The admin root route is a dashboard summary, not the full workspace.
- Heavy data editors belong to dedicated routes.
- Navigation should expose the major workspaces directly:
  - dashboard
  - display
  - products
  - orders
  - members
  - reviews
  - analytics
  - operations

## Content and Labeling

- Prefer explicit labels over ambiguous product-language shortcuts.
- Avoid labels like `Journal`, `Lookup`, or other internal shorthand unless the user-facing meaning is obvious.
- Use action-oriented labels in admin for state changes and editing flows.

## States

- Every app-level route should have a loading state.
- Every app-level route should have an error recovery state.
- Empty states must explain what the user can do next instead of showing a blank panel.

## Change Management

- Update this file whenever token names, global layout behavior, or navigation rules change.
- If a new UI pattern becomes shared across more than one route, document it here before it drifts into ad hoc duplication.
