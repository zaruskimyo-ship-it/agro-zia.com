# Stage 14-M — Account RFQs Integration Status

## Scope
Connect `/account/rfqs` to the existing authenticated Store RFQ API without changing RFQ persistence, customer identity, attachment storage, B2B order logic, main, or Production.

## Root-cause / source inspection
- `rfq-api.js` already exposes `GET /api/customer/rfqs` and resolves the authenticated customer session before listing.
- `rfq-repository.js` scopes the query with `WHERE customer_id = ?` and returns only the public RFQ projection.
- `rfq-contract.js` defines the public projection and does not expose buyer email/phone or other customer identity fields.
- The previous `/account/rfqs` page in `account-site-shell.js` was structural and did not load live RFQs.
- `_worker.js` now routes `/account/rfqs` to a dedicated live response before the structural account shell.

## Implemented
- Added `src/site/account-rfqs-live-response.js`.
- Live page calls `GET /api/customer/rfqs?limit=50` with `credentials: same-origin`.
- 401 redirects to the customer account boundary.
- Real `request_number`, `status`, product, quantity, destination, timing, and attachment count are displayed.
- No synthetic RFQ references or mock RFQ records are generated.
- No attachment binary/R2 workflow was added; the existing RFQ API still exposes attachment count only.
- Added `tests/account-rfqs-live-integration.test.js`.
- Updated Store contract workflow to execute the new test.

## Security / isolation
- RFQ listing remains authenticated.
- Repository query remains customer-id scoped.
- Public projection excludes `buyer_email` and `buyer_phone`.
- No B2B production runtime or main branch changes.

## Validation status
- Source inspection: PASS
- Backend reuse: PASS
- Customer ownership boundary: PASS by source/contract inspection
- UI live integration: PASS by source inspection
- Automated CI: PENDING — must be verified from the resulting GitHub Actions run; no run is claimed here.
- Cloudflare Store D1 runtime: PENDING — `STORE_DB` infrastructure mapping remains unresolved.
- Browser/E2E: PENDING
- Real customer RFQ runtime verification: PENDING

## Gate
Stage 14-M is code-complete on `feat/store-admin-stage12`, but it is not production-ready until CI, Store D1 binding, and browser/runtime checks are actually verified.
