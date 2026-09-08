# Commerce-5 — Order Boundary

## Purpose
Create the first durable B2B order record from an accepted quotation without implementing payment, escrow, fulfillment, or production promotion.

## Lifecycle
`pending_confirmation` → `confirmed` → `proforma_pending` → `payment_pending` → `sourcing` → `shipping` → `delivered` → `completed`

Terminal states: `cancelled`, `rejected`.

## Security
- Order creation is private/auth-gated; there is no public writable order endpoint.
- The server generates `order_number`, status, timestamps, and canonical quote-derived commercial identity.
- Only accepted, non-withdrawn quotes may create an order.
- Quote, supplier, and product relationships are resolved from D1; client-supplied names/prices are not authoritative.
- No payment credentials, secrets, internal notes, or privileged bindings are exposed through the public representation.

## Commercial integrity
- Currency and unit price are copied from the accepted quote.
- Quantity remains the RFQ/quote string until a later order-line normalization stage establishes a safe numeric quantity model.
- `quoted_amount_minor` is the immutable commercial amount supplied by the accepted quote; it is not recomputed from free-form quantity.
- Payment, escrow, customs execution, shipping labels, QC, and settlement are explicitly out of scope.

## Release gate
CI contract/security and mock-D1 tests are required. Cloudflare Preview remains a separate runtime gate. `main` and Production remain untouched until final approval.
