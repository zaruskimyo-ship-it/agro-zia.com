# Stage 12 — Supplier Match Management Implementation Notes

## Scope

Implement Store Admin management for `commerce_rfq_supplier_matches` on `feat/store-admin-stage12` only.

## Authoritative schema

- `id`
- `rfq_id`
- `supplier_id`
- `status`: `matched | declined | removed`
- `created_at`
- `updated_at`
- unique `(rfq_id, supplier_id)`

## Required invariants

1. RFQ must exist in `commerce_rfqs`.
2. Supplier must exist in `commerce_suppliers`.
3. Archived suppliers cannot receive a new active match.
4. Duplicate RFQ/Supplier pairs must be rejected or returned idempotently; never bypass the database uniqueness constraint.
5. Only `admin` and `manager` may create or mutate matches.
6. `operator` may read but may not mutate.
7. Existing B2B conversion remains authoritative: an order requires a match with status `matched` and a supplier with status `published`.
8. Customer private fields must not be included in admin match projections unless explicitly required by a later, separately reviewed admin workflow.

## Planned routes

- `GET /api/store-admin/matches`
- `GET /api/store-admin/matches/:id`
- `POST /api/store-admin/matches`
- `PATCH /api/store-admin/matches/:id`
- `POST /api/store-admin/matches/:id/matched`
- `POST /api/store-admin/matches/:id/declined`
- `POST /api/store-admin/matches/:id/removed`

## Implementation sequence

1. Repository with joined, non-sensitive RFQ/Supplier summary.
2. API with server-side admin role enforcement.
3. Explicit validation and stable error mapping.
4. Contract tests for all routes and role restrictions.
5. Repository tests for missing references, duplicate pairs, archived supplier protection, and status transitions.
6. Add tests to Store CI.
7. Verify CI before starting RFQ Admin Management.

## Safety boundary

No Cloudflare runtime changes, no main-branch changes, no Production deployment, and no reuse of the main B2B database, R2 bucket, cookies, or secrets.
