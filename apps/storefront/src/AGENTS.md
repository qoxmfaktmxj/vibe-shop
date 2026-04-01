<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# src

## Purpose
Next.js application source code. Contains App Router pages, React components, and library utilities (API clients, stores, fonts).

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router: pages, layouts, API routes (see `app/AGENTS.md`) |
| `components/` | React components organized by feature (see `components/AGENTS.md`) |
| `lib/` | API clients, auth/cart stores, utilities, fonts (see `lib/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `@/` path alias maps to `src/` — use `@/components/...`, `@/lib/...`
- Server Components are the default — only add `"use client"` when state/effects/events are needed
- All user-facing text is in Korean

<!-- MANUAL: -->
