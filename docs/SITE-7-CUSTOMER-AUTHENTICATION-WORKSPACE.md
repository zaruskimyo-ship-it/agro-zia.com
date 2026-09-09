# SITE-7 — Customer Authentication & Workspace

## Implemented
- Passwordless customer sign-in using a six-digit email code.
- Customer account persistence in D1.
- HMAC-signed HttpOnly Secure SameSite customer session cookie.
- Separate customer session namespace from internal admin authentication.
- Private customer workspace API for account, RFQs, quotes and orders.
- Ownership filtering by authenticated account ID, with controlled legacy email fallback for older RFQs/orders that predate account linkage.
- Worker dispatcher wired to `/api/customer/*`.
- Workspace UI consumes authenticated API data and provides sign-in/sign-out flow.

## Security boundaries
- Runtime customer session secret: `CUSTOMER_SESSION_SECRET` (minimum 32 characters). Authentication fails closed when absent.
- OTP codes are stored only as SHA-256 digests bound to the challenge ID.
- Codes expire after 10 minutes and are limited to five verification attempts.
- Existing active challenges for the same email are consumed when a new challenge is issued.
- Private API responses are `no-store`.
- Workspace/login pages are `noindex,nofollow`.
- No payment credentials, card data, or trade-protection claims are introduced here.

## Data ownership
Customer workspace queries are constrained by the authenticated account ID. For historical RFQs/orders that were created before account linkage, a normalized buyer-email fallback is used only after authentication; the email is never accepted from a URL or client-side ownership parameter.

## Preview configuration
Configure `CUSTOMER_SESSION_SECRET` on the Preview version using the version-scoped secret mechanism. Do not modify Production secrets and do not promote the version.

## QA status
Source implementation is complete on the feature branch. Cloudflare Preview/runtime remains pending. The earlier build failure caused by unavailable required admin secrets must be re-run after the configuration issue is resolved. This phase is not marked runtime PASS until a Preview build plus authenticated API/browser tests succeed.

## Release safety
`main` remains untouched. No Production deployment or merge is authorized by this stage.
