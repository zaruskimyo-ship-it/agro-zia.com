# Agro-Zia — Stage 1 Final QA Gate

## Baseline
- Multilingual Inquiry UX baseline: `bf2f0160` / commit `6d5dd557`
- D1 fail-closed hardening: `5d033a0`
- Final QA branch: `qa/stage1-final-candidate`
- Production/main must remain unchanged until Stage 1 is explicitly approved.

## Code-level gates
- [x] Worker entrypoint is `_worker.js`
- [x] `AGROZIA_DB` targets `agrozia-db11`
- [x] `/multilingual-preview` is Worker-first
- [x] `/api/inquiries` is the canonical POST route
- [x] Successful persistence returns `persisted: true` and a server-generated `request_number`
- [x] D1 failure is fail-closed with HTTP 503
- [x] Temporary/fallback request references are removed
- [x] EN / RU / FA / AR / UZ / TR share one API path
- [x] Deterministic source-level smoke checks added at `scripts/stage1-smoke.mjs`
- [x] Legacy static mailto-only notice is rejected by the smoke test

## Live Preview gates
- [ ] Preview loads successfully
- [ ] `/api/health` reports the D1 binding (`d1_bound: true`)
- [ ] Valid inquiry returns HTTP 201
- [ ] Inquiry is persisted in D1
- [ ] Server-generated request reference is returned
- [ ] Missing product/category is rejected
- [ ] Missing email and phone are rejected
- [ ] Invalid email is rejected
- [ ] Field length limits are enforced
- [ ] EN / RU / FA / AR / UZ / TR submit successfully through the same API
- [ ] Successful result offers reference copy and optional email draft
- [ ] No static-release/mailto-only notice is visible in the live transformed Preview
- [ ] Production traffic remains unchanged

## Scope boundary
Attachment upload/storage is intentionally deferred to Stage 4 of the approved roadmap. Stage 1 is responsible for the core inquiry transaction and multilingual submission path.

## Release rule
Stage 1 is PASS only after the Preview candidate has been manually verified end-to-end. No production promotion is authorized by this document.
