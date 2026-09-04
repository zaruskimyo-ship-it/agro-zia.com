# AGRO-ZIA — PROJECT RECOVERY MASTER

**Purpose:** Canonical recovery point for continuing Agro-Zia development across new ChatGPT conversations without relying on chat-window continuity.

**Created:** 2026-09-04
**Recovery status:** ACTIVE
**Current development line:** `feat/telegram-11-attachment-backend`
**Recovery branch:** `chore/agz-project-recovery-system`

## 1. Recovery Protocol

At the start of a new chat, use this phrase:

> **Agro-Zia Recovery — فایل AGZ Project Recovery Master را بازیابی و Baseline فعلی پروژه را مبنا قرار بده و از آخرین Stage ادامه بده.**

The assistant should first retrieve this document from the Agro-Zia GitHub repository and use it as the project source of truth before proposing or performing development work.

A GitHub document/link is a stable recovery anchor; it does **not** itself restore ChatGPT's private/internal memory. The recovery process therefore explicitly requires reading this file first.

## 2. Repository

- Repository: `zaruskimyo-ship-it/agro-zia.com`
- Domain: `agro-zia.com`
- Stable main baseline: `7472d54b2cd8251d7225401dc4e43f608fa70e6c`
- Current development branch: `feat/telegram-11-attachment-backend`
- Telegram stable baseline branch: `stable/telegram-1-10`
- Telegram stage branch: `feat/telegram-rebuild-stage1-clean`
- Telegram-11 UI/backend work must remain off `main` until explicitly approved.

## 3. Non-Negotiable Release Rules

1. `main` is the protected/stable baseline.
2. Do not merge, promote, or deploy to Production from development work until Preview testing is complete and the user explicitly approves Production release.
3. Never claim a test, deployment, Preview result, Cloudflare result, or commit operation was performed unless it was actually verified through available tooling or user-provided evidence.
4. Secrets must never be exposed in source, commits, screenshots, or logs.
5. After every 5 completed stages, produce a comprehensive project report and update this Recovery Master.
6. Before starting a new stage after context loss, read this Recovery Master first.

## 4. Cloudflare Architecture

- Worker entrypoint: `_worker.js`
- D1 binding: `AGROZIA_DB`
- D1 database: `agrozia-db11`
- D1 database ID: `e81f6625-99f4-4d52-a5a4-780cd82f4977`
- R2 binding: `AGROZIA_ATTACHMENTS`
- R2 bucket: `agrozia-attachments`
- Email remote binding: `EMAIL`
- Assets binding: `ASSETS`
- Compatibility date: `2026-08-27`
- Worker-first routes include `/api/*`, `/multilingual-preview`, and `/multilingual-preview.html`

### Telegram secrets
- `TELEGRAM_BOT_TOKEN_V2`
- `TELEGRAM_CHAT_ID_V2`

These values are secrets and must not be copied into this document or any source file.

## 5. Telegram Stage Status

| Stage | Result | Notes |
|---|---|---|
| Telegram-1 | PASS | Clean isolated rebuild branch |
| Telegram-2 | PASS | Telegram Bot `getMe` verified |
| Telegram-3 | PASS | Destination Chat ID identified and stored securely |
| Telegram-4 | PASS | Worker/API → Telegram `sendMessage` succeeded |
| Telegram-5 | PASS | Real Business Inquiry → Telegram confirmed |
| Telegram-6 | PASS | R2 → Blob/File → FormData → Telegram `sendDocument` confirmed |
| Telegram-7 | PASS | Preview multilingual/contact flow confirmed by user |
| Telegram-8 | PASS | Real inquiry `AGZ-2026-000028` including attachment completed end-to-end |
| Telegram-9 | PASS | Security/stability review completed |
| Telegram-10 | PASS | Final approval/merge-readiness review; no Production promotion |
| Telegram-11 | PASS for current agreed scope | Attachment formats, 1 MiB validation, R2/Email/Telegram flow and live matrix completed; exact boundary micro-tests treated as non-blocking by user |

## 6. Telegram-11 Attachment Contract

Supported documents:
- PDF
- DOC
- DOCX
- TXT

Supported images:
- JPG/JPEG
- PNG
- WEBP

Maximum attachment size:
- `1024 * 1024` bytes = `1,048,576` bytes (1 MiB)

Backend and frontend both validate file type/extension and size.

R2 object key pattern is request-scoped:
`inquiries/{requestNumber}/{uuid}-{safeName}`

### Notification architecture
- **Email:** text only. Do not attach the uploaded file to email.
- Email text explicitly states that an attachment was supplied/sent separately through Telegram.
- **Telegram:** sends the actual uploaded file using `sendDocument`.
- Email/Telegram notification failure must not roll back a persisted inquiry.

## 7. Telegram-11 Live QA Matrix

Confirmed by user:
- PDF — PASS
- DOC — PASS
- DOCX — PASS
- TXT — PASS
- PNG — PASS
- JPG — PASS
- JPEG — PASS
- WEBP — PASS
- No attachment — PASS
- Invalid file — correctly rejected
- 1.5 MB test — correctly rejected
- 1,025,590-byte JPG — correctly accepted because it is below 1,048,576 bytes

The user explicitly decided that micro-tests around an arbitrary boundary differing by approximately 1 KB are not materially important and should not block progress. Treat these as DONE / NON-BLOCKING unless a later security or contract issue requires reopening them.

