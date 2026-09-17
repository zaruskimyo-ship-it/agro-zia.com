# Stage 11 — B2B Order Validation

Branch: `feat/store-b2b-order`

## Scope

Implement the Store-side B2B order boundary:

`RFQ → Supplier Match → Accepted Quote → B2B Order`

This stage is independent from Direct Sale orders and uses only Store tables under `STORE_DB`.

## Implemented

- isolated supplier table and RFQ/supplier match table
- isolated quote table with accepted/converted lifecycle
- B2B order and order-item snapshots
- customer ownership enforced through the RFQ relationship
- accepted quote required
- quote validity checked before conversion
- supplier must remain published
- product must remain published when referenced
- RFQ product and quote product invariant enforced
- active supplier match required
- quote-to-order uniqueness prevents duplicate order conversion
- server-side order number generation
- customer/product/commercial snapshot persisted in the order
- order creation, order item creation, quote conversion and RFQ conversion written as one D1 batch
- customer-scoped order reads
- no payment provider, shipping provider, or external supplier system connected

## Routes

- `POST /api/b2b-orders/from-quote/:quoteId`
- `GET /api/b2b-orders/:orderId`

## Isolation

Forbidden in this stage:

- legacy `AGROZIA_DB`
- legacy `agrozia-db11`
- legacy `AGROZIA_ATTACHMENTS`
- legacy `agz_admin_session`
- copying production commerce data
- modifying `main`
- modifying existing `agro-zia.com` Production

## Runtime gate

Cloudflare D1/Worker provisioning and runtime tests remain pending. Repository implementation must not be described as Production-ready until Store D1 migrations and Preview runtime tests succeed.
