# Commerce-2 — RFQ Contract

## Goal

Introduce a structured B2B Request for Quotation (RFQ) flow without rebuilding or bypassing the existing Inquiry pipeline.

Commercial flow:

`RFQ → review → product/supplier matching → quotation → negotiation → proforma → order`

Commerce-2 defines the RFQ data and public creation boundary. Preview/runtime and Production schema changes remain gated.

## Relationship to Inquiry

The existing `inquiries` table remains the intake and notification foundation and must not regress. Commerce-2 does not delete, rename, or repurpose existing inquiry columns.

Future integrations may relate an RFQ to its originating inquiry, but Commerce-2 does not rebuild the Inquiry pipeline.

## RFQ data

The dedicated `commerce_rfqs` table contains:

- server-generated opaque `id`;
- server-generated unique `request_number`;
- controlled `status`;
- language;
- optional product reference and product name;
- quantity and destination details;
- packaging/private-label/sample requirements;
- requested documents and timing;
- description/specification;
- buyer contact fields for internal fulfillment;
- attachment count and server timestamps.

Current status values are:

`submitted`, `reviewing`, `matched`, `quoted`, `negotiating`, `converted`, `cancelled`.

Status is server-controlled. Public creation always stores `submitted`, regardless of a client-supplied status.

## Product integrity

When `product_id` is supplied, the server must resolve it against `commerce_products` and accept it only when the product exists and has `status = 'published'`.

The server uses the published product's canonical `name` rather than trusting a client-supplied product name when a product ID is present. Unpublished, archived, or unknown product IDs are rejected as `invalid_rfq`.

Supplier identifiers are never accepted from or exposed by the public RFQ boundary.

## Public API boundary

`POST /api/rfqs` is public-facing and must:

- accept POST only;
- parse bounded JSON bodies;
- enforce a 32 KiB maximum body size;
- enforce contract field-length and attachment-count limits;
- generate request identity and timestamps server-side;
- force the initial status to `submitted`;
- validate a supplied product ID against a published product;
- return only the public-safe RFQ representation;
- never expose buyer PII, supplier IDs, internal IDs, R2 keys, secrets, authentication material, or internal notes;
- return generic failure responses without leaking internal errors.

Current failure contract:

- `405 method_not_allowed` for non-POST;
- `400 invalid_json` for malformed JSON;
- `400 invalid_rfq` for contract or product-validation failure;
- `413 payload_too_large` for oversized bodies;
- `503 rfq_service_unavailable` when D1 is unavailable or an internal persistence error occurs.

The public API has no direct access to R2, Email, or Admin authentication secrets.

## Attachments

Commerce-2 currently records a bounded attachment count. Actual RFQ attachment upload/storage integration remains a later controlled step and must preserve private R2 object handling.

## Security requirements

1. Fail closed when D1 is unavailable.
2. Use parameterized D1 statements for user values.
3. Validate product references server-side.
4. Keep client-controlled request number and status out of persistence authority.
5. Bound body, field, and attachment counts.
6. Keep buyer PII out of public responses.
7. Keep supplier IDs, internal IDs, R2 keys, secrets, and admin data private.
8. Do not log passwords, session secrets, attachment contents, or unnecessary personal data.
9. Add abuse/rate controls before high-volume anonymous RFQ creation is exposed broadly.
10. Do not duplicate existing Inquiry email/Telegram notifications accidentally.

## Migration policy

`migrations/0001_inquiries.sql`, `0002_inquiry_attachments.sql`, and `0003_commerce_products.sql` remain unchanged.

`migrations/0004_commerce_rfqs.sql` must not be executed against Production until schema review, Preview migration, API runtime, negative/security tests, regression checks, and recovery implications have all passed.

## Definition of Done

Commerce-2 is fully complete only when:

- RFQ contract and schema are reviewed;
- public boundary is implemented;
- product-reference integrity is enforced;
- validation and server-owned lifecycle rules are tested;
- existing Product and Inquiry routes remain intact;
- build and automated tests execute successfully;
- Preview deployment and real D1 runtime tests pass;
- negative/security tests pass in the target runtime;
- Production remains unchanged until explicit user approval.

## Current gate

Branch: `feat/commerce-2-rfq`

Base: Commerce-1 latest verified commit `e23c7ec2cc67abf4f842c11e79a536bd28f5deed`

Draft PR: #61

`main` remains locked and untouched.

Runtime/Preview evidence is still required before Commerce-2 can be declared fully PASS.
