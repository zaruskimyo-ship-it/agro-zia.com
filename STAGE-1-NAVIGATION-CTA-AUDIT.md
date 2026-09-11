# Stage 1 — Navigation & CTA Audit

Status: Audit-only checkpoint. No production or main changes.

Scope: verify public navigation, primary commercial CTAs, and customer/supplier workspace entry points before making routing changes.

Freeze point: 8ac8894f89af6dbf4330ee10adedcc9f29e4742dd

Initial findings:
- Public AGRO-ZIA navigation is implemented through page markup plus assets/site-foundation.js and floating navigation.
- ZARUS marketplace currently sends Request for Quote / Start an RFQ to the legacy inquiry.html path.
- Customer Workspace expects zarus-rfq.html for authenticated Commerce RFQs.
- This is a known integration boundary and must not be changed until Commerce E2E is proven.
- Private workspaces are noindex/nofollow; public pages remain indexable.

No routing or CTA behavior is changed by this audit checkpoint.
