Status: current
Owner: frontend
Last reviewed: 2026-09-06

# MARU Design System

The durable brand and experience context lives in .impeccable.md. This document records the implementation rules used by the current storefront and admin UI. DESIGN.md records the cinematic home composition, motion exception, and validation limits.

## Product Direction

- Storefront: a material-led luxury retail experience for considered living, with cinematic discovery on the home page and calm, precise shopping flows.
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

- Home follows brand world, brand perspective, ways to live, curated edit, material story, new arrivals, and service. Existing recently viewed and recommendation shelves appear after the curated edit when browsing history exists.
- Home uses large Korean titles, a MARU wordmark over photography, and scroll-linked image scenes. Native anchors offer direct access to the available collections and curated products.
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
- Shared controls and task-focused pages use short 140-240ms state transitions and subtle image scale. The cinematic home exception below applies only to its scoped components.
- Hover cannot be the only way to access information or actions.
- prefers-reduced-motion disables entrance and lift behavior.
- Contrast targets WCAG AA for body text and controls.

## Cinematic Home Exception

- Keep the existing color and type tokens. Scope the new layout and motion to `cinema-` classes and the home components documented in DESIGN.md.
- At widths of at least 1024px and heights of at least 700px, with no reduced-motion preference, the hero uses scroll-linked scale and pointer perspective, each collection image moves inside its own frame, and the material image moves with scroll. Motion does not change the page's column structure.
- Home timings are 800ms for title entrance, 700ms with 60ms stagger for curated products, and 350ms for link arrows. Text, price, and links remain visible without waiting for animation.
- Smaller or shorter viewports and reduced-motion mode use static images in document order. Reduced-motion mode also removes CSS transitions. Native scrolling and anchors remain available.
- Static SSR previews have been checked across phone, tablet, and desktop widths. Product image, price, and purchase rows align, and the asymmetric collection cards share a CTA baseline on desktop. Refer to the branch's GitHub Actions results for integrated E2E execution; static previews do not establish interactive correctness. Manual motion quality and frame performance remain unverified, and some product photos still mismatch their names. This is not production or final PM approval.

## Content Rules

- Customer language describes rooms, materials, comfort, care, and service.
- Avoid urgency tactics except truthful stock information.
- Avoid internal product-development language in customer UI.
- Admin labels are direct, task-oriented, and state-specific.

## Change Management

- Update .impeccable.md when brand context, users, emotional goals, or aesthetic direction changes.
- Update this file when tokens, typography, global layout, navigation, or shared component behavior changes.
- A new shared pattern must prove reuse across at least two routes before becoming a global utility.
