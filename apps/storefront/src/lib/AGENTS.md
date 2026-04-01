<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# lib

## Purpose
Shared utilities, API clients, state stores, fonts, and type re-exports. This is the foundational layer that all pages and components depend on.

## Key Files

### API Clients
| File | Description |
|------|-------------|
| `server-api.ts` | Server-side API client (used in Server Components) |
| `client-api.ts` | Client-side API client (used in Client Components) |
| `admin-server-api.ts` | Admin server-side API client |
| `admin-client-api.ts` | Admin client-side API client |
| `api-base-url.ts` | Resolves API base URL from environment |
| `admin-api-base-url.ts` | Resolves admin API base URL |

### State & Auth
| File | Description |
|------|-------------|
| `auth-store.tsx` | React context for authentication state |
| `admin-auth-store.tsx` | React context for admin authentication |
| `cart-store.tsx` | React context for shopping cart state |
| `auth-paths.ts` | Auth-related route path constants |
| `social-auth.ts` | Social login (Google, Kakao) helpers |

### Types & Contracts
| File | Description |
|------|-------------|
| `contracts.ts` | Re-exports from `packages/contracts` |
| `admin-contracts.ts` | Re-exports admin types from `packages/contracts` |

### UI Utilities
| File | Description |
|------|-------------|
| `currency.ts` | Korean Won (₩) formatting |
| `fonts.ts` | Font configuration (Noto Sans KR, Inter, GmarketSans) |
| `gradient.ts` | CSS gradient utilities |
| `order-status.ts` | Order status labels and styling |
| `payment.ts` | Payment method labels |
| `catalog-normalize.ts` | Catalog data normalization |
| `admin-nav.ts` | Admin sidebar navigation config |
| `admin-require-session.ts` | Admin auth guard utility |

### Fonts
| File | Description |
|------|-------------|
| `GmarketSansTTF*.ttf` | GmarketSans font files (Light, Medium, Bold) |

## For AI Agents

### Working In This Directory
- Two parallel API client pairs: `server-api` + `client-api` (customer) and `admin-server-api` + `admin-client-api` (admin)
- Server API clients are used in Server Components (access cookies directly)
- Client API clients are used in Client Components (browser fetch with credentials)
- State stores use React Context — wrap components with providers in layouts
- Never import `server-api.ts` from a `"use client"` component (and vice versa)

### Common Patterns
- API clients return typed responses using `contracts.ts` types
- `fetchJson<T>()` helper handles error extraction and JSON parsing
- Auth stores provide `useAuth()` / `useAdminAuth()` hooks
- Cart store provides `useCart()` hook with optimistic updates

<!-- MANUAL: -->
