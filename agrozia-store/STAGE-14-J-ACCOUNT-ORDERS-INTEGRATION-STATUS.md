# Stage 14-J — Account Orders Integration Status

Date: 2026-09-12
Branch: `feat/store-admin-stage12`

## Scope

Connect the customer Account → Orders surface to the existing authenticated Direct Sale Orders API without changing the B2B order workflow.

## Evidence reviewed before change

- `src/commerce/order-repository.js`
- `src/commerce/order-api.js`
- `src/commerce/order-contract.js`
- `src/site/account-site-shell.js`
- `src/site/orders-live-response.js`
- `checkout-site-shell.js`
- `_worker.js`

The existing Direct Sale order backend already enforces customer authentication, customer ownership of checkout/order records, orderable checkout state, idempotent recovery, and private order projection.

## Implemented

- `/account/orders` now routes to the live authenticated Orders response.
- Existing `/orders` live response is reused; no second order repository/API was created.
- Direct Sale and B2B order paths remain explicitly separated.
- Account structural placeholder was removed from the active route.
- Added `tests/account-orders-live-integration.test.js`.
- Added the new test to Store Commerce Contract Tests workflow.

## Isolation

- No main B2B Worker changes.
- No Production deployment.
- No main branch merge.
- No Store D1 schema changes.
- No B2B order API changes.
- Customer order data remains authenticated and no-store.

## Validation status

- Code inspection: PASS
- Backend reuse/isolation: PASS
- Route integration: PASS by source inspection
- Automated CI: PENDING until a GitHub Actions run is observed
- Cloudflare Store D1 runtime: PENDING
- Browser/E2E: PENDING
- Real checkout → order → account/orders: PENDING

## Next gate

Stage 14-K should address the authenticated customer commercial timeline and final order-state presentation only after this integration is validated. Payment/provider integration must remain a separate boundary and must not be introduced by inference into the existing order creation path.
