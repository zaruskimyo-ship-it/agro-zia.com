# SITE-8 — Supplier Operations Workspace

## Objective
Turn the supplier side of ZARUS into the operational counterpart of the customer transaction center, while keeping all financial, fulfillment, and authorization decisions server-side.

## Scope
- Supplier workspace dashboard
- Supplier RFQ inbox and RFQ detail
- Quote drafting and send workflow
- Quote negotiation/messages
- Accepted-quote visibility
- Order intake and order status visibility
- Proforma/payment status visibility
- Sourcing/QC/shipping/document operational surfaces
- Company profile and supplier product management entry points
- Notifications and audit-friendly activity timeline

## Quote lifecycle
`draft -> sent -> negotiating -> accepted | rejected | expired`

Customer actions must never directly set supplier-owned quote state. The supplier operation is the authoritative transition for `draft -> sent`; customer actions may move an eligible `sent` quote into `accepted`, `rejected`, or `negotiating` according to the transaction contract.

## Authorization
Every supplier workspace request must derive supplier identity from the authenticated supplier session. Client-supplied supplier IDs are treated only as lookup hints and must never establish authorization. Every RFQ, quote, order, document, QC record, and shipment must be checked against the authenticated supplier's ownership/relationship.

## Commercial integrity
- Product, RFQ, supplier, currency, and order relationships are validated server-side.
- Financial amounts are never trusted from the browser.
- Quote revisions must preserve an auditable history.
- Sending a quote must create a server timestamp and immutable commercial snapshot for that quote version.
- Duplicate send/order operations must be idempotent where applicable.

## Operational states
Supplier-facing order work should expose the canonical order/fulfillment state without allowing arbitrary client-side state changes. Operational mutations will be introduced through explicit server-side transition endpoints.

## Non-goals for SITE-8
- No live payment provider activation.
- No escrow/insurance guarantee claim.
- No production deployment.
- No changes to `main`.
- No fabricated supplier verification, shipment, QC, or document evidence.

## Release gates
1. Syntax/contract tests.
2. Authorization and ownership negative tests.
3. Quote lifecycle tests, including send/duplicate/invalid-state cases.
4. Mock-D1 integration tests.
5. Cloudflare Preview deployment.
6. Real Preview D1 migrations.
7. Browser/API E2E with customer-to-supplier transaction flow.
8. Security review before leaving Draft state.
