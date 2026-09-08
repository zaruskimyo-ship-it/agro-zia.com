# AGZ Admin Inquiry API Contract

## Status
Stage 12-C repository-side contract. This document does **not** enable an endpoint and does not authorize access by itself.

## Security prerequisite
Both endpoints below MUST remain behind the Stage 12-B server-side authentication and authorization gate. Until that gate is live and verified, no Inquiry data endpoint should be exposed publicly.

## Endpoint 1 — Inquiry list
`GET /api/admin/inquiries`

### Query parameters
- `q` — optional search text for Reference, company, or product/interest.
- `status` — optional exact status filter.
- `page` — optional 1-based page number; default `1`.
- `page_size` — optional result count; default `20`, hard maximum `50`.

### Requirements
- Validate and normalize all query parameters.
- Reject invalid page/page_size values with a safe `400` response.
- Never perform an unbounded D1 read.
- Return only fields required for dashboard listing: reference, created date/time, company, country, product/interest, status, and attachment-present/metadata summary.
- Do not return `attachment_key`, R2 object keys, attachment bytes, access tokens, cookies, or internal secrets.
- Prefer not to expose email, phone, or message in the list response.

## Endpoint 2 — Inquiry detail
`GET /api/admin/inquiries/:reference`

### Requirements
- Require the same server-side authentication/authorization gate.
- Lookup by the exact request reference.
- Return the inquiry fields required for authorized administrative review.
- Attachment response is metadata only: filename, MIME type, size, and presence/storage status. Never return attachment bytes from this JSON endpoint.
- Do not expose R2 object keys or signed/public attachment URLs in this stage.
- Return `404` for an unknown reference without revealing database details.

## Common HTTP behavior
- Successful private responses: `Cache-Control: no-store`.
- Authentication missing: `401`.
- Authentication present but authorization fails: `403`.
- Invalid request parameters: `400`.
- Unknown inquiry: `404`.
- Unexpected server/database failure: safe `500` response with no sensitive diagnostics.
- JSON responses only; no stack traces or secret-bearing error details.

## Data exposure boundary
Browser -> authenticated admin session -> Worker authorization -> D1 read. R2 is not directly public. The admin dashboard must not attempt to bypass the Worker or construct R2 URLs itself.

## Read-only scope
Stage 12-C does not introduce status mutation, deletion, attachment download, bulk export, or other write operations.

## QA acceptance criteria
1. Unauthenticated list request is rejected.
2. Unauthorized authenticated request is rejected.
3. Authorized list request returns bounded results.
4. Search and status filter are server-side and bounded.
5. Pagination cannot exceed the hard page-size maximum.
6. Detail lookup returns the intended inquiry only.
7. Attachment metadata is visible without attachment bytes or R2 keys.
8. Private responses use `no-store`.
9. Public Inquiry submission continues to work unchanged.

## Blocking note
Live acceptance requires Cloudflare Access configuration and Preview/runtime verification. Repository-side preparation alone must not be reported as a completed production security control.
