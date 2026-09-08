# Commerce-3 — Supplier Profiles

Status: implementation on feature branch; Preview/runtime verification pending.

## Scope

Public read-only supplier profiles for buyer trust. Published suppliers only. No onboarding, editing, verification workflow, ratings, payments, or Production migration.

## Public fields

- slug, name, country, years active
- public description
- product categories
- production capacity and MOQ
- export markets
- certifications
- factory capability and quality-control notes
- verification level and verification timestamp
- bounded published product summaries

## Trust model

`declared` = supplier-declared information; `agrozia_checked` = information checked by Agro-Zia; `third_party_verified` = independently verified information. The public API must never imply a higher level than stored.

## Security

GET-only; published-only; parameterized D1 queries; bounded slug/product output; no private contact details, addresses, credentials, internal notes, admin bindings, R2, or Email access; generic 503 on service errors.

## Definition of Done

1. Migration `0005_commerce_suppliers.sql` committed but not applied to Production.
2. Public contract, repository, and API implemented.
3. Worker route integration added only after exact parent Worker source is preserved.
4. Static contract/security tests executed in CI.
5. Preview QA checklist completed only against actual Cloudflare Preview.
6. `main` remains unchanged; no Production deployment or migration.
