# Agro-Zia Store — Stage 5 Validation

## Scope

Stage 5 establishes an independent Customer Identity boundary for `agrozia.ir`.

## Implemented

- Customer contract and input validation.
- Customer persistence in the Store D1 only.
- PBKDF2-SHA-256 password hashing with a random salt.
- Opaque random session tokens.
- SHA-256 session-token hashes stored in D1; raw tokens are not persisted.
- 30-day customer session cookie: `agz_customer_session`.
- Login, logout, registration, and current-session endpoints.
- Customer role constrained to `customer`.

## Isolation invariants

- Customer authentication uses `STORE_DB` only.
- Customer authentication does not use `AGROZIA_DB`.
- Customer authentication does not use `AGROZIA_ATTACHMENTS`.
- Customer authentication does not use `agz_admin_session`.
- No production customer data has been copied from `agrozia-db11`.

## API contract

- `POST /api/customer/register` — create customer and establish session.
- `POST /api/customer/login` — authenticate customer and establish session.
- `POST /api/customer/logout` — revoke current session and clear cookie.
- `GET /api/customer/session` — return authenticated customer or 401.

## Validation status

Repository-level contract checks are included under `agrozia-store/tests/`.

Cloudflare runtime validation remains pending because the new Store D1 has not yet been provisioned through Cloudflare/Wrangler.

Final Stage 5 PASS requires, on the non-production Store Preview:

1. Apply migrations `0001_foundation.sql`, `0002_customers.sql`, and `0003_customer_sessions.sql`.
2. Register a test customer.
3. Confirm a session cookie is issued.
4. Confirm login succeeds with the correct password.
5. Confirm login fails with an incorrect password.
6. Confirm `/api/customer/session` returns the authenticated customer.
7. Confirm logout revokes the session.
8. Confirm `/api/customer/session` returns 401 after logout.
9. Confirm duplicate email registration is rejected.
10. Confirm no existing production D1/R2 resource is referenced.

## Safety gate

Stage 5 does not authorize any merge to `main`, production deployment, modification of `agro-zia-com`, modification of `agrozia-db11`, or modification of the existing production R2 bucket.
