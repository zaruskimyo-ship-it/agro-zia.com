# Stage 9 — Checkout

## Scope
Independent checkout session for the Direct Sale path of `agrozia.ir`.

## Implemented
- Authenticated Store customer required.
- Checkout reads the customer's cart from `STORE_DB` only.
- Every cart line is re-fetched from the current Store product catalog before checkout creation.
- Only published, fixed-price products with a final price and currency are eligible.
- Currency consistency is revalidated server-side.
- Client-supplied prices, subtotal, customer ID, supplier ID, and order totals are ignored.
- Quantity is revalidated server-side and MOQ is enforced when the Store product contains a simple numeric MOQ.
- Checkout stores a server-computed subtotal and immutable product-line snapshots.
- Monetary multiplication uses integer micro-units in JavaScript to avoid ordinary floating-point addition errors; product values with more than six decimal places are rejected rather than silently rounded.
- Shipping contact/address is required and snapshotted into the checkout.
- Idempotency key is customer-scoped and prevents duplicate checkout creation on replay.
- Checkout sessions expire after 30 minutes by policy; no payment provider is connected.
- Checkout does not create an order.

## Routes
- `POST /api/checkout`
- `GET /api/checkout/:id`

## Deliberate boundaries
- No payment processing.
- No payment provider secrets.
- No order creation; Direct Sale Order is Stage 10.
- No RFQ-to-cart/order conversion.
- No supplier/admin mutation.
- No legacy `AGROZIA_DB`, `agrozia-db11`, legacy R2, or `agz_admin_session`.

## Runtime gate
Cloudflare D1/Worker provisioning and runtime tests remain pending. Migration `0007_checkout.sql` must be applied only to the newly provisioned `agrozia-store-db` after its real Cloudflare database ID is available. No placeholder ID is to be replaced with a guessed value.

## Review note
Availability-state enforcement currently blocks only explicitly non-purchasable values (`out_of_stock`, `discontinued`, `unavailable`). No broader availability enum was invented because the existing Store catalog contract does not yet define one.
