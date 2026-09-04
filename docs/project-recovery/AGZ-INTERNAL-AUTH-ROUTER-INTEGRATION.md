# AGZ Internal Auth — Worker Router Integration Gate

## Status
Prepared on `feat/stage-12-auth-internal`; runtime router integration is intentionally blocked until the exact `_worker.js` dispatch tail can be inspected safely.

## Required private routes
- `POST /api/admin/login` → `adminLogin`
- `POST /api/admin/logout` → `adminLogout`
- `GET /api/admin/session` → `adminSession`
- `GET /api/admin/inquiries` → `adminListInquiries`
- `GET /api/admin/inquiries/:reference` → `adminGetInquiry`

## Security invariant
All `/api/admin/*` routes must dispatch to the authenticated handlers before any D1 Inquiry data is read. No static `/admin` page check is a substitute for server-side authorization.

## Public regression invariant
`POST /api/inquiries` must remain unchanged and unauthenticated. Telegram/R2/Email Inquiry processing must not be bypassed or replaced by Admin routing.

## Safe integration procedure
1. Obtain the complete current `_worker.js` router/dispatch section.
2. Add imports for the five Admin handlers.
3. Add exact path/method dispatch before generic asset fallback.
4. Preserve existing `/api/inquiries` handling and all Telegram/R2/Email logic byte-for-byte outside the intended dispatch addition.
5. Run source contract checks.
6. Deploy only the feature branch to Preview.
7. Execute the internal-auth QA matrix before any release decision.

## Explicit non-action
Do not reconstruct or overwrite the Worker tail from a truncated API response. Do not merge to `main` or deploy Production from this gate.
