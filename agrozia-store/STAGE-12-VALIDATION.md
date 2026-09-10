# Stage 12 — Store Admin Validation

Branch: `feat/store-admin`

## Scope

Independent administrative control plane for `agrozia.ir` using only `STORE_DB` and a separate Store Admin session cookie.

## Implemented

- separate `store_admin_sessions` table
- separate cookie: `agz_store_admin_session`
- separate secrets: `STORE_ADMIN_PASSWORD` and `STORE_ADMIN_SESSION_SECRET`
- 8-hour admin sessions
- `SameSite=Strict`, `HttpOnly`, `Secure` session cookie
- Origin validation for state-changing admin requests
- product/category/supplier management endpoints
- RFQ review/status and supplier matching endpoints
- quote listing/creation/status endpoints
- B2B order listing/status endpoints
- customer read-only listing
- Store Admin summary endpoint
- no reuse of legacy `agz_admin_session`
- no access to legacy `agrozia-db11` / `AGROZIA_DB`

## Important safety gate

The first implementation of the Store Admin quote-create endpoint is **not yet approved for runtime use**. Its monetary calculation must be hardened to compute `quantity × unit_price + fees` deterministically before Stage 12 can be marked PASS. This is intentionally recorded as a blocker rather than silently treating the endpoint as production-safe.

## Runtime gate

Cloudflare provisioning, migration execution, Worker Preview deployment, admin login, authorization, and end-to-end CRUD tests remain pending.

`main` and existing `agro-zia.com` Production are not modified by this stage.
