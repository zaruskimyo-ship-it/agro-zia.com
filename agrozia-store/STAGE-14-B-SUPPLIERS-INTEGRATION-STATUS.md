# Stage 14-B — Suppliers UI → Live Store Supplier API

## Scope

Connect the public `agrozia.ir` supplier directory and supplier detail pages to the Store D1 supplier repository without reusing the main B2B runtime, data, sessions or secrets.

## Implementation

- Added `src/commerce/supplier-public-repository.js`.
- Added `src/commerce/supplier-public-api.js`.
- Added `src/site/suppliers-live-response.js`.
- Wired `/api/suppliers` and `/api/suppliers/:id` through `_worker.js`.
- Wired `/suppliers` and `/suppliers/:id` to the live supplier UI.
- Public API exposes only `id`, `name`, `country`, and `status` for published suppliers.
- Draft and archived suppliers are excluded by the repository query.
- UI has loading, empty, service-unavailable and not-found states.
- Mock supplier names from the original shell are not presented as confirmed live data.
- Added supplier live integration contract tests.

## Commits

- `dd9cd700cccebc274eed7b0acbb7b3763cd8ea23` — public supplier repository
- `142e01b6ed81e49cc8485b2f08a4f4a6aed2014c` — public supplier API
- `a43bbf67532691b35244691109ac1f978d611fcd` — hardened live supplier rendering
- `9f381739345fd69dd6b1a756d66891d7ff2ed5ae` — Worker wiring
- `698c425d0cbe8e30bdc014db327ecc24ed188722` — contract tests

## Gate

- PASS — public supplier API is Store-only (`env.STORE_DB`).
- PASS — unpublished supplier records are not exposed.
- PASS — no customer/private supplier fields are returned.
- PASS — UI does not label mock suppliers as live.
- PASS — main B2B runtime remains untouched.
- PASS — no Production deployment.
- PASS — `main` is unchanged by this stage.
- PENDING — GitHub Actions execution for the latest test commit.
- PENDING — Cloudflare Store D1 runtime validation.
- PENDING — browser/E2E validation on `agrozia.ir`.
- PENDING — real published supplier records in the Store D1 database.

## Next

Stage 14-C should connect RFQ UI to the existing Store RFQ API, while preserving the Supplier Match and B2B Order invariants already implemented on the backend.
