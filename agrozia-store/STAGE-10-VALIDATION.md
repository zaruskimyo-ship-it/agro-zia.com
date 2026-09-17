# Stage 10 — Direct Sale Order Validation

## Scope
Stage 10 adds the independent direct-sale order boundary for `agrozia.ir`.

Flow:

`Product → Cart → Checkout → Direct Order`

B2B RFQ/quote/order flows remain separate and are not reused here.

## Implemented
- `0008_direct_orders.sql` creates Store-only `commerce_orders` and `commerce_order_items`.
- Order creation accepts only an authenticated active Store customer.
- The checkout must belong to that customer, be `open`, and not be expired.
- Checkout items are copied into an immutable order snapshot.
- Customer/shipping data is snapshotted from checkout; public responses do not expose customer email or supplier data.
- Order total is taken from the server-created checkout subtotal; the client cannot supply a price or total.
- `checkout_id` is unique, preventing duplicate orders from the same checkout.
- Order + order items + checkout completion + cart conversion are written in one D1 batch.
- Concurrent order creation reconciles through the unique checkout constraint.
- Successful conversion moves the checkout to `completed` and the source cart to `converted`.
- Order status starts at `pending_confirmation` and uses the approved Store order lifecycle.
- Customer order reads are strictly scoped by `customer_id`.
- No payment gateway, payment capture, shipping integration, supplier fulfillment, or production activation is included in Stage 10.

## Isolation invariants
- Store runtime uses `env.STORE_DB` only.
- No `AGROZIA_DB` / `agrozia-db11` access.
- No legacy `AGROZIA_ATTACHMENTS` access.
- No legacy `agz_admin_session` dependency.
- No production data migration or cloning.
- No change to `main`.
- No Cloudflare Production deployment.

## API
- `POST /api/orders/from-checkout/:checkoutId`
- `GET /api/orders/:orderId`

## Security checks
- Authentication required.
- Customer ownership enforced at database query level.
- Expired/non-open checkout rejected.
- Duplicate conversion prevented by database uniqueness.
- Server-side snapshot and totals; no client price authority.
- Public order projection excludes private customer and supplier fields.
- Unknown service failures are not exposed to clients.

## Runtime gate
Cloudflare Worker/D1 runtime validation is still pending because Store infrastructure has not been provisioned/activated in this workflow.

Do not mark Stage 10 runtime PASS until the new Store Worker and new Store D1 have been independently deployed/tested.

## Tests
Contract tests are present in `tests/order-contract.test.js`.
They have not been executed by a runtime test runner in this workflow, so this document does not claim execution PASS.
