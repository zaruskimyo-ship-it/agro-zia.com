# Stage 8 — Cart

## Scope
Independent customer-owned cart for the Direct Sale path of `agrozia.ir`.

## Implemented
- `commerce_carts` with one cart identity per Store customer.
- `commerce_cart_items` with one row per product per cart.
- Authenticated cart read/add/remove/clear APIs.
- Only published Store products may enter the cart.
- Cart admission is restricted to `price_visibility = 'fixed'` with a final price (`price_min = price_max`) and a required currency.
- A cart cannot mix different currencies.
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

## Validation scenarios
- Unauthenticated access must return `401 authentication_required`.
- Published RFQ-only/hidden/starting-from products must be rejected from Direct Sale Cart.
- Products without a final price or currency must be rejected.
- A second product with a different currency must be rejected.
- Clear Cart removes items and resets the cart currency.
- Removing an item cannot affect another customer's cart because every query is scoped through the authenticated customer's cart.

## Runtime gate
Cloudflare D1/R2/Worker provisioning and runtime tests remain pending. The migration must be applied only to the new `agrozia-store-db` after its real Cloudflare database ID is provisioned; no placeholder ID is to be replaced with a guessed value.
