# Release integration check

Release candidate: `release/inquiry-integration`

Validated components:
- `inquiry.html` is present on the release branch and contains the Request Reference UI flow.
- `_worker.js` exposes `POST /api/inquiries` and returns `request_number` without requiring D1.
- `wrangler.jsonc` routes `/api/*` through the Worker first.

No production deployment performed.
