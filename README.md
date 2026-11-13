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

The dev server runs on port 3000 because that is the API's default allowed CORS origin (`CORS_ALLOWED_ORIGINS`). Point the storefront at another API with `PUBLIC_API_URL` (see `.env.example`).

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
| `/cart`, `/checkout`, `/orders`, `/orders/[id]` | Cart, addresses and order placement, order history and payment |
| `/sell`, `/sell/listings` | Seller composer with live preview, and the seller's listings |

## Seller listings are mocked for now

The API does not support seller-owned products yet: products have no seller and only `ADMIN` can create them. Seller screens go through the `ListingRepository` port (`src/lib/sellers/listings.ts`). The current adapter, `localListingRepository.ts`, stores listings in the browser, and the UI tells sellers that buyers cannot see them yet. When the API lets users create their own products, add an API adapter with the same interface, switch it in `src/lib/sellers/index.ts`, and set `IS_MOCK_SELLER_BACKEND` to `false`.

Products that already exist in the API are shown as sold by Ganda, because the platform's admin listed them.

## Structure

```
src/
  lib/domain/    API types, prices, labels, section helpers
  lib/api/       HTTP client (typed ApiError, Retry-After) and endpoint wrappers
  lib/session/   JWT session in localStorage, cart count
  lib/sellers/   Seller listings port and its mock adapter
  components/    catalog/ (Astro), layout/ (Astro), islands/ (React)
  pages/         Routes
```
