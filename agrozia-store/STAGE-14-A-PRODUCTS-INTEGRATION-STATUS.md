# Stage 14-A — Products UI → Live Store Product API

## Scope
Controlled first UI-to-API integration for the Agro-Zia Store at `agrozia.ir`.

## Implemented
- Customer-facing `/products` is routed through `productsSiteResponse`.
- Customer-facing `/products/:slug` is routed through the same controlled integration.
- Existing site shell and design system are preserved.
- The Products UI now requests live data from `/api/products`.
- Product detail requests live data from `/api/products/:slug`.
- Loading, empty-catalog, unavailable-catalog and product-not-found states are explicit.
- Live product cards use published API fields and link by product `slug`, not mock numeric IDs.
- No sample catalog item is presented as confirmed live inventory after the integration script takes control.
- Store API boundary remains `/api/products` and uses the existing Store Product API.
- No main B2B inquiry/Telegram path is imported or modified.

## GitHub commits
- `5f54eca4e06d778f394d21ebe0b7d1f21b5751d6` — live Products response module
- `2a04fbd291f706e95570e6905b88f55c59a2de30` — Worker routing
- `105f6025bb888442e0e0e9424d6d301f8f778764` — integration contract tests

## Gate
- Code structure: **PASS**
- Store API boundary: **PASS**
- Customer-facing mock/live separation: **PASS**
- Main/Production protection: **PASS** — no merge or Production deployment performed
- Automated CI: **PENDING** — latest test commit currently has no associated workflow run
- Cloudflare Store runtime / D1: **PENDING**
- Browser/E2E verification: **PENDING**
- Real published product data verification: **PENDING**

## Important limitation
This stage intentionally does not claim that `agrozia.ir` is live against Cloudflare D1 yet. Runtime binding and real published catalog verification remain a later acceptance gate.

## Next
Stage 14-B — Suppliers UI → live Supplier/Match APIs, after this stage's CI/runtime gates are resolved.
