# Agro-Zia — Stage 1 Final QA Gate

## Baseline
- Multilingual Inquiry UX baseline: `bf2f0160` / commit `6d5dd557`
- D1 fail-closed hardening: `5d033a0`
- Production/main must remain unchanged until Stage 1 is explicitly approved.

## Release gates
- [ ] Preview loads successfully
- [ ] `/api/health` reports D1 binding
- [ ] Valid inquiry returns HTTP 201
- [ ] Inquiry is persisted in D1
- [ ] Server-generated request reference is returned
- [ ] Missing product/category is rejected
- [ ] Missing email and phone are rejected
- [ ] Invalid email is rejected
- [ ] Field length limits are enforced
- [ ] EN / RU / FA / AR / UZ / TR submit through the same API
- [ ] Successful result offers reference copy and optional email draft
- [ ] No static-release/mailto-only notice remains
- [ ] Production traffic remains unchanged

## Release rule
Stage 1 is PASS only after the Preview candidate has been manually verified end-to-end. No production promotion is authorized by this document.
