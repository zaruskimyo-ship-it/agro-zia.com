# Commerce-1 — Product Intelligence

## Status

Design/contract stage. This branch is intentionally isolated from `main` and from Production release work.

## Goal

Turn the current Agro-Zia product presentation into structured B2B product intelligence that can later support search, RFQ, quotation, and order workflows without rebuilding the existing inquiry pipeline.

## Product model

A product record should have these logical groups:

### Identity

- `id`
- `slug`
- `name`
- `brand`
- `category_id`
- `status` (`draft`, `published`, `archived`)
- `origin_country`

### Commercial

- `moq`
- `unit`
- `availability_status`
- `lead_time`
- `price_visibility` (`hidden`, `starting_from`, `fixed`, `rfq`)
- `currency`
- `price_min`
- `price_max`
- `supply_capacity`
- `incoterms`

### Technical

- `short_description`
- `description`
- `specifications` (structured JSON, versionable)
- `packaging`
- `application`

### Trust / sourcing

- `supplier_id`
- `origin_statement`
- `verification_level` (`declared`, `agrozia_checked`, `third_party_verified`)
- `verification_updated_at`

### Media / documents

Product documents and images must be referenced by opaque storage identifiers internally and exposed through controlled application routes only. Public API responses must never expose private R2 keys.

## Category model

Categories are hierarchical:

`category -> subcategory -> product`

Category records should contain a stable slug, display name, status, and optional parent category. Category depth should remain bounded so navigation and filtering stay predictable.

## Supplier relationship

Commerce-1 references a supplier identity but does not yet implement supplier onboarding or verification. Those capabilities belong to Commerce-3.

No UI badge may claim `verified` unless an actual verification record exists.

## Product detail page contract

A published product detail page should be able to present:

1. Product identity and origin
2. Technical specifications
3. MOQ and packaging
4. Availability and lead time
5. Commercial pricing mode
6. Supplier/trust information
7. Approved documents and images
8. Primary actions: `Request Quote` and, only when explicitly orderable, `Buy/Order`

## RFQ integration boundary

Commerce-1 must not duplicate the existing inquiry creation path.

Future flow:

`Product Detail -> Request Quote -> existing Inquiry -> RFQ enrichment -> Commerce-2`

The current inquiry reference (`AGZ-YYYY-NNNNNN`) remains the stable lead/request identifier.

## Security contract

- Never expose internal storage keys, secrets, database credentials, or private supplier data.
- Validate product/category identifiers server-side.
- Use allowlisted status and price modes.
- Bound text, JSON, document count, and upload sizes.
- Treat product content as untrusted input; escape/encode before HTML rendering.
- Keep unpublished products inaccessible through public endpoints.
- Admin mutations require the existing internal authentication boundary.

## D1 migration rule

Do not change the production D1 schema in Commerce-1 until the schema has been reviewed, implemented on a dedicated migration, deployed to Preview, and validated against the existing inquiry tables.

The existing inquiry schema remains authoritative for the current lead pipeline.

## Release gates

### Code

- [x] Product contract defined
- [x] Existing inquiry pipeline preserved
- [x] Commerce branch isolated from `main`
- [ ] Runtime implementation
- [ ] Automated contract tests

### Security

- [x] Private storage identifiers excluded from public contract
- [x] Verification claims require evidence
- [ ] Runtime access-control tests
- [ ] Input/failure tests

### Runtime / QA

- [ ] Build
- [ ] Preview deployment
- [ ] Product list/detail API
- [ ] RFQ integration
- [ ] Negative tests

### Operations / Recovery

- [x] Branch created from Stage-12 HEAD `0c0ffd6`
- [x] `main` untouched
- [ ] Recovery Master update after Commerce-1..5 completion
- [ ] Release approval

## Definition of Done — Commerce-1

Commerce-1 is complete only when product data can be represented and safely published, a product detail surface can consume that data, and Preview evidence confirms public/private boundaries. Documentation alone is not a final PASS.
