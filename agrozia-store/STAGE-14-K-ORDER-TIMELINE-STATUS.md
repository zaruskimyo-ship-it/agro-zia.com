# Stage 14-K — Customer Commercial Order Timeline Status

Date: 2026-09-12
Branch: `feat/store-admin-stage12`

## Scope

Improve the authenticated Direct Sale Orders presentation with a commercial status timeline using only states already defined by the Store backend. No payment gateway, shipment provider, or new order-state model is introduced.

## Root-cause / evidence review

Reviewed before change:

- `src/site/orders-live-response.js`
- `src/commerce/order-contract.js`
- `src/commerce/order-repository.js`
- `src/commerce/order-api.js`
- `_worker.js`

The Store backend already defines these order states: `pending_confirmation`, `confirmed`, `proforma_pending`, `payment_pending`, `sourcing`, `shipping`, `delivered`, `completed`, `cancelled`, and `rejected`.

The public order projection exposes `created_at` and `updated_at`, but it does not expose a per-state event history. Therefore the UI must not invent historical timestamps for individual states.

## Implemented

- Added a commercial order-state timeline to the live Direct Sale order view.
- Timeline labels are derived only from backend-defined order states.
- Current state is highlighted.
- Terminal `cancelled` and `rejected` states are handled separately.
- Created/last-updated timestamps are shown from the real order record.
- Explicitly explains that per-state historical timestamps are not inferred.
- Existing authenticated `/api/orders/:id` flow remains unchanged.
- B2B order workflow remains separate.
- Added automated assertions for the backend-defined state set.

## Commits

- `b7c8a2a87493cae0dae1a4279a2a436536f6c882` — commercial order timeline
- `953eff694ff34e4e591c8eab9c18d3c6455a3055` — timeline contract test

## Isolation

- `main`: unchanged
- Production: unchanged
- Main B2B Worker: unchanged
- Store D1 schema: unchanged
- Payment/provider integration: not introduced
- B2B order state machine: not modified

## Validation

- Backend state evidence: PASS
- Code integration: PASS
- Test coverage added: PASS
- GitHub Actions execution: PENDING until an actual run is observed
- Cloudflare Store runtime: PENDING
- Browser/E2E: PENDING
- Real customer order lifecycle: PENDING

## Next safe direction

The next stage should be driven by evidence from the Store runtime and remaining site surfaces. Payment, logistics-provider, inventory reservation, and notification integrations must remain separate controlled stages.
