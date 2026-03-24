Status: current
Owner: repo maintainers
Last reviewed: 2026-03-24

# Documentation Status Map

This file defines which documents are current sources of truth and which are historical references.

## Current

- `docs/design-system.md`
- `docs/screen-inventory-and-ux-audit-2026-03-24.md`
- `docs/api-contract-v1.md`
- `docs/erd-v1.md`
- `docs/deploy-shop-minseok91-cloud.md`

## Reference

- `README.md`
- `AGENTS.md`

## Historical

- `docs/saleson-phase1-user-migration-plan.md`
- `docs/saleson-rebaseline-roadmap-2026-03-14.md`
- `docs/approval-plan-phase2-operations-and-engagement-2026-03-17.md`

Historical documents remain useful context, but they are not the default source of truth for current implementation decisions.

## Update rule

- Add `Status: current`, `Status: draft`, or `Status: historical` at the top of new docs.
- When a document stops reflecting the live codebase, downgrade it to `historical` instead of silently leaving it in place.
- Prefer creating a new current document over rewriting historical planning artifacts in place.
