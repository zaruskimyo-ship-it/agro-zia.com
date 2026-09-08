# AGZ Internal Worker Auth Gate Contract

## Purpose
Provide a temporary production-oriented authentication path for the private Agro-Zia Admin surface without requiring Cloudflare Zero Trust activation.

## Scope
Read-only Admin access only. No status mutation, delete, attachment download, or other write operation.

## Boundary
Public:
- `POST /api/inquiries`
- public site and multilingual inquiry pages

Private:
- `/admin/*`
- `/api/admin/*`

Every private API request MUST be authorized server-side by the Worker. A hidden URL or client-side check is never a security boundary.

## Authentication model
Use an Admin password supplied only through the deployment secret `ADMIN_PASSWORD` and never committed to GitHub. Successful login creates a cryptographically random, time-limited session token represented by an `HttpOnly; Secure; SameSite=Strict` cookie.

The session token MUST be integrity-protected with a separate deployment secret `ADMIN_SESSION_SECRET` using Web Crypto HMAC-SHA-256. Do not use `Math.random()` or predictable identifiers.

Recommended session properties:
- 8-hour maximum lifetime
- random nonce of at least 32 bytes
- server-side HMAC integrity protection
- explicit logout that expires the cookie
- no password in cookies, URLs, logs, HTML, or API responses

## Endpoints
- `POST /api/admin/login` — accepts password over HTTPS; returns generic success/failure and sets session cookie.
- `POST /api/admin/logout` — expires the session cookie.
- `GET /api/admin/session` — returns only `{authenticated:true}` or `{authenticated:false}`.
- `GET /api/admin/inquiries` — requires valid session.
- `GET /api/admin/inquiries/:reference` — requires valid session.

## Failure behavior
- Missing/invalid session on private API: `401`.
- Authenticated but unauthorized: `403` if an authorization layer is introduced later.
- Invalid login: generic `401` with no indication whether the account/configuration exists.
- Authentication configuration absent: fail closed; private API MUST NOT expose Inquiry data.
- Private responses: `Cache-Control: no-store`.

## Abuse controls
Login must include bounded input length and a conservative rate-limit mechanism. The implementation must not create an unbounded D1 write path merely for failed login attempts. If a durable rate-limit store is unavailable, use a bounded per-request/per-IP defense and document its limitations rather than pretending it is a complete distributed rate limiter.

## Data protection
- Never return R2 object bytes or R2 object keys from unauthenticated endpoints.
- Never log passwords, session tokens, cookies, JWTs, Telegram secrets, or Inquiry contents.
- Do not expose authentication secrets to client JavaScript.
- Do not cache private responses.

## Release gate
This contract does not authorize Production deployment. Implementation and runtime verification remain on the feature branch until Preview QA passes and the user explicitly approves release.

## Relationship to Cloudflare Access
Cloudflare Access remains the preferred long-term edge authentication layer. This internal Worker gate is an independent fallback and can later be retained as defense-in-depth behind Access.
