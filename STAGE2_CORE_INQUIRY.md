# Agro-Zia Stage 2 — Core Inquiry Validation Gate

## Scope

Stage 2 verifies the canonical Business Inquiry chain without changing `main` or production traffic.

## Four required gates

### 1. Canonical API route

The Worker accepts the inquiry submission only through `POST /api/inquiries`.

**Result:** PASS — the Stage 1 Worker route is explicitly bound to `POST /api/inquiries`.

### 2. Canonical D1 binding

The Worker configuration must expose the production candidate database through `AGROZIA_DB`.

**Result:** PASS — `wrangler.jsonc` defines the `AGROZIA_DB` D1 binding for `agrozia-db11`.

### 3. Persistence contract

A successful response is allowed only after the inquiry row is inserted into D1. The response must include a server-generated request number and persistence confirmation.

**Result:** PASS — the Worker inserts into `inquiries` and returns `persisted: true`, `request_number`, and `created_at` only after the insert succeeds; D1 failure is returned as an error.

### 4. Real end-to-end evidence

A real customer-style inquiry must produce a server reference and the corresponding email continuation must use that persisted reference.

**Result:** PASS — live Stage 1 validation produced sequential references `AGZ-2026-000010`, `AGZ-2026-000011`, and `AGZ-2026-000012`, followed by the expected Agro-Zia inquiry emails.

## Core contract

```text
Inquiry UI
  -> POST /api/inquiries
  -> Worker validation
  -> AGROZIA_DB
  -> inquiries table
  -> server reference
  -> success response
  -> optional email draft
```

## Release protection

- `main` remains unchanged.
- No production promotion is part of this Stage 2 gate.
- Attachment handling, advanced UX, multilingual polish, and security hardening remain outside this core gate.

## Stage 2 status

**CORE INQUIRY: PASS — ready to proceed to the next four-action validation block, subject to preserving the current Stage 1 candidate as the baseline.**
