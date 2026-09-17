# Stage 14-I — Direct Sale Order Integration Status

Date: 2026-09-11
Branch: `feat/store-admin-stage12`
Production/main: unchanged

## Objective
Connect the authenticated Direct Sale checkout to the existing Store order backend without changing the B2B accepted-quote order path.

## Root-cause / backend evidence
- `src/commerce/order-api.js` already exposes `POST /api/orders/from-checkout/:checkoutId` and `GET /api/orders/:orderId`, both authenticated through the customer session.
- `src/commerce/order-repository.js` already validates that the checkout belongs to the customer, is open and unexpired, contains items, and creates `commerce_orders` plus `commerce_order_items` atomically. It marks the checkout completed and the cart converted.
- Existing idempotency/race recovery returns an already-created order for the same customer + checkout instead of creating a second order.
- `src/commerce/order-contract.js` exposes only the safe public order projection.
- B2B remains on `/api/b2b-orders/*` and was not changed.

## Implemented
1. Checkout review now calls `POST /api/orders/from-checkout/:checkoutId` only after loading the live checkout.
2. Customer credentials are sent with `same-origin`.
3. Authentication failure routes to the account boundary.
4. Successful API response redirects to `/orders?order=<real-order-id>`.
5. A fake order reference is no longer displayed.
6. Added `src/site/orders-live-response.js` for authenticated live Direct Sale order display.
7. Worker routes `/orders` to the live response and preserves the existing `/api/orders/*` backend.
8. Added `tests/direct-order-live-integration.test.js`.
9. CI workflow now includes the new direct-order integration test.

## Commits
- `7a1f83e80b14f1d6960bd2f10784e906d60be005` — checkout review → Direct Sale Order
- `cc2d3b0550df0c6f56a5e79d9e6b00bf51d0a7c9` — live authenticated Orders response
- `29ed8a4e075832a2d85ff431091fd20f817f4896` — Worker route to live Orders response
- `4abfab1758ad3fae1b78ee53c46b76560dfef945` — direct-order integration tests
- `4efa2c4d56ee76b5468b9a54ececa9f9716b648d` — CI inclusion

## Validation status
- Backend reuse/inspection: PASS
- Direct Sale vs B2B isolation: PASS
- Authentication boundary: PASS by contract tests
- Code integration: PASS
- CI execution: PENDING until a real GitHub Actions run is observed
- Cloudflare D1 runtime: PENDING because `STORE_DB` binding/mapping remains unresolved
- Browser/E2E: PENDING
- Real cart → checkout → order flow: PENDING
- main: unchanged
- Production: unchanged

## Important boundary
This stage creates a Direct Sale Order only from a valid checkout. It does not implement payment capture, supplier confirmation, shipment execution, invoice generation, or B2B order conversion. Those remain later controlled stages.
