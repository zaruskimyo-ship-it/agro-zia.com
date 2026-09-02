# Stage 6 Telegram Diagnostic Procedure

This branch adds safe runtime diagnostics for Telegram Bot API failures.

## Captured fields
- request reference
- Telegram method
- HTTP status
- Telegram `ok`
- Telegram `error_code`
- Telegram `description`
- attachment presence and size

Bot token and chat ID are never logged.

## Validation sequence
1. Submit a real inquiry in Preview.
2. Confirm D1/R2 persistence remains successful.
3. Inspect Workers Logs for the request reference.
4. Use the Telegram HTTP status and description to identify the root cause.
5. Apply only the evidence-based fix on a separate branch.

Production and `main` remain untouched until Preview validation and explicit approval.
