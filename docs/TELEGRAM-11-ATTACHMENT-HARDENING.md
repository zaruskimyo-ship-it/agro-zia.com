# Telegram-11 — Attachment Hardening Contract

Status: **IN PROGRESS**

Branch: `feat/telegram-11-attachment-hardening`

Baseline: Telegram-10 (`2bb4309a80ead51e1c76bea0cdc305a094adbf98`)

## Scope

Telegram-11 hardens the Business Inquiry attachment pipeline without changing `main`.

### Accepted attachments

Documents:
- PDF — `application/pdf`
- DOC — `application/msword`
- DOCX — `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- TXT — `text/plain`

Images:
- JPG/JPEG — `image/jpeg`, `image/jpg`
- PNG — `image/png`
- WEBP — `image/webp`

Maximum size remains **1 MiB (1,048,576 bytes)**.

## Required validation rule

The Worker must validate both MIME type and filename extension. A filename alone must not be sufficient to bypass an unsupported MIME type when a trustworthy browser/server MIME type is available. The implementation should use a normalized extension/MIME allowlist and reject unsupported files with a stable `attachment_invalid_type` response.

Oversized files must return `attachment_too_large` with `max_bytes: 1048576`.

## Delivery contract

For an accepted attachment:

1. Persist the original file bytes to R2 under the inquiry request number.
2. Persist attachment metadata in D1.
3. Email notification must retrieve the same R2 object and attach it with the original safe filename and MIME type.
4. Telegram notification must retrieve the same R2 object and send it with `sendDocument`.
5. The Telegram caption must contain the inquiry reference and attachment metadata, without exposing secrets.
6. Email/Telegram notification failure must not roll back a successfully persisted inquiry.
7. If D1 persistence fails after R2 upload, the R2 object must be deleted.

## Security requirements

- Never log `TELEGRAM_BOT_TOKEN_V2` or `TELEGRAM_CHAT_ID_V2`.
- Keep the 1 MiB server-side limit; frontend `accept` is only a UX aid.
- Sanitize attachment filenames before using them in R2 keys or content-disposition metadata.
- Do not trust client-supplied MIME type as proof of file content.
- Keep request-number collision retry behavior.

## Required Preview matrix before Production approval

| Test | Expected |
|---|---|
| PDF <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| JPG/JPEG <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| PNG <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| WEBP <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| DOC <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| DOCX <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| TXT <= 1 MiB | D1 + R2 + Email + Telegram PASS |
| Unsupported extension/type | 400 `attachment_invalid_type` |
| > 1 MiB | 400 `attachment_too_large` |
| No attachment | Existing inquiry flow remains PASS |
| Email failure | Inquiry remains persisted |
| Telegram failure | Inquiry remains persisted |

## Current verified limitation

At the Telegram-10 baseline, the Worker allowlist still contains only PDF/JPEG/JPG, and `inquiry.html` advertises only PDF/JPG. Therefore Telegram-11 is **not complete** until both backend and frontend contracts are updated and the Preview matrix is executed.

No Production deployment or merge to `main` is authorized by this document.
