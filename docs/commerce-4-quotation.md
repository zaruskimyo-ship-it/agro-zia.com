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
- Quantity-aware exact quote amount calculation.
- Optional fixed and percentage inflation adjustment.
- Contract and mock-D1 runtime/security gates.

## Amount model
Money is stored as integer minor units plus ISO-like currency text. Quote amount calculation is server-side and uses `BigInt` internally so multiplication, additions and overflow checks do not pass through floating-point arithmetic.

The amount formula is:

`round(unit_price_minor × quantity) + packaging + shipping + insurance + other_fees + fixed_inflation_adjustment + percentage_inflation_adjustment`

Quantity is accepted as a decimal-leading value such as `10 MT` or `2.5 MT`, with exact fixed-point parsing up to six decimal places. The percentage adjustment is represented as basis points (`100 bps = 1%`) and defaults to zero. The fixed adjustment is integer minor units and also defaults to zero.

`total_amount_minor` is calculated by the trusted server from these components; clients do not provide the total as authoritative data. Negative adjustments and values beyond the configured money/percentage bounds are rejected, and totals above the maximum supported minor-unit amount are rejected.

## Security boundary
Quote creation is privileged. The public `/api` surface must not call the creation handler. Until Stage 12 authentication has a verified Cloudflare runtime, this stage keeps the quotation API unexposed from `_worker.js` and tests the private handler directly. A later integration must reuse the authenticated admin boundary rather than inventing a public token mechanism.

Public quote output, when eventually exposed through an authenticated buyer flow, must omit internal notes and private operational identifiers.

## Eligibility
An RFQ must exist and be in one of `matched`, `quoted`, or `negotiating` before a quote can be created. The referenced supplier must be published. If a product is supplied, it must be published and its canonical name is used.

## Release gates
1. Static contract/security checks PASS.
2. Mock-D1 positive and negative runtime checks PASS.
3. Exact amount tests cover base amount, ancillary costs, fixed adjustment, percentage adjustment, zero-default adjustment, negative/overflow rejection, and preservation of the stored amount when a quote is represented as `sent`.
4. Existing RFQ/Product/Supplier tests remain PASS.
5. No privileged quote creation route is publicly reachable.
6. Migration is not applied to Production.
7. `main` remains untouched.
8. Quote `draft → sent` transition is a separate gate and is **not implemented or promoted by this correction branch**; it must be inspected and tested before Stage 12 can leave Blocked.
9. Cloudflare Preview remains a separate pending gate until runtime access is available.
