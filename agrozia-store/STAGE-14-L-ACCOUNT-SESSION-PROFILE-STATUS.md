# Stage 14-L — Account Session & Profile Integration Status

Date: 2026-09-12
Branch: `feat/store-admin-stage12`

## Scope

Connect the customer Account profile and session controls to the existing Store authentication backend without inventing unsupported profile/settings APIs.

## Evidence reviewed

- `src/auth/customer-auth.js`
- `src/auth/customer-repository.js`
- `src/site/account-site-shell.js`
- `_worker.js`

The existing authentication API already provides `GET /api/customer/session` and `POST /api/customer/logout`. The session projection contains customer name, email, phone, company, country, role and status. Password hashing/session storage remain server-side.

## Implemented

- `/account/profile` now reads the authenticated customer session through the existing API.
- Profile values are escaped before browser rendering.
- Unauthenticated profile access redirects to the existing account boundary.
- `/account/settings` now provides a real logout action using the existing POST logout endpoint.
- Account overview performs a live session check.
- No new customer write API was invented for profile/settings editing.
- Added `tests/account-profile-session-live.test.js`.
- Added the test to the existing Store Commerce Contract Tests workflow.

## Safety / isolation

- No customer schema changes.
- No password/authentication algorithm changes.
- No main B2B Worker changes.
- No Production deployment.
- No main branch merge.
- No Store D1 runtime mutation.

## Validation

- Source inspection: PASS
- Existing auth API reuse: PASS
- Session/privacy boundary: PASS by source inspection
- Automated CI: PENDING until a GitHub Actions run is observed
- Cloudflare Store D1 runtime: PENDING
- Browser/E2E: PENDING

## Explicitly deferred

Profile editing, password change, email verification management and notification preferences require dedicated backend contracts and are not inferred from the existing session API.
