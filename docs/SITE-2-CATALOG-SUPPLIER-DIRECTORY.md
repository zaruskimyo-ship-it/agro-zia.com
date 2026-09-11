# SITE-2 — Product Catalog, Product Detail & Supplier Directory

## Objective
Build the commercial discovery layer of the comprehensive AGRO-ZIA / ZARUS platform without changing `main`.

## User journey
`ZARUS → Categories/Search → Product Detail → Supplier → RFQ → Quote → Negotiation → Order`

## Catalog
- Published-product-only discovery
- Search by product name, brand and short description
- Category navigation
- Pagination
- Availability and lead-time visibility
- MOQ and unit visibility
- Origin country
- Incoterms where supplied
- Price visibility according to `price_visibility`
- Verification/trust indicator only from stored verification level
- Responsive mobile-first cards

The existing public product API supports published-product listing, bounded search/pagination and product-by-slug lookup. Product retrieval must remain published-only. fileciteturn123file0turn124file0

## Product Detail
1. Product identity: name, brand, origin and category
2. Commercial facts: MOQ, unit, availability, lead time
3. Price state: exact price, range, or `Request quotation`
4. Technical information: description, specifications, packaging and application
5. Supplier section: canonical supplier identity and trust level
6. Primary CTA: `Request quotation`
7. Related products
8. Stable SEO URL using product slug

### Data safety
- Never expose unpublished products.
- Never fabricate supplier verification.
- Never expose internal fields or buyer PII.
- Do not treat a free-text quotation amount as a calculated unit price unless quantity semantics are explicitly defined.

## Supplier Directory
### Public supplier card
- Supplier name
- Country / operating market
- Trust level
- Product categories/products
- Short profile
- `View supplier` CTA
- `Request quotation` CTA when a product is selected

### Supplier profile
- Company identity
- Description
- Markets served
- Product portfolio
- Trust/verification status
- Platform-routed contact CTA
- No public credentials, private contacts or internal review data

## Initial category taxonomy
- Fertilizers & Plant Nutrition
- Agricultural Inputs
- Agricultural Products
- Greenhouse & Controlled Environment
- Irrigation & Water Management
- Agricultural Machinery & Equipment
- Engineering & Technical Services
- Sourcing & International Trade Services

Use stable category IDs/slugs; UI labels remain localizable.

## UX
- Mobile-first
- Search prominent above the fold
- Clear distinction between commercial and informational CTAs
- No fake inventory or fabricated pricing
- RTL support for Persian/Arabic; localized UX for EN/RU/UZ/TR
- No dead-end commercial buttons

## SEO
Public catalog/detail pages should provide unique title/meta, canonical URL, Open Graph metadata, and structured data only for verified facts. Private account/admin/order surfaces must be `noindex`.

## QA gates
Code: preserve Commerce-1..5 contracts.
Security: published-only filtering; no private supplier/customer fields; retain input bounds.
Runtime: search, pagination, valid product detail, 404 for missing/unpublished slug, empty results, invalid pagination, mobile rendering.
Release: Draft PR only; Cloudflare Preview required before PASS; `main` and Production untouched.
