# Commerce-4 — Quotation

## Goal
Create a private quotation domain that turns an eligible RFQ into a supplier quote without exposing quote creation to public clients.

## Lifecycle
`RFQ → Supplier Match → Quote → Negotiation → Accepted Quote`

Quote statuses:
- `draft`
- `sent`
- `negotiating`
- `accepted`
- `rejected`
- `expired`
- `withdrawn`

## Scope
- D1 schema for quotes.
- Strict quote contract and normalization.
- Repository validation of RFQ, supplier and product references.
- Server-generated quote identity and initial status.
- Private quote creation boundary only.
- Public-safe quote representation without internal notes or privileged identifiers.
- Contract and mock-D1 runtime/security gates.

## Non-goals
- Payment, escrow or Trade Assurance settlement.
- Public quote creation.
- Automatic supplier matching.
- Order creation.
- Production migration.
- Cloudflare Preview deployment in this stage.

## Money model
Money is stored as integer minor units plus ISO-like currency text. No floating-point arithmetic is used for persistence.

Fields include unit price, packaging cost, shipping cost, insurance cost and other fees. `total_amount_minor` is calculated by the trusted server from these components; clients do not provide the total as authoritative data.

## Security boundary
Quote creation is privileged. The public `/api` surface must not call the creation handler. Until Stage 12 authentication has a verified Cloudflare runtime, this stage keeps the quotation API unexposed from `_worker.js` and tests the private handler directly. A later integration must reuse the authenticated admin boundary rather than inventing a public token mechanism.

Public quote output, when eventually exposed through an authenticated buyer flow, must omit internal notes and private operational identifiers.

## Eligibility
An RFQ must exist and be in one of `matched`, `quoted`, or `negotiating` before a quote can be created. The referenced supplier must be published. If a product is supplied, it must be published and its canonical name is used.

## Release gates
1. Static contract/security checks PASS.
2. Mock-D1 positive and negative runtime checks PASS.
3. Existing RFQ/Product/Supplier tests remain PASS.
4. No privileged quote creation route is publicly reachable.
5. Migration is not applied to Production.
6. `main` remains untouched.
7. Cloudflare Preview remains a separate pending gate until runtime access is available.
