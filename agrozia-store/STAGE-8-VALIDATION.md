# Stage 8 — Cart

## Scope
Independent customer-owned direct-sale cart for `agrozia.ir`.

## Implemented
- `commerce_carts` with one active cart identity per Store customer.
- `commerce_cart_items` with one row per product per cart.
- Authenticated cart read/add/remove/clear APIs.
- Only published Store products may enter the cart.
- Customer identity is derived from `agz_customer_session`; `customer_id` is never accepted from the client.
- Quantity is normalized and bounded; malformed/non-positive quantities are rejected.
- Public cart projection excludes customer identity and supplier internals.
- Cart data uses `STORE_DB` only.

## Routes
- `GET /api/cart`
- `POST /api/cart/items`
- `DELETE /api/cart/items`
- `DELETE /api/cart`

## Deliberate boundaries
- No checkout yet.
- No payment processing.
- No order creation.
- No B2B RFQ conversion into cart/order.
- No supplier/admin cart mutation.
- No legacy `AGROZIA_DB`, `agrozia-db11`, legacy R2, or `agz_admin_session`.

## Runtime gate
Cloudflare D1/R2/Worker provisioning and runtime tests remain pending. The migration must be applied only to the new `agrozia-store-db` after its real Cloudflare database ID is provisioned; no placeholder ID is to be replaced with a guessed value.
