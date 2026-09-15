# Stage 13 — Agro-Zia Store Core Site Shell

Target site: **agrozia.ir**

Main B2B site `agro-zia.com` is out of scope for this Store shell work.

## Current structure

- Home / global site shell
- Products / Product Detail
- Suppliers / Supplier Detail
- RFQ / RFQ Review
- Cart
- Checkout / Checkout Review / Checkout Confirmation
- Orders / Direct Sale Order Detail / B2B Order Detail

## Architecture rule

The shell is structural first. Existing Store APIs remain the backend foundation but are not yet bound to the UI. Direct Sale and B2B Quote/Order paths remain separate.

## Status

- Site shell: PASS in code
- Checkout shell: PASS in code
- Orders shell: PASS in code
- Contract tests: CREATED
- CI: PENDING until GitHub Actions produces runs for the latest commits
- Cloudflare Preview: PENDING
- Production: NOT DEPLOYED
- main: NOT MODIFIED

## Next shell layer

Customer Account, followed by Store Admin shell. After the complete shell is established, UI-to-API integration will proceed incrementally and be validated without touching the main B2B runtime.
