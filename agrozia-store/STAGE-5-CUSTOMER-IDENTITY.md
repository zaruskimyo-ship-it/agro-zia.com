# Agro-Zia Store — Stage 5 Customer Identity

## Status

Repository implementation complete on `feat/store-customer-identity`.
Cloudflare provisioning and live authentication tests remain pending because Wrangler/Cloudflare management access is not currently available.

## Implemented

- Independent customer contract and validation.
- Customer registration, login, logout and session endpoints.
- PBKDF2-SHA-256 password hashing with random 16-byte salt and 310000 iterations.
- Constant-time byte comparison during password verification.
- Opaque session token stored only in the browser cookie; only SHA-256 token hash is stored in D1.
- Separate cookie name: `agz_customer_session`.
- `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` cookie attributes.
- Customer role is constrained to `customer`; no reuse of the existing Admin role/session.
- Customer sessions support expiry and revocation.

## Routes

- `POST /api/customer/register`
- `POST /api/customer/login`
- `POST /api/customer/logout`
- `GET /api/customer/session`

## New migrations

- `0002_customers.sql`
- `0003_customer_sessions.sql`

## Isolation checks

- Uses `env.STORE_DB` only.
- Does not reference `AGROZIA_DB`.
- Does not reference `AGROZIA_ATTACHMENTS`.
- Does not use `agz_admin_session`.
- No production data or credentials were copied.

## Pending live gates

1. Provision the new Store D1.
2. Apply migrations `0001` through `0003`.
3. Deploy the Store preview.
4. Test register/login/session/logout against the new D1.
5. Verify cookie flags and session revocation.
6. Only after acceptance continue to the next Store stage.

## Safety

No changes were made to repository `main`, `agro-zia.com` production Worker, existing D1, existing R2, or the `agrozia.ir` DNS connection.
