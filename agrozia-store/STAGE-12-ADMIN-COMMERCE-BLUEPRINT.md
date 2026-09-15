# Stage 12 — Store Admin Commerce Management Blueprint

## Scope

Extend the independent Store Admin foundation to manage Store commerce records without touching the main B2B runtime, main D1, main R2, or main admin session.

## Controlled resources

- Database: `env.STORE_DB` only
- Admin session: `agz_store_admin_session` only
- Store tables only
- No payment, proforma, shipping, or supplier portal implementation in this sub-stage

## Management areas

1. Products
2. Suppliers
3. RFQs
4. Supplier Matches
5. Quotes
6. Direct Sale Orders
7. B2B Orders
8. Customers

## RBAC baseline

- `admin`: full Store administration
- `manager`: commerce management; no bootstrap/session-security administration
- `operator`: operational read/update actions explicitly granted by route policy

All mutation endpoints must enforce authentication and role server-side. Client-supplied role or customer identity is never trusted.

## API contract principles

- JSON responses only for admin APIs.
- Record ownership and relationship checks are server-side.
- Sensitive fields such as password hashes, salts, session tokens and bootstrap keys are never projected.
- Public customer APIs remain separate from admin APIs.
- Existing customer/B2B commerce repositories remain the source of business invariants; admin APIs must call controlled repository methods rather than duplicate financial/order rules.
- No admin endpoint may read `AGROZIA_DB`, `agrozia-db11`, `AGROZIA_ATTACHMENTS`, or `agz_admin_session`.

## First implementation slice

Start with Products because it is the smallest complete management surface and is referenced by Direct Sale, RFQ and B2B Order flows.

Planned routes:

- `GET /api/store-admin/products`
- `GET /api/store-admin/products/:productId`
- `POST /api/store-admin/products`
- `PATCH /api/store-admin/products/:productId`
- `POST /api/store-admin/products/:productId/publish`
- `POST /api/store-admin/products/:productId/archive`

The implementation must preserve the existing product lifecycle and pricing invariants. Publishing must not fabricate a final price or currency.

## Gate sequence

1. Contract definitions and repository methods.
2. Authorization tests for `admin`, `manager`, `operator`.
3. Product management contract tests.
4. CI execution.
5. Only after CI PASS: continue to Suppliers and downstream management surfaces.
6. Cloudflare Store D1/Worker Preview remains a separate runtime gate.

## Production rule

This blueprint and all implementation work remain branch-only. No merge to `main` and no Production deployment are permitted until Stage 12 and later Store runtime gates pass.
