# SITE-1 — AGRO-ZIA / ZARUS Marketplace Shell

## Objective
Build the public commercial layer of the agreed comprehensive AGRO-ZIA website without touching `main` or Production.

## Delivered in this stage
- `zarus-marketplace.html`: public B2B marketplace entry point with product discovery, supplier positioning, RFQ journey and trade workflow.
- `zarus-rfq.html`: structured RFQ experience aligned to the existing RFQ contract.
- Marketplace search calls the existing `GET /api/products` boundary.
- RFQ form calls the existing `POST /api/rfqs` boundary.

## Product architecture
AGRO-ZIA is the corporate/network layer; ZARUS is the specialist B2B commerce layer.

Public journey:
`Home → Products → Product detail → Supplier → RFQ → Quote → Negotiation → Order`

Operational journey:
`Order → Proforma → Payment → Sourcing/QC → Shipping/Tracking → Delivery → Review → Repeat Order`

## Next required modules
1. Product listing and filters with real API data.
2. Product detail and supplier linkage.
3. Supplier directory/profile pages.
4. Customer account and authenticated order/RFQ history.
5. Quote review and negotiation workspace.
6. Proforma/document management.
7. Payment and trade-protection state machine.
8. Shipping/tracking.
9. Reviews and repeat orders.
10. Admin operations, analytics, notifications and audit trail.
11. Full multilingual UX (EN/RU/FA/AR/UZ/TR), SEO, structured data and mobile QA.

## Release gates
- `main`: MUST remain unchanged until final site approval.
- Feature branches only.
- Draft PRs only until all tests and Preview checks pass.
- No Production promotion from this stage.
- Cloudflare Preview/runtime remains a required gate.

## Known blocker inherited from Commerce-5
The current Worker routing does not expose `handleCreateOrder` even though the order module exists. This must be fixed before Commerce-5 can be considered integrated/runtime PASS.

## QA status
Static/API contract design: prepared.
Actual Cloudflare Preview: PENDING while Codespace/build-secret access is unavailable.
Browser E2E: PENDING.
Production: NOT READY.
