# Commerce-2 — RFQ Contract

## Goal

Introduce a structured B2B Request for Quotation (RFQ) flow without rebuilding or bypassing the existing Inquiry pipeline.

The RFQ is the commercial evolution of an inquiry:

`RFQ → review → product/supplier matching → quotation → negotiation → proforma → order`

Commerce-2 defines the data and API boundary first. Runtime deployment and Production schema changes remain gated.

## Relationship to existing Inquiry

The existing `inquiries` table remains the intake and notification foundation. Existing inquiry behavior must not regress.

An RFQ may originate from:

- a public product page;
- a general sourcing request;
- a future category/search experience.

The implementation should preserve the original inquiry/request reference and provide a deterministic relationship between the commercial RFQ record and the originating inquiry when one exists.

Do not delete, rename, or repurpose existing inquiry columns as part of Commerce-2.

## RFQ identity

Required logical fields:

- `id` — opaque server-generated identifier;
- `request_number` — human-facing unique reference, compatible with the existing request-reference convention;
- `status` — controlled lifecycle value;
- `created_at`, `updated_at` — server timestamps.

Recommended initial statuses:

- `received`
- `under_review`
- `matching`
- `quoted`
- `negotiating`
- `converted`
- `cancelled`
- `closed`

Only explicitly supported transitions may be accepted by future mutation endpoints.

## Buyer request data

The RFQ contract supports:

- product or requested item;
- optional `product_id` for a published catalog product;
- requested quantity and unit;
- destination country/region and optional destination details;
- target timing;
- packaging requirements;
- private-label requirement;
- sample requirement;
- requested technical/compliance documents;
- free-text description/specification;
- attachment references;
- buyer company/contact information needed for fulfillment.

Sensitive contact information is internal data and must never be exposed by a public read endpoint unless an explicit authenticated contract permits it.

## Commercial boundary

Commerce-2 does not create quotations, orders, payment, escrow, or trade protection records. Those belong to later stages.

RFQ stores the buyer's requested commercial context, not a supplier's final offer.

Future quotation data must reference the RFQ rather than duplicating the RFQ as an order.

## Attachments

Attachments must use opaque internal storage identifiers. Private R2 object keys must not be returned from public APIs.

Existing attachment handling must remain compatible. New RFQ attachment limits must be bounded by count, size, and content type, and validated server-side.

## Public API boundary

Public endpoints may expose only the minimum fields required to create or inspect a permitted RFQ state.

A public creation endpoint must:

- accept `POST` only;
- validate JSON and content type;
- enforce body-size and field-length limits;
- allowlist enumerated values;
- reject unexpected privileged/internal fields;
- generate identifiers and timestamps server-side;
- never accept or trust a client-supplied status, supplier ID, internal user ID, storage key, or administrative flag;
- return a stable request reference without leaking internal database details.

Public reads, if introduced, must expose only explicitly public-safe fields. Buyer contact data, supplier identifiers, internal notes, and operational metadata remain private.

## Internal API boundary

Administrative RFQ reads/mutations must be behind the existing internal authentication boundary.

Internal capabilities may include:

- review and status transition;
- supplier/product matching;
- internal notes;
- attachment inspection;
- conversion to quotation.

These capabilities must not be reachable through a public route by changing query parameters or HTTP methods.

## Security requirements

1. Fail closed when the database binding is unavailable.
2. Use parameterized D1 statements; no string interpolation for user values.
3. Enforce bounded pagination for internal lists.
4. Enforce bounded text and JSON fields.
5. Reject malformed identifiers and unsupported status values.
6. Do not expose supplier IDs, internal IDs, R2 keys, secrets, authentication material, or internal notes publicly.
7. Escape untrusted content at presentation boundaries.
8. Do not log passwords, session secrets, attachment contents, or unnecessary personal data.
9. Rate limiting/abuse controls should be added before exposing high-volume anonymous RFQ creation publicly.
10. Existing inquiry email/Telegram notifications must not be duplicated accidentally by an RFQ integration.

## Data model direction

A dedicated RFQ table is preferred over extending `inquiries` with a large set of commerce-only columns. This keeps the existing intake contract stable and permits later quotation/order relations.

Expected relationship:

`inquiries (optional origin) → rfqs → quotations → orders`

The first implementation should use foreign keys only where the existing schema and migration strategy support them safely.

## Product integration

When `product_id` is supplied, the server must verify that the referenced product is published and publicly orderable/requestable according to the Product Intelligence contract.

A client must not be able to attach an RFQ to an unpublished or archived product merely by guessing an ID or slug.

## Lifecycle integrity

RFQ status is not a free-form text field. Future mutation code must implement an explicit transition matrix.

Initial intended flow:

`received → under_review → matching → quoted → negotiating → converted`

Terminal alternatives:

`received/under_review/matching/quoted/negotiating → cancelled`

`quoted/negotiating → closed`

The exact transition implementation is a Commerce-2 code gate and must be tested before runtime PASS.

## Migration policy

`migrations/0001_inquiries.sql` and `0002_inquiry_attachments.sql` are preserved unchanged.

A Commerce-2 migration must be a new numbered migration and must not be executed against Production until:

1. schema review is complete;
2. static contract/security checks pass;
3. Preview migration succeeds;
4. API runtime tests pass;
5. negative/security tests pass;
6. rollback/recovery implications are documented.

## Definition of Done

Commerce-2 is not complete until all are true:

- RFQ contract documented;
- dedicated schema reviewed;
- public/internal boundary implemented;
- validation and transition rules implemented;
- existing Inquiry regression checks pass;
- build passes;
- Preview deployment succeeds;
- public RFQ negative tests pass;
- authenticated internal tests pass;
- no Production promotion occurs without explicit user approval.

## Current gate

Branch: `feat/commerce-2-rfq`

Base: Commerce-1 latest verified commit `e23c7ec2cc67abf4f842c11e79a536bd28f5deed`

`main` remains locked and untouched.

Runtime/Preview evidence is still required before any stage can be declared fully PASS.
