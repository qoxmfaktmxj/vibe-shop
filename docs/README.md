Status: current
Owner: repo
Last reviewed: 2026-03-24

# Documentation Index

This directory mixes current operating documents with older planning notes. Use the status markers in this index before treating any file as a source of truth. The active frontend runtime is now a single `apps/storefront` app that also serves admin routes under `/admin`.

## Current

- `api-contract-v1.md`
  - Frontend/backend contract baseline for the current API
- `erd-v1.md`
  - Current schema baseline that maps to Flyway migrations
- `design-system.md`
  - Current design tokens, component rules, and UX conventions
- `screen-inventory-and-ux-audit-2026-03-24.md`
  - Current UX audit and information architecture guidance
- `deploy-shop-minseok91-cloud.md`
  - Current deployment guide for the compose-based runtime stack
- `test-product-image-sources.md`
  - Current content attribution for demo product images

## Historical

- `approval-plan-phase2-operations-and-engagement-2026-03-17.md`
- `saleson-phase1-user-migration-plan.md`
- `saleson-rebaseline-roadmap-2026-03-14.md`

Historical docs are useful for context and rationale, but they do not override the current contract, design, or deployment docs.

## Update Rules

- Mark every new long-lived doc with `Status`, `Owner`, and `Last reviewed`.
- If a planning document is superseded, mark it `historical` instead of silently leaving it ambiguous.
- When API or UI behavior changes, update the current contract doc before editing historical notes.
