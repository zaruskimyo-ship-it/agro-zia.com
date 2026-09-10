# Stage 6 — Product Commerce Validation

## Scope
Independent product/category catalog for `agrozia.ir`, built on `STORE_DB` only.

## Implemented
- Product/category schema isolated in Store migration `0004_product_catalog.sql`.
- Public product contract preserves approved commerce semantics.
- Only published products are publicly readable.
- Public projection excludes `supplier_id` and other internal supplier data.
- Product list supports bounded pagination and search.
- Product detail is slug-based.
- Published categories are publicly readable.
- Store Worker routes `/api/products`, `/api/products/:slug`, and `/api/categories`.
- No cart, checkout, order, or supplier-management behavior is included in Stage 6.

## Safety invariants
- Store uses `env.STORE_DB`.
- No reference to `AGROZIA_DB` or `agrozia-db11` is permitted.
- No reference to the existing `AGROZIA_ATTACHMENTS` binding is permitted.
- No production data is copied.
- Existing `agro-zia.com` main and Production are untouched.

## Validation
- Product contract tests must pass.
- Repository diff must contain only Store Stage 6 changes plus required runtime wiring.
- Cloudflare D1 migration and Preview runtime validation remain pending until Store Cloudflare infrastructure is provisioned.
- Do not promote to main or Production from this branch during Stage 6.
