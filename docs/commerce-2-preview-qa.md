# Commerce-2 RFQ — Preview QA Gate

Status: PENDING — requires execution against an actual Preview/runtime environment.

Branch: `feat/commerce-2-rfq`
PR: #61 (Draft, unmerged)
Production migration/deployment: **NOT performed**

## Release rule

No merge to `main`, Production deployment, or Production D1 migration is permitted until every runtime gate below is verified and explicitly approved.

## A. Service / route smoke tests

- [ ] `GET /api/health` returns expected service health and D1 binding state.
- [ ] `POST /api/rfqs` is reachable on Preview.
- [ ] Existing `GET /api/products` remains reachable.
- [ ] Existing `POST /api/inquiries` remains reachable.

## B. Positive RFQ flow

- [ ] Valid JSON RFQ returns HTTP `201`.
- [ ] Response contains a server-generated `request_number` matching `AGZ-RFQ-*`.
- [ ] Initial status is always `submitted`.
- [ ] If `product_id` is supplied, only a published product is accepted.
- [ ] Stored/returned product name is canonical D1 product name, not a client-controlled replacement.
- [ ] RFQ row is actually persisted in Preview D1.
- [ ] `sample_required` and `attachment_count` preserve validated values.

## C. Negative / abuse tests

- [ ] GET/wrong method returns `405`.
- [ ] Non-JSON content type returns `415 unsupported_media_type`.
- [ ] Malformed JSON returns `400 invalid_json`.
- [ ] Invalid RFQ payload returns `400 invalid_rfq`.
- [ ] Payload over 32 KiB returns `413 payload_too_large`.
- [ ] Missing/unavailable D1 fails closed with `503`.
- [ ] Nonexistent, draft, or archived `product_id` returns `400 invalid_rfq`.
- [ ] Client-supplied `request_number` cannot control persisted identity.
- [ ] Client-supplied `status` cannot set an initial privileged workflow state.

## D. Data exposure / isolation

- [ ] Public RFQ response contains no buyer company/name/email/phone.
- [ ] Public RFQ route does not expose R2, Email, or admin authentication bindings.
- [ ] Internal error details are not returned to the public client.
- [ ] Response uses `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.

## E. Regression

- [ ] Public product list still returns only published products.
- [ ] Public product detail still returns only published products.
- [ ] Product public contract does not expose `supplier_id`.
- [ ] Existing inquiry submission remains functional and unchanged in its public contract.
- [ ] No unrelated Worker route regression observed.

## F. Release integrity

- [ ] Preview build succeeds.
- [ ] Preview runtime tests succeed.
- [ ] Preview D1 migration `0004_commerce_rfqs.sql` succeeds.
- [ ] No Production D1 migration was executed during Preview testing.
- [ ] `main` remains unchanged at baseline `17d757750c7959597d79e4b1c8f76ad0424d501e`.
- [ ] PR #61 remains Draft/unmerged until explicit release approval.

## Current evidence state

Static contract/security and Node/mock-D1 test harnesses are committed, but their execution and Cloudflare Preview execution are still pending. This document is a release checklist, not a PASS declaration.
