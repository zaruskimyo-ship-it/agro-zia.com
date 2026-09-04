# AGZ Internal Worker Auth — Implementation Notes

## Current status
Repository-side security primitives are prepared on `feat/stage-12-auth-internal`. The Worker router is intentionally not switched to these primitives yet because the current repository connector returned the Worker as a large generated source blob and the exact routing section must be integrated without replacing unrelated code.

## Intended endpoints
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- Existing read-only `GET /api/admin/inquiries`
- Existing read-only `GET /api/admin/inquiries/:reference`

## Security requirements
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are deployment secrets only.
- Missing auth configuration fails closed.
- Session is signed with HMAC-SHA-256.
- Session material contains a cryptographically random nonce.
- Session cookie is `Secure`, `HttpOnly`, `SameSite=Strict`, path `/`, and time-limited.
- Private API responses use `Cache-Control: no-store`.
- Public `POST /api/inquiries` remains unauthenticated.
- No R2 object bytes or R2 object keys are returned by the private read API.
- Login abuse protection must be bounded and must not depend on process-local memory as the sole control in production.

## Cloudflare note
Cloudflare Workers Web Crypto supports HMAC, SHA-256, `crypto.getRandomValues()`, and timing-safe equality operations. Cloudflare recommends storing sensitive values as Worker Secrets rather than source or ordinary variables.

## Release rule
No deployment, merge to `main`, or Production promotion is authorized until implementation integration, Preview deployment, and the full Stage 12 QA matrix are actually tested and the user explicitly approves.
