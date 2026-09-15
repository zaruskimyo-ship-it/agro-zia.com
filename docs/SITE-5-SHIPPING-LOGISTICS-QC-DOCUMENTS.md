# SITE-5 — Shipping, Logistics, QC & Document Center

## Objective

Complete the post-order operational layer of the AGRO-ZIA / ZARUS B2B journey without activating production logistics, payment, escrow, or third-party claims before their real integrations are verified.

## Customer Journey

`Confirmed Order → Sourcing → QC → Ready to Ship → Booked → In Transit → Customs → Delivered → Completed`

Exception states: `on_hold`, `delayed`, `cancelled`, `lost`.

The customer workspace must expose one clear timeline across order, sourcing, QC, shipping and documents.

## Shipment Model

A shipment is created only from an eligible order by a server-side operation. The commercial snapshot of the order remains authoritative.

Core fields:

- shipment id and shipment number
- order id / order number
- carrier or logistics provider
- tracking number(s)
- origin and destination
- incoterm snapshot
- transport mode: sea / air / road / rail / multimodal
- package/count and gross/net weight when known
- estimated and actual departure/arrival
- current status
- created/updated timestamps

Multi-leg shipments must support separate legs while retaining one customer-facing shipment timeline.

## Tracking Events

Tracking is provider-neutral. External tracking providers may later feed normalized events such as:

`booked`, `picked_up`, `departed`, `transshipment`, `arrived_port`, `customs_hold`, `customs_cleared`, `out_for_delivery`, `delivered`.

Provider events must be authenticated where the provider supports signatures, deduplicated by provider event id, and processed idempotently. Client-submitted tracking status must never be authoritative.

## Incoterms & Commercial Integrity

Incoterms, destination, quantity, currency and commercial amounts are snapshots of the accepted commercial transaction. Logistics operations must not silently change the order's commercial terms.

Any approved commercial correction must create an auditable new version rather than overwrite historical transaction data.

## Quality Control

QC is a workflow, not a marketing claim. A QC record may contain:

- inspection id and order/shipment reference
- inspection scope and checklist
- inspected quantity/sample
- inspection date
- inspector/provider identity
- result: pending / passed / failed / conditional
- findings and corrective actions
- evidence references
- approval/rejection timestamp

No product, supplier or shipment may be labeled `verified`, `certified`, `passed`, or equivalent unless the underlying evidence exists.

## Document Center

The document center provides controlled access to transaction documents, including where applicable:

- proforma invoice
- commercial invoice
- packing list
- certificate of origin
- phytosanitary certificate
- QC/inspection report
- bill of lading / airway bill
- customs documentation
- shipping/tracking documents
- other transaction-specific certificates

The system must never fabricate a document, certificate, inspection result, tracking event or regulatory status.

Documents should be stored privately in R2 (or an equivalent private object store). Customer access should use authenticated, authorized, time-limited download/view mechanisms. Public object URLs must not expose private transaction documents.

## Access Control

Roles are separated:

- Buyer: own company orders, shipments and permitted documents
- Supplier: own assigned transactions and permitted operational documents
- Internal operations/admin: authorized operational visibility and document management
- Public visitor: no private shipment, QC or transaction-document access

Every read and mutation must perform server-side identity and ownership checks.

## Notifications

Customer notifications should be generated from authoritative state transitions, for example:

- order confirmed
- sourcing started
- QC scheduled/completed
- shipment booked
- shipment departed
- customs exception
- delivery completed
- new document available
- action required

Notifications must be idempotent and must not disclose private data to the wrong recipient.

## Customer UX

The customer workspace should provide:

1. Order summary
2. Fulfillment status and progress indicator
3. Shipment/tracking timeline
4. QC status and permitted evidence
5. Document center
6. Exception/hold messages
7. Contact/support action
8. Repeat-order path after completion

Mobile-first design is required. Persian/Arabic RTL and EN/RU/UZ/TR localization must remain compatible with the existing multilingual product experience.

## Supplier / Operations UX

Supplier and operations views should prioritize actionable queues:

- orders awaiting confirmation
- sourcing tasks
- QC tasks
- shipments awaiting booking
- delayed/exception shipments
- missing documents
- delivery confirmation

Operational pages are private and must not be indexed by search engines.

## Security & Privacy

Required controls:

- authenticated access for private resources
- server-side authorization on every private route
- no PII or private document URLs in public HTML
- `no-store` for private API responses where appropriate
- private object storage
- short-lived signed access for documents
- audit trail for status/document changes
- idempotency for webhook/event ingestion
- rate limiting on externally reachable operational endpoints
- secret values outside source control
- no sensitive credentials in query strings, logs or client storage

## Suggested API Boundary

Future implementation should keep the operational surface explicit:

- `GET /api/customer/orders/:id`
- `GET /api/customer/orders/:id/shipments`
- `GET /api/customer/shipments/:id/timeline`
- `GET /api/customer/orders/:id/documents`
- `GET /api/customer/orders/:id/qc`
- private supplier/operations equivalents
- provider webhook endpoints with signature verification

Routes must remain private and must derive identity from the authenticated session rather than trusting buyer/supplier identifiers supplied by the browser.

## Integration Dependencies

SITE-5 depends on the commercial chain already defined by Commerce-4/5 and SITE-3/4. In particular:

`RFQ → Quote → Order → Proforma → Payment Intent → Fulfillment → QC → Shipping → Delivery`.

The existing Commerce-5 order-router integration blocker and Cloudflare required-secret build blocker remain release blockers until actually fixed and runtime-verified.

## SEO

Catalog/product/supplier discovery remains public and indexable where appropriate. Customer accounts, orders, shipments, QC and document pages must be `noindex` and private.

Structured data may only describe facts that are actually present and verified.

## QA / Release Gate

SITE-5 is an architecture/design increment until runtime evidence exists. Before release:

- build passes
- API contract/security tests pass
- Cloudflare Preview deploy succeeds
- authenticated customer shipment/order flows work in Preview
- ownership isolation is tested
- private document access is tested
- tracking event idempotency is tested
- QC/document permissions are tested
- mobile and RTL layouts are tested
- no production payment/logistics provider is activated without explicit approval
- `main` remains unchanged

## Release Decision

**NOT READY FOR PRODUCTION.**

This stage expands the comprehensive AGRO-ZIA/ZARUS website into its post-order operational experience while preserving the rule that `main` and Production remain untouched until the complete site is integrated, Preview-tested, security-reviewed and explicitly approved.
