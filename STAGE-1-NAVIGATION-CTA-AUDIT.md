# Stage 1 — Navigation & CTA Audit

Audit checkpoint for Stage 1.

Freeze baseline: 8ac8894f89af6dbf4330ee10adedcc9f29e4742dd

Findings:
- Public navigation is implemented through page markup plus site-foundation.js and floating navigation.
- ZARUS marketplace Request for Quote / Start an RFQ currently uses the proven legacy inquiry.html path.
- Customer Workspace points to zarus-rfq.html for Commerce RFQs.
- This integration boundary must remain unchanged until Commerce E2E is proven.
- Private workspaces are noindex/nofollow; public pages are indexable.

This stage is audit-first; no production or main changes.
