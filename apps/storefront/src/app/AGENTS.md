<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# app

## Purpose
Next.js App Router directory. Contains all routes, layouts, and API route handlers. Split into `(store)` route group for customer pages and `admin` for the admin dashboard.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout: HTML lang="ko", Noto Sans KR + Inter fonts, metadata for "MARU" brand |
| `globals.css` | Global Tailwind CSS imports and custom styles |
| `icon.svg` | Favicon SVG |
| `error.tsx` | Root error boundary |
| `loading.tsx` | Root loading state |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(store)/` | Customer-facing route group with shared layout, header, footer |
| `admin/` | Admin dashboard with separate layout, auth, and styling |
| `api/` | API route handlers — proxy and auth endpoints |

### (store) Routes

| Route | Page |
|-------|------|
| `/` | Homepage with hero, display sections, recommendations |
| `/category/[slug]` | Category product listing with sorting |
| `/products/[slug]` | Product detail with reviews, recommendations |
| `/search` | Product search results |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form and payment |
| `/login` | Login page |
| `/signup` | Signup page |
| `/auth` | Social auth callback handler |
| `/account` | User account dashboard |
| `/orders` | Order history |
| `/orders/[orderNumber]` | Order detail |
| `/lookup-order` | Guest order lookup |
| `/faq`, `/terms`, `/privacy` | Static content pages |

### Admin Routes

| Route | Page |
|-------|------|
| `/admin` | Admin dashboard home |
| `/admin/login` | Admin login |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/members` | Member management |
| `/admin/reviews` | Review moderation |
| `/admin/display` | Homepage display section editor |
| `/admin/analytics` | Statistics dashboard |
| `/admin/operations` | Operational tools |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/v1/[...path]` | Transparent proxy to Spring Boot API (all methods) |
| `/api/auth/login` | Login handler (sets session cookie) |
| `/api/auth/logout` | Logout handler (clears session cookie) |
| `/api/auth/session` | Session check endpoint |
| `/api/auth/signup` | Signup handler |
| `/api/auth/social/login/[provider]` | Social login initiation |
| `/api/auth/social/callback/[provider]` | Social login callback |

## For AI Agents

### Working In This Directory
- `(store)` is a route group — it provides a shared layout but does not appear in the URL
- Admin routes have their own `layout.tsx` with separate auth and CSS (`admin.css`)
- API proxy (`/api/v1/[...path]`) forwards all HTTP methods transparently to the backend
- Auth routes handle cookie-based session management on the Next.js side
- Each page file is a Server Component unless it needs client interactivity

### Common Patterns
- Pages fetch data via `server-api.ts` functions in Server Components
- Client-interactive parts are extracted into `components/` with `"use client"`
- Dynamic routes use `[slug]` or `[orderNumber]` param patterns
- `not-found.tsx` in `(store)` handles 404 for customer pages

<!-- MANUAL: -->
