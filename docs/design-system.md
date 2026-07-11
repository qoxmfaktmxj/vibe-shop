Status: current
Owner: frontend
Last reviewed: 2026-07-11

# MARU Design System

The durable brand and experience context lives in .impeccable.md. This document records the implementation rules used by the current storefront and admin UI.

## Product Direction

- Storefront: a quiet, material-led luxury retail experience for considered living.
- Admin: a neutral, precise operations workspace under /admin.
- Brand qualities: tailored, hushed, tactile.
- Experience principle: scene before SKU, then progressively increase information density as the customer moves from discovery to purchase.

## Storefront Foundations

Source: apps/storefront/src/app/globals.css

- Colors use OKLCH semantic tokens.
- Canvas is warm ivory, text is softened ink, and decisive actions use deep oxblood.
- Pure black, pure white, text gradients, glass effects, and decorative gold are not part of the system.
- Storefront display type is Gowun Batang through --font-display.
- Storefront interface and body type is Noto Sans KR through --font-body.
- Radius is restrained: 3px controls, 5px panels, 8–12px only for large media.
- Borders and whitespace establish hierarchy before shadows.

## Storefront Composition

- Home follows brand world → ways to live → curated edit → material story → new arrivals → service.
- Search and category pages are cardless collection grids with underlined sorting controls.
- Product detail uses an image-led split layout with a sticky purchase panel.
- Cart, checkout, account, and order screens prioritize price, fulfillment, support, and state clarity.
- Product cards show category, name, concise context, price, wishlist, stock state, and add-to-cart without decorative containers.

## Admin Foundations

Source: apps/storefront/src/app/admin/admin.css

- Admin has its own neutral OKLCH token set and uses Noto Sans KR only.
- Desktop layout uses a persistent 240px workspace navigation and compact page header.
- Mobile layout converts navigation to a horizontally scrollable workspace list.
- KPI panels, queues, forms, and tables use 3–4px corners, thin borders, and minimal elevation.
- Dashboard order data is tabular; campaign-style hero sections are prohibited.
- Mutation actions use admin-button; secondary navigation and low-risk actions use admin-button-secondary.

## Shared Interaction Rules

- Controls have at least a 44px touch target.
- Visible keyboard focus uses semantic focus tokens.
- Motion is limited to short 140–240ms state transitions and subtle image scale.
- Hover cannot be the only way to access information or actions.
- prefers-reduced-motion disables entrance and lift behavior.
- Contrast targets WCAG AA for body text and controls.

## Content Rules

- Customer language describes rooms, materials, comfort, care, and service.
- Avoid urgency tactics except truthful stock information.
- Avoid internal product-development language in customer UI.
- Admin labels are direct, task-oriented, and state-specific.

## Change Management

- Update .impeccable.md when brand context, users, emotional goals, or aesthetic direction changes.
- Update this file when tokens, typography, global layout, navigation, or shared component behavior changes.
- A new shared pattern must prove reuse across at least two routes before becoming a global utility.
