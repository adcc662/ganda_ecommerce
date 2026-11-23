# Ganda ecommerce: storefront

The web frontend for the Ganda marketplace, built with Astro (server rendering) and React islands. It talks to the Spring Boot API in `../ecommerce`.

## Run it

```bash
# 1. Start the API (it brings up PostgreSQL and Redis through Docker Compose)
cd ../ecommerce
ADMIN_EMAIL=admin@ganda.local ADMIN_PASSWORD='choose-12+-chars' ./gradlew bootRun

# 2. Fill an empty dev database with sample categories and products (optional)
cd ../ecommerce-frontend
ADMIN_EMAIL=admin@ganda.local ADMIN_PASSWORD='choose-12+-chars' node scripts/seed-dev.mjs

# 3. Start the storefront on http://localhost:3000
npm install
npm run dev
```

The dev server runs on port 3000. Point the storefront at another API with `PUBLIC_API_URL` (see `.env.example`). The browser never calls the API directly: pages and Astro Actions call it from the server, so the API's CORS setting no longer affects the storefront.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 (`npx astro dev stop` stops it) |
| `npm run build` / `npm run preview` | Production build and the standalone Node server |
| `npm test` | Unit tests (Vitest) |
| `npm run check` | Type and template checks |

## Pages

| Route | What it is |
|---|---|
| `/`, `/section/[slug]`, `/search?q=` | The catalog, server-rendered from the public API |
| `/p/[slug]` | A product entry with add to cart |
| `/login`, `/register`, `/account` | Auth; account offers "Log out on every device" (`POST /api/auth/logout-all`) |
| `/forgot-password`, `/reset-password?token=` | Password reset: request an emailed link (`POST /api/auth/forgot-password`, always the same answer), then choose a new password (`POST /api/auth/reset-password`). Both are plain forms posting to Astro Actions and work without JavaScript. The reset page sends `Referrer-Policy: no-referrer` and `Cache-Control: no-store` so the token stays out of other sites and caches. A successful reset ends this browser's session, because the API revokes every token. Needs the API's `PASSWORD_RESET_URL` to point at this page (its dev default, `http://localhost:3000/reset-password`, already does). |
| `/cart`, `/checkout`, `/orders`, `/orders/[id]` | Cart, addresses and order placement, order history and payment |
| `/sell`, `/sell/listings` | Seller composer with live preview, and the seller's listings |

`/cart`, `/checkout`, `/account`, `/orders/*` and `/sell/*` need a logged-in user; `src/middleware.ts` redirects visitors to `/login?next=…` before the page renders.

## Authentication

Astro sits between the browser and the Spring API:

```
Browser ──session cookie (httpOnly)──▶ Astro server ──Bearer JWT──▶ Spring API
```

- Login and register are Astro Actions (`src/actions/index.ts`). They call the API and store the JWT and the user in an Astro Session. The browser only receives the session cookie: `httpOnly`, `SameSite=Lax`, and `Secure` in production. Nothing in the page's JavaScript can read the JWT.
- Sessions use the filesystem storage that `@astrojs/node` enables and last 24h, the same as the API's `jwt.expiration`. Running several server instances needs a shared session driver (for example Redis) in `astro.config.mjs`.
- `src/middleware.ts` runs before every page renders. For a logged-in visitor it reads the cart, which also checks the token. It puts the user and the cart count in `Astro.locals`. If the API has revoked the token (for example after logging out on every device), the session ends right there and the visitor continues logged out.
- Cart, address, order and payment changes are Actions that attach the JWT on the server (`withAccount` in `src/lib/session/server.ts`). When the API rejects the token (401), the session ends and the visitor is sent to log in.
- Astro rejects cross-site form posts to Actions. Browsers pass the check through `Sec-Fetch-Site`. When deploying behind a public domain, also list it in `security.allowedDomains` so the server knows its own origin.

## Seller listings are mocked for now

The API does not support seller-owned products yet: products have no seller and only `ADMIN` can create them. Seller screens go through the `ListingRepository` port (`src/lib/sellers/listings.ts`). The current adapter, `localListingRepository.ts`, stores listings in the browser, and the UI tells sellers that buyers cannot see them yet. When the API lets users create their own products, add an API adapter with the same interface, switch it in `src/lib/sellers/index.ts`, and set `IS_MOCK_SELLER_BACKEND` to `false`.

Products that already exist in the API are shown as sold by Ganda, because the platform's admin listed them.

## Structure

```
src/
  lib/domain/    API types, prices, labels, section helpers
  lib/api/       HTTP client (typed ApiError, Retry-After) and endpoint wrappers
  lib/session/   Server session helpers (withAccount, loadAuthed), protected routes, cart badge store
  lib/sellers/   Seller listings port and its mock adapter
  components/    catalog/ (Astro), layout/ (Astro), islands/ (React)
  actions/       Astro Actions: auth, cart, addresses, orders
  middleware.ts  Session user and route guard
  pages/         Routes
```
