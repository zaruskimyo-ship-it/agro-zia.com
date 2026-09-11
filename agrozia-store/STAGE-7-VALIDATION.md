# Stage 7 — B2B RFQ Validation

## Scope

Independent authenticated B2B Request for Quotation (RFQ) workflow for `agrozia.ir`.

## Implemented

- Store-local RFQ schema in migration `0005_rfqs.sql`.
- Every RFQ is linked to an authenticated Store customer.
- RFQ input normalization with bounded field lengths and attachment-count limits.
- Product references are accepted only when the referenced Store product is published.
- Buyer identity is taken from the authenticated customer session, not from client-supplied buyer fields.
- RFQ request numbers are generated server-side.
- Public RFQ projection excludes buyer email, phone, name, and company.
- Authenticated customer RFQ listing is restricted by `customer_id`.
- JSON body size is bounded to 32 KB.
- Store Worker routes `POST /api/rfqs` and `GET /api/customer/rfqs`.

## Security / isolation invariants

- RFQ persistence uses `env.STORE_DB` only.
- Customer authentication uses the existing Store customer session boundary.
- No `AGROZIA_DB`, `agrozia-db11`, legacy R2 binding, or `agz_admin_session` is used.
- Client input cannot assign an RFQ to another customer.
- Client input cannot set the RFQ request number or workflow status.
- Buyer contact fields are sourced from the authenticated customer record.
- Customer RFQ listing is filtered server-side by authenticated `customer_id`.
- No supplier matching, quotation, negotiation, order, or admin write flow is introduced in Stage 7.

## Repository validation

- RFQ contract test covers normalization, status contract, attachment bounds, and privacy projection.
- Stage 7 branch is based on the Stage 6 Store branch.
- No `main` or existing `agro-zia.com` Production changes are authorized.

## Runtime gate

Cloudflare D1 provisioning, migration execution, Store Worker Preview deployment, authenticated registration/login, RFQ submission, customer-only RFQ listing, and cross-customer isolation tests remain **PENDING** until Cloudflare runtime access is available.

Final Stage 7 PASS requires, on Store Preview:

1. Apply migrations `0001` through `0005` in order.
2. Register and authenticate Customer A.
3. Submit a valid RFQ and confirm a server-generated request number.
4. Confirm the RFQ is stored with Customer A's identity.
5. Confirm client-supplied buyer identity fields cannot override the authenticated customer.
6. Confirm an unpublished/nonexistent product reference is rejected.
7. Confirm Customer A can list only Customer A RFQs.
8. Authenticate Customer B and confirm Customer A RFQs are not returned.
9. Confirm unauthenticated RFQ submission/listing returns 401.
10. Confirm oversized and malformed JSON requests are rejected safely.
11. Confirm no legacy production database/R2 resource is referenced.

## Safety gate

Do not merge Stage 7 into `main`, attach `agrozia.ir` to Production, or modify `agro-zia.com` Production until the Store Preview runtime gate passes.
