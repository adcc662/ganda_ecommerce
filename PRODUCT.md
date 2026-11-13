# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with React islands for interactive logic (user's stated preference). Dev server on port 3000, the backend's default CORS origin (`app.cors.allowed-origins`). Lives in its own repository folder at `/home/david/Projects/ecommerce-frontend`, separate from the Spring Boot API at `/home/david/Projects/ecommerce`. Deploy target: undecided.

## Users

- **Buyers:** anyone browsing, searching, and buying products from many independent sellers. Mostly anonymous until checkout; they register to keep a cart, addresses, and order history.
- **Sellers:** any registered person who wants to list and sell a product, whatever it is. They need to create listings, manage stock and price, and follow their orders.
- **Admins:** platform operators who manage categories and moderate products, orders, and payment statuses.

## Product Purpose

An open marketplace where any person can sell any product. Success means a stranger can find something, trust the listing, and check out without friction, and anyone can go from "I have something to sell" to a live listing quickly.

## Positioning

Open to every seller and every product category, rather than a single-brand store. Differentiating claims beyond that are undecided; do not invent them.

## Operating Context

- Consumes the REST API at `http://localhost:8080/api` (dev). JWT bearer auth, 24h tokens; `POST /api/auth/logout-all` invalidates all tokens.
- Public endpoints: product by id/slug, active products, search, categories and subcategories.
- Authenticated endpoints: cart (`/api/cart`), orders (`/api/orders/my-orders`), addresses, payments for own orders, payment methods.
- Failed logins return `429` with `Retry-After` after 5 attempts per email+IP in 15 minutes; the UI must surface this.

## Capabilities and Constraints

- **Backend gap (confirmed):** products have no seller/owner, roles are only `USER` and `ADMIN`, and only `ADMIN` can create, update, or delete products. The user chose to build the full marketplace UI now; seller flows (list a product, my listings, seller storefront) run on a clearly isolated mock/adapter layer until the API adds seller ownership. Mock-backed surfaces must be clearly marked in code and swappable without UI changes.
- Favorites exist in the database schema but have no API endpoints yet.
- Product deletion is soft; deleted products stay in order history.
- Currency: USD (backend default).
- Language: English only for now.

## Brand Commitments

- Color scheme: **"woodland"**, explicitly requested by the user and binding.
- Product name: **Ganda ecommerce** (user's words). Short form "Ganda" for the wordmark.
- Logo and voice: undecided.

## Evidence on Hand

No real product photography, seller profiles, reviews, testimonials, or sales figures exist. Do not fabricate reviews, ratings, seller counts, or trust badges presented as real; any sample catalog data must be clearly placeholder.

## Product Principles

1. Trust between strangers comes first: clear prices, seller identity, stock, and order status everywhere.
2. Selling is as easy as buying; listing a product must never feel like an admin task.
3. The API is the source of truth; the frontend never pretends a mocked capability is live.
4. Any product fits: layouts and categories work for a used bike as well as handmade soap.

## Accessibility & Inclusion

WCAG 2.2 AA as the working baseline (no product-specific requirement stated yet).
