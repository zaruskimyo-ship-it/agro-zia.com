# SITE-3 — Customer Account + RFQ/Quote Workspace

## Objective

Turn the public discovery/RFQ journey into a coherent private customer workspace without exposing buyer data publicly and without reusing internal admin authentication.

## Boundary

Customer workspace is a separate identity domain from the internal AGRO-ZIA admin dashboard.

- Customer session: future customer-facing account/session mechanism.
- Internal admin session: existing `agz_admin_session`; never accepted as proof of customer ownership.
- Public APIs remain read-only or explicitly public-write only where already contracted (for example RFQ creation).
- Private workspace APIs must derive customer identity from a server-side authenticated session, never from a caller-supplied `buyer_id`, email, or company name.

## Customer navigation

1. Dashboard
2. My RFQs
3. RFQ detail / timeline
4. Quotes
5. Quote detail / commercial terms
6. Negotiation workspace
7. Orders
8. Documents
9. Notifications
10. Company profile / account settings

Private pages must be `noindex` and must not be cached as public content.

## RFQ workspace

Each RFQ detail view should present:

- request number
- product and supplier context when matched
- requested quantity and destination
- packaging / private-label / document requirements
- target timing
- current lifecycle status
- creation/update timestamps
- activity timeline
- linked quote(s)
- linked order when conversion occurs

RFQ lifecycle currently defined by Commerce-2:
`submitted → reviewing → matched → quoted → negotiating → converted`
with `cancelled` as a terminal alternative.

## Quote workspace

Quote detail should show:

- quote number
- linked RFQ
- supplier identity and public supplier profile
- product identity
- supplier-defined quoted amount and currency
- unit price when explicitly provided
- terms / validity / expiry
- status
- created and updated timestamps
- negotiation history when implemented
- conversion-to-order action only when quote is accepted and all server-side prerequisites pass

Never infer a quantity multiplication rule from free-text RFQ quantity. The current Commerce-4 amount is supplier-defined quoted commercial value unless explicit quantity semantics are introduced.

Suggested customer-facing quote states:
`draft`, `sent`, `accepted`, `declined`, `expired`, `superseded`, `converted`.

The implementation must map these to the actual backend contract rather than inventing incompatible database values.

## Actions

Customer actions must be server-authorized and state-aware:

- accept quote
- decline quote
- request negotiation / clarification
- cancel eligible RFQ
- convert an accepted quote to an order
- view/download permitted documents

Every mutation must validate ownership and current state server-side. UI hiding is not authorization.

## Documents

Document center should eventually support:

- RFQ attachments
- supplier quote/proforma documents
- customer-provided trade documents
- order/proforma documents
- shipping/QC documents

Private documents must use authenticated, time-limited access and must never be exposed through public product/supplier responses.

## Notifications

Initial model:

- new quote
- quote expiring
- negotiation update
- RFQ status change
- order status change
- document available

Notifications should link to the relevant private workspace resource and avoid placing sensitive commercial content in public URLs.

## Company profile

Customer profile should support, subject to final account schema:

- company name
- contact name
- business email
- phone
- country
- destination/location
- optional business identifiers
- language / communication preference

PII must remain behind customer authorization and must not leak into public RFQ, product, supplier, search, or SEO payloads.

## API design target

Private routes should follow a consistent pattern such as:

- `GET /api/account/me`
- `GET /api/account/rfqs`
- `GET /api/account/rfqs/:id`
- `GET /api/account/quotes`
- `GET /api/account/quotes/:id`
- `POST /api/account/quotes/:id/accept`
- `POST /api/account/quotes/:id/decline`
- `POST /api/account/quotes/:id/negotiate`
- `GET /api/account/orders`
- `GET /api/account/orders/:id`
- `GET /api/account/documents`
- `GET /api/account/notifications`

These are architecture targets, not claims that all routes currently exist. Implementation must first reconcile them with the existing commerce contracts and Worker router.

## Security gates

- Separate customer and admin authentication domains.
- Server-derived customer identity.
- Ownership checks on every private read/write.
- CSRF protection appropriate to the eventual browser session model.
- Secure, HttpOnly, SameSite cookies where cookie sessions are used.
- No sensitive data in query strings when avoidable.
- No public caching of private responses.
- No public buyer PII.
- No fabricated supplier verification or commercial terms.
- Rate limits and abuse controls on authentication and mutations.
- Audit trail for quote acceptance, decline, negotiation and order conversion.

## UX / localization

Mobile-first workspace with a persistent status/timeline pattern. Support RTL Persian/Arabic and localized English/Russian/Uzbek/Turkish. Keep commercial facts visually distinct from workflow state and from informational copy.

## Integration sequence

`Product → RFQ → Supplier match → Quote → Negotiation → Accepted Quote → Order → Proforma/Payment → Sourcing/QC → Shipping → Delivery`

SITE-3 covers the customer-facing workspace boundary and its contracts. Payment, escrow/trade protection, fulfillment, shipping execution, and final account identity verification remain subsequent stages.

## QA / release gate

This stage is a feature-branch design/build increment only.

Required before integration:

- static/code review
- contract/security tests
- real Worker router verification
- authenticated customer runtime tests
- ownership/negative authorization tests
- RFQ/quote/order lifecycle tests
- mobile/browser QA
- Cloudflare Preview evidence
- explicit user approval before any merge or Production release

`main` and Production remain untouched.
