# Agro-Zia Phase 3 — Request Tracking

## Objective

Turn the existing B2B inquiry form into a real request-registration workflow without changing the current Production site until the backend has been configured and tested.

## Target flow

Buyer → `/inquiry.html` → Worker API → D1 → unique request number → confirmation response → email confirmation → request tracking.

## Request number

Format:

`AGZ-YYYY-000001`

The number must be generated server-side and must be unique. The client must never be trusted to generate the authoritative identifier.

## Initial status

Every accepted request starts with:

`received`

Future statuses:

- received
- under_review
- supplier_check
- quotation_prepared
- negotiation
- confirmed
- completed
- cancelled

## D1 data model

The initial schema is stored in `db/schema.sql`.

Stored fields are limited to information required to process the inquiry: request number, timestamp, language, product, company, specification, quantity, destination, timing, email, phone, message and status.

## Privacy / security

- Do not expose the D1 database directly to the browser.
- Do not expose sequential internal numeric IDs to customers.
- Tracking must use the public request number plus an additional verification mechanism before revealing private request details.
- Do not store passwords or unnecessary sensitive information.
- Validate and length-limit all incoming fields at the Worker boundary.
- Keep production unchanged until D1 binding and API tests pass.

## Cloudflare configuration required before activation

A Cloudflare D1 database must be created and bound to the Worker, for example as:

`DB`

The actual `database_id` is environment-specific and must not be invented or committed as a placeholder.

## Release gates

1. Create D1 database.
2. Bind D1 to the Worker.
3. Add Worker API endpoints for create/track.
4. Connect `/inquiry.html` to the API.
5. Add confirmation page/state.
6. Test EN/RU/FA/AR/UZ/TR and RTL.
7. Test duplicate/submission/error handling.
8. Test privacy boundaries for tracking.
9. Preview deployment.
10. Owner approval.
11. Production deployment.
