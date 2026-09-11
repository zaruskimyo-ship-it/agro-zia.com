# SITE-4 — Proforma, Payment & Trade Protection

## Goal

Extend the commercial journey from accepted quotation to a controlled pre-payment transaction while keeping financial execution behind explicit server-side boundaries.

## Transaction sequence

`Accepted Quote → Order → Proforma → Payment Intent → Payment Confirmation → Trade Protection → Fulfillment`

No payment is considered successful from a browser redirect alone. The authoritative state transition must come from a verified server-side payment event.

## Proforma

A proforma is generated only from an eligible order and captures an immutable commercial snapshot:

- proforma number
- order number / order ID
- buyer and supplier identities appropriate to the document
- product and quantity as contracted
- currency
- unit price when contractually defined
- quoted/order amount
- destination
- incoterm
- payment terms
- validity / due date
- document issue timestamp
- version

Once issued, a proforma version is immutable. Corrections create a new version rather than mutating the historical document.

## Payment boundary

Introduce a payment-intent abstraction rather than coupling orders directly to a payment provider.

Target fields:

- payment intent ID
- order ID
- proforma version ID
- provider
- provider reference
- amount minor units
- currency
- status
- idempotency key
- created/updated timestamps
- paid/failed timestamps

Suggested lifecycle:

`created → pending → authorized → paid`

with terminal/error states such as `failed`, `cancelled`, `expired`, `refunded` as provider capabilities require.

### Critical rules

- Amount and currency are server-derived from the current eligible proforma/order snapshot.
- Client-submitted amount/currency is never authoritative.
- Provider webhook/event verification is mandatory.
- Webhook processing is idempotent.
- Replayed events cannot duplicate payment or order transitions.
- Payment credentials/card data are never stored by AGRO-ZIA unless a separately approved compliant architecture explicitly requires it.
- Secrets and provider credentials remain outside source control.

## Trade Protection

Trade Protection is a workflow/status layer, not a claim of insurance, escrow, bank guarantee, or legal protection unless an actual licensed/provider-backed service is integrated and verified.

Initial states:

`not_requested → requested → eligible → active → claim_review → resolved`

Possible resolution outcomes:

`released`, `refunded`, `partially_resolved`, `rejected`, `cancelled`.

The system must record:

- protected order ID
- coverage/service provider when applicable
- eligibility decision
- protected amount/currency
- activation timestamp
- evidence/documents
- claim events
- resolution
- audit trail

## Security

- Authentication required for all private financial operations.
- Customer identity derived from authenticated session.
- Order ownership verified server-side.
- Proforma eligibility verified server-side.
- No direct client-controlled state transitions.
- Webhook signatures verified before processing.
- Idempotency enforced at database level where possible.
- Sensitive payment endpoints use `no-store` and appropriate security headers.
- No payment or financial identifiers in public SEO/indexable responses.
- Audit log for issue, revision, payment-event, protection and resolution actions.

## Customer UX

The customer workspace should expose:

1. Order summary
2. Current proforma version
3. Payment status
4. Secure payment action when available
5. Trade Protection status and eligibility
6. Required documents
7. Full transaction timeline
8. Support/contact escalation path

The UI must clearly distinguish `payment initiated` from `payment confirmed`.

## Operational controls

Before enabling real-money execution:

- provider sandbox integration
- webhook signature verification
- replay/idempotency tests
- amount/currency tampering tests
- duplicate event tests
- failure/refund tests
- reconciliation procedure
- audit-log verification
- privacy/security review
- legal/compliance review for the target countries and payment provider

## Integration dependencies

SITE-4 depends on the accepted-quote/order boundaries from Commerce-4/5 and the customer workspace from SITE-3. The existing Commerce-5 finding remains important: the Order handler must be wired into the real Worker router before an end-to-end runtime PASS can be claimed.

## Deferred

- Real payment provider selection/configuration
- Escrow or regulated financial service integration
- Automatic FX conversion
- Chargeback automation
- Tax/VAT calculation engine
- Final legal wording
- Production payment activation

These remain explicit future implementation gates rather than being simulated.

## Release gate

This document defines the architecture for SITE-4. Runtime implementation and real payment integration require Preview/sandbox evidence and explicit approval. `main` and Production remain untouched until the complete site is finalized, tested, and approved.
