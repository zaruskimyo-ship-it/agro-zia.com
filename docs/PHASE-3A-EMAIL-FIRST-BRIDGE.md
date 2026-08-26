# Agro-Zia Phase 3A — Email-First Commercial Bridge

## Purpose

Provide an operational fallback for B2B inquiries while the Cloudflare D1 binding is unavailable. This bridge does not replace the planned D1 request-tracking architecture.

## Current flow

Buyer → `/inquiry.html` → prepared email inquiry / WhatsApp → Agro-Zia team review.

## Rules

- Do not invent or display an authoritative `AGZ-YYYY-000001` request number on the client.
- Do not claim that an inquiry has been stored server-side when it has not.
- Do not expose private customer information in URLs or browser storage.
- Keep the existing quote-based commercial model: no fabricated public pricing or inventory.
- Preserve all six supported languages and RTL behavior.
- Preserve the existing WhatsApp and email paths.

## Transition to Phase 3

When D1 binding is available, the Worker API becomes the authoritative intake path:

Buyer → `/inquiry.html` → Worker API → D1 → server-generated AGZ request number → confirmation → tracking.

The email-first bridge can remain as a controlled fallback for delivery failures, but it must not create competing request numbers or duplicate authoritative records.

## Release gate

No Production database behavior is activated by this bridge. D1/API activation remains subject to Preview QA and owner approval.
