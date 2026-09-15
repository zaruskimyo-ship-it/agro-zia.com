# Agro-Zia Store — Stage 4 Validation

## Scope

This document records the repository-side acceptance boundary for Stage 4 of the independent `agrozia.ir` store.

## Isolation invariants

- Store Worker name: `agrozia-store`
- Store D1 binding: `STORE_DB`
- Store D1 database name: `agrozia-store-db`
- Store R2 binding: `STORE_ATTACHMENTS`
- Store R2 bucket: `agrozia-store-attachments`
- Existing `AGROZIA_DB` binding must not be used by Store runtime.
- Existing `AGROZIA_ATTACHMENTS` binding must not be used by Store runtime.
- Existing `agrozia-db11` must not be attached to Store.
- Existing production R2 bucket must not be attached to Store.
- Existing `agz_admin_session` must not be used as Customer authentication.

## Foundation runtime checks

`GET /health` must return JSON containing:

- `ok: true`
- `service: "agrozia-store"`
- `environment: "foundation"`
- `database: "ok"` after the new D1 is provisioned and migration `0001_foundation.sql` is applied.

Until a real Store D1 is provisioned, `database: "unavailable"` is an expected non-production state and is not a Stage 4 final PASS.

## Migration check

Migration `0001_foundation.sql` creates only the Store foundation marker table and deliberately does not create Commerce or Customer tables. Those belong to later stages.

## Cloudflare provisioning gate

The following actions remain intentionally pending until Cloudflare access is available:

1. Create the new D1 database `agrozia-store-db`.
2. Replace the Wrangler placeholder with the newly issued D1 database ID.
3. Create the new R2 bucket `agrozia-store-attachments`.
4. Apply migration `0001_foundation.sql` to the new D1.
5. Deploy `agrozia-store` to a non-production Preview/Workers URL.
6. Execute `/health` against that Preview.
7. Only after Preview acceptance, consider attaching `agrozia.ir`.

## Safety rule

No Stage 4 validation step authorizes a merge to `main`, modification of `agro-zia-com`, modification of `agrozia-db11`, modification of the existing R2 bucket, or connection of `agrozia.ir` to the existing production Worker.
