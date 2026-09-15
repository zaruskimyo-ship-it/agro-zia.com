# Stage 12 — Supplier Match Management

## Scope
Independent Store Admin management of `commerce_rfq_supplier_matches`.

## Invariants
- Store DB only (`env.STORE_DB`).
- Valid statuses: `matched`, `declined`, `removed`.
- Unique `(rfq_id, supplier_id)` is enforced by the database.
- RFQ and Supplier must exist before creating a match.
- Supplier must not be archived when creating or activating a match.
- Existing B2B conversion remains authoritative: only `matched` matches for published suppliers qualify.
- Customer-private data is not exposed in public projections.

## Planned routes
- GET `/api/store-admin/supplier-matches`
- GET `/api/store-admin/supplier-matches/:id`
- POST `/api/store-admin/supplier-matches`
- PATCH `/api/store-admin/supplier-matches/:id`
- POST `/api/store-admin/supplier-matches/:id/matched`
- POST `/api/store-admin/supplier-matches/:id/declined`
- POST `/api/store-admin/supplier-matches/:id/removed`

## RBAC
- `admin`, `manager`: read and mutate.
- `operator`: read only.

## Gate
Repository/API implementation, contract tests, and CI must pass before RFQ administration begins. Cloudflare runtime remains pending.
