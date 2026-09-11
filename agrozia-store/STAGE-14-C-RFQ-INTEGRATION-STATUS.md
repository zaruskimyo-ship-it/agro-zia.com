# Stage 14-C — RFQ UI → Live RFQ API

## Scope

Connect the Agro-Zia Store RFQ page to the existing authenticated customer RFQ API without changing the main B2B runtime, production, or customer/session architecture.

## Implemented

- Added `src/site/rfq-live-response.js` as an independent live RFQ UI response.
- `/rfq` now loads published products from `/api/products`.
- RFQ form collects the fields already supported by `normalizeRfq()`.
- Review is held client-side in session storage before submission.
- Submission uses `POST /api/rfqs` with same-origin customer session credentials.
- HTTP 401 is shown as a customer sign-in requirement.
- API errors do not create or display a fabricated RFQ confirmation.
- Successful confirmation uses the `request_number` returned by the API.
- Existing `handleStoreRfqs`, `createRfq`, customer ownership scoping, and published-product validation remain unchanged.
- Worker route `/rfq` now serves the live RFQ response.
- Added `tests/rfq-live-integration.test.js` for API wiring, authentication boundary, review/validation/error states, and no-fake-confirmation behavior.

## Gate status

| Gate | Status | Evidence |
|---|---|---|
| RFQ UI integration code | PASS | `rfq-live-response.js` |
| Existing RFQ API preserved | PASS | `rfq-api.js` unchanged in this stage |
| Customer authentication boundary | PASS (code) | `getCustomerFromSession` + same-origin credentials |
| Customer ownership isolation | PASS (code) | `listCustomerRfqs(..., customer.id)` and create with authenticated customer |
| Published product validation | PASS (code) | existing `createRfq()` validation retained |
| Automated CI | PENDING | Workflow result must be verified after GitHub Actions executes |
| Cloudflare Store runtime / D1 | PENDING | No runtime deployment performed |
| Browser / E2E | PENDING | No live browser session executed |
| Real customer RFQ submission | PENDING | Requires Store Preview + authenticated customer + real Store D1 |
| Production / main | UNCHANGED | No merge or Production deployment performed |

## Important limitation

The attachment field remains intentionally non-uploading in this stage. The existing RFQ API accepts `attachment_count`, but binary attachment persistence is not introduced here. Attachment persistence should be handled as a separate controlled stage so that the existing Store R2 boundary is not changed implicitly.

## Next stage

Stage 14-D — Quotes / Supplier Matches UI → live APIs, preserving the chain:

`Customer → RFQ → Supplier Match → Accepted Quote → B2B Order`
