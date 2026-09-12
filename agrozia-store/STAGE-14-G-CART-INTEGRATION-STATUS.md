# Stage 14-G — Cart Live Integration Status

## Scope
Connect the existing `/cart` page to the existing Store Cart API without changing the Cart backend contract or Production runtime.

## Implementation
- Replaced structural/sample cart content with live browser-side loading from `GET /api/cart`.
- Preserved same-origin customer session via `credentials: 'same-origin'`.
- Added live quantity update through `POST /api/cart/items`.
- Added live item removal through `DELETE /api/cart/items`.
- Added live clear-cart through `DELETE /api/cart`.
- Added loading, empty, authentication-required, and service-error states.
- Removed structural sample products from the Cart page.
- Checkout navigation remains `/checkout`; no checkout backend changes were made.
- Existing Cart API/repository remains the business-rule authority.

## Preserved Cart invariants
- Customer authentication remains enforced by the existing Cart API.
- Only published products enter the cart.
- Only direct-sale products with fixed final pricing enter the cart.
- Currency consistency remains enforced by the repository.
- Existing cart persistence remains in `commerce_carts` and `commerce_cart_items`.

## Code status
PASS — UI integration implemented on `feat/store-admin-stage12`.

## Tests
PASS — new `cart-live-integration.test.js` added.
PASS — CI workflow updated to include Cart contract and live-integration tests.
PENDING — GitHub Actions run was queried for commit `6cec7c147fe6b74252fd96270fbbbff729da5594` and no workflow run is currently exposed by the connector.

## Runtime validation
PENDING — Cloudflare Store D1 binding is not yet validated.
PENDING — Browser/E2E against a deployed Store Worker.
PENDING — Real authenticated customer cart persistence.
PENDING — Real add/update/remove/clear Cart flow against `agrozia-store-db`.

## Safety
- `main` unchanged.
- Production unchanged.
- No B2B runtime, D1, R2, Telegram, or main-site production code changed.
- Cloudflare binding investigation remains a separate infrastructure track.
