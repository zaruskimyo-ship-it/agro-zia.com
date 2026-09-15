# AGZ Internal Auth — Router Integration Gate

Status: IMPLEMENTATION INTEGRATED ON FEATURE BRANCH; PREVIEW QA PENDING

Branch: `feat/stage-12-auth-internal`

The Worker now imports `dispatchAdminRoute` from `src/admin/admin-router.js` and invokes it only for `/api/admin/*` paths before the existing public Inquiry route and asset fallback.

The adapter returns `null` for non-admin paths, so the existing Worker router remains authoritative for public Inquiry, health, multilingual preview, Telegram, Email, R2 and assets.

Private admin handlers remain read-only, bounded, `no-store`, and expose attachment metadata only; they do not expose R2 object keys or bytes.

## Preview release gates

1. Admin login with configured deployment secrets.
2. Unauthenticated private API rejected.
3. Invalid/unauthorized session rejected.
4. Authenticated list/search/filter/pagination.
5. Authenticated detail by valid reference.
6. Attachment metadata without R2 key/object exposure.
7. `Cache-Control: no-store` on private responses.
8. Public `POST /api/inquiries` regression, including Email text-only and Telegram attachment flow.
9. Logout/session invalidation.
10. Mobile/admin UI sanity.

This repository-side integration is **not** a Production approval. Cloudflare Preview deployment and live runtime verification remain pending because Cloudflare MCP/Wrangler execution is unavailable in the current tool environment.
