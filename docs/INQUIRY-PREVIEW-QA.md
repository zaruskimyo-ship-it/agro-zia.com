# Agro-Zia Inquiry Preview QA Gate

Target branch: `preview/inquiry-chain-qa`

## Required execution chain

1. GET `/inquiry.html` returns the release candidate Inquiry page.
2. Browser loads `locales/language-selector.js` without errors.
3. Submit with valid product + contact data sends `POST /api/inquiries`.
4. Worker validates the request.
5. Worker returns HTTP 201 JSON containing `ok`, `request_number`, `created_at`, and status.
6. Browser renders the Request Reference and date/time before any email action.
7. Email is optional and must not control the success UI.
8. WhatsApp CTA remains available.
9. `/api/health` returns `ok: true`.
10. Missing product/contact and invalid email produce visible error states without navigation.
11. D1 absence does not prevent a temporary Request Reference.
12. No legacy `mailto` submit handler or Worker-side HTML rewriting participates in the submission path.

## Release gate

No production deployment until the complete chain is verified on Preview and owner approves.