## 8. Important Real E2E Evidence

`AGZ-2026-000028` was a real successful multilingual inquiry with a JPEG attachment. The user confirmed the full Telegram delivery flow.

`AGZ-2026-000040` — JPEG email received and Telegram file received.

`AGZ-2026-000041` — JPG Telegram delivery succeeded; Email arrived later with delay. Duplicate email evidence was observed. Final status: PASS, with delivery delay noted.

`AGZ-2026-000042` — WEBP attachment; Email received and Telegram attachment received.

`AGZ-2026-000043` — no attachment; Email received and Telegram text received.

`AGZ-2026-000044` — 1,025,590-byte JPG; Email received and Telegram attachment received.

## 9. Current Important Code/Configuration State

Worker attachment constants include:
- allowed MIME types for PDF, DOC, DOCX, TXT, JPEG/JPG, PNG, WEBP
- extension validation for `.pdf`, `.doc`, `.docx`, `.txt`, `.jpg`, `.jpeg`, `.png`, `.webp`
- maximum `1,048,576` bytes

Current Email routing:
- To: `agrozia1@gmail.com`
- From: `export@agro-zia.com`
- Email contains text only; attachment is sent separately through Telegram.

Frontend inquiry input supports the same attachment family and a 1 MiB limit.

## 10. Important Commits

- Main baseline: `7472d54b2cd8251d7225401dc4e43f608fa70e6c`
- Telegram-1 basis: `2bb4309a80ead51e1c76bea0cdc305a094adbf98`
- Email destination fix: `d12cede98a6555b7ec9d60cf557dc6a5278f9d50`
- Wrangler Email remote-binding cleanup: `4967d555e3072201f074f8a94b350301ebbd98e5`
- Inquiry UX: `a805fdc543ede44ddbdf4b6675d40c3dff5117b9`
- Multilingual root inquiry fix: `5f8fb2527d1293c4899c7fa8acc01263853e429c`
- Diagnostic email UI: `0e4d81eaa7147cbc44dd0d6bb04b71e46f16c854`
- Attachment stage UI: `f0753d4f03fae2af8b485d7af052eb7b952a2f6e`
- Language selector: `9b2cfdb1afab88f1b685590183e6191914ca7d57`
- Standalone preview JS fix: `7a0ac204b2376943eb6ed9a0714ffeb9d966006f`
- Current Telegram-11 backend branch HEAD at the time of this recovery point: `2bb4309a80ead51e1c76bea0cdc305a094adbf98` is the known Telegram-11 branch base reference; verify the actual current branch HEAD through GitHub before making subsequent claims.

## 11. Admin Dashboard Status

An Admin Dashboard/read-only inquiry management concept exists, but its runtime state and authentication configuration must be verified before Stage 12 is declared complete.

Known prior Preview error:
`admin_auth_unconfigured`

Do not assume Admin Dashboard authentication is production-ready without a fresh verification.

## 12. QA / Automation

Existing QA scripts include:
- `scripts/stage1-smoke.mjs`
- `scripts/telegram-11-attachment-contract.mjs`

The Telegram-11 contract script is a static source-contract test. Do not claim it was executed unless an execution result is available.

## 13. Next Roadmap

After Recovery Gate is established:

### Stage 12 — Admin Dashboard + Authentication + Security
Verify and complete the private read-only inquiry dashboard, authentication, access control, and secure error handling.

### Stage 13 — Inquiry Management / Lead Workflow
Search, filtering, status workflow, inquiry details, operational notes, and safe management actions as appropriate.

### Stage 14 — Notification Reliability
Improve Email/Telegram observability, delivery status, retry/idempotency strategy, and delayed-delivery handling without exposing secrets.

### Stage 15 — Multilingual + Mobile QA
Full language, responsive/mobile, accessibility, form, and cross-browser review.

### Stage 16 — SEO + Commercial Conversion
Metadata, indexing controls, structured content, commercial CTA, product/inquiry conversion flow, and international B2B presentation.

### Stage 17 — Final Security + Production QA
End-to-end security, data handling, secrets, performance, failure modes, production checklist, and final Preview sign-off.

Only after these gates and explicit user approval should Production/main promotion be considered.

## 14. Recovery Procedure for a New Chat

1. Identify the repository `zaruskimyo-ship-it/agro-zia.com`.
2. Retrieve `docs/project-recovery/AGZ-PROJECT-RECOVERY-MASTER.md` from the latest approved recovery ref/branch.
3. Verify the current branch HEAD and compare it with `main` before proposing changes.
4. Keep `main` untouched.
5. Check the last completed Stage and its evidence.
6. Continue from the next incomplete Stage.
7. If the user has explicitly changed a requirement, update the Recovery Master first, then implement.
8. After every five stages, update the Recovery Master and provide a comprehensive report.

## 15. Current Recovery Gate

**RECOVERY SYSTEM: ESTABLISHED ON BRANCH `chore/agz-project-recovery-system`.**

This branch was created from `feat/telegram-11-attachment-backend` so the recovery point is anchored to the current development line without modifying `main`.

Before Stage 12 implementation, verify this recovery file and, if desired, merge/cherry-pick the recovery documentation into the active development branch. Do not merge anything into `main` without explicit Production approval.

## 16. Important Principle

This file is the project's operational memory. When chat context is interrupted, recover from this document rather than reconstructing the project from assumptions.
