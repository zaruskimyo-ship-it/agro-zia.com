# SITE-4 — Proforma + Payment + Trade Protection

## Objective

Extend the customer workspace from an accepted quotation/order into a controlled commercial transaction layer. This stage defines the contracts and safety boundaries for proforma, payment orchestration, and trade protection without pretending that payment, escrow, or settlement already exists.

## Core principle

An order is a commercial instruction; it is not proof of payment. Payment state must be independently recorded and reconciled from a trusted payment provider or an explicitly verified manual process.

## Proforma

A proforma is generated only from an eligible order and must preserve the order's commercial snapshot at generation time.

Required facts: unique server-generated proforma number, linked order, buyer/supplier snapshots, product and quantity, currency, unit/commercial amounts, applicable fees, total, destination, Incoterm, payment terms, validity, issue date, revision/version, and status.

Suggested lifecycle: `draft → issued → superseded → accepted → cancelled`.

An issued proforma must not be silently rewritten after material commercial changes; create a new revision/version.

## Payment orchestration

Payment is provider-neutral at this layer. The platform should create a payment intent/reference and accept final state transitions only from verified provider callbacks/webhooks or an explicitly verified manual process.

Suggested states: `unpaid`, `pending`, `authorized`, `paid`, `partially_paid`, `failed`, `cancelled`, `refunded`, `disputed`.

Rules:
- Never mark an order paid because a browser returned to a success URL.
- Never trust client-supplied amount, currency, or order status.
- Derive payable amount from the active server-side proforma/order snapshot.
- Verify webhook signatures and event IDs.
- Make webhook processing idempotent.
- Store provider references without exposing secrets.
- Use integer minor units internally; currency must be explicit.
- Keep refunds/disputes auditable.

## Trade protection

Trade Protection is a workflow/evidence layer, not a claim of insurance or escrow unless an actual provider/contract exists.

Suggested states: `not_requested`, `requested`, `under_review`, `protected`, `partially_protected`, `released`, `claim_open`, `claim_resolved`, `cancelled`.

Eligibility can depend on supplier status, order/proforma state, corridor, product/category, payment state, documents, and agreed inspection/QC terms.

Never display “Protected”, “Escrowed”, “Insured”, or equivalent language unless an active verified protection contract exists for that transaction.

## Documents and timeline

Private transaction documents should be versioned and authenticated: proforma, commercial invoice, packing list, QC/certificates, payment receipt, shipping documents, and protection/claim evidence.

Customer timeline: `Quote accepted → Order created → Proforma issued → Payment initiated → Payment verified → Protection activated (if eligible) → Sourcing/QC → Shipment → Delivery → Completion`.

Each event should have server timestamp, actor/source, event type, and reference ID. Sensitive provider payloads must not be rendered directly.

## API target

Future private boundaries may include:
- `GET /api/account/orders/:id/proforma`
- `POST /api/account/orders/:id/proforma/accept`
- `POST /api/account/orders/:id/payments`
- `GET /api/account/orders/:id/payments`
- `POST /api/payments/webhooks/:provider`
- `GET /api/account/orders/:id/protection`
- `POST /api/account/orders/:id/protection/request`
- `GET /api/account/orders/:id/timeline`
- `GET /api/account/orders/:id/documents`

These are target boundaries, not claims that the routes already exist.

## Authorization and financial safety

Every transaction endpoint must derive customer identity from the authenticated customer session and verify order ownership. Admin authorization remains separate.

No floating-point money, no client-controlled totals, no payment-secret exposure, no replayable webhooks, and no silent promotion of ambiguous payment events to `paid`. Use idempotency keys for externally effectful mutations and reconciliation for provider/platform divergence.

## Existing integration

Commerce-4 currently creates quotes with server-generated quote numbers and derives totals through its quote contract; its API is private/auth-gated. The existing quote repository independently validates the RFQ, supplier and published product relationships before creating a quote. The next transaction layer must consume the accepted order/proforma snapshot rather than reconstructing commercial values from browser input.

## QA / release gate

Required before production readiness: state-machine contract tests, ownership negative tests, payment idempotency/replay tests, webhook signature tests, amount/currency tampering tests, proforma revision tests, browser/mobile workspace tests, Cloudflare Preview evidence, and real provider sandbox evidence before any live payment path is enabled.

`main` and Production remain untouched until the complete site reaches final review and explicit approval.
