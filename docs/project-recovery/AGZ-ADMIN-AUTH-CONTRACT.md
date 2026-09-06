# AGZ Admin Authentication Contract

## Status
Stage 12-B design contract only. Authentication is **not enabled** by this document.

## Security boundary
Private Inquiry data must only be returned by Worker endpoints after server-side authentication and authorization. A static `/admin` page is not a security boundary.

## Preferred production mechanism
Use Cloudflare Access in front of the administrative surface, with the Worker independently validating the authenticated identity/authorization before serving private Inquiry data.

## Required configuration (no hard-coded secrets)
- `ADMIN_ACCESS_ISSUER` — Access JWT issuer.
- `ADMIN_ACCESS_AUD` — Access application audience/tag.
- Optional allowlist configuration for authorized administrator identity/domain.

These values must be supplied through the deployment environment/secrets/configuration mechanism, never committed to source.

## Required Worker behavior
1. Unauthenticated private API requests: `401`.
2. Authenticated but unauthorized requests: `403`.
3. Successful private responses: `Cache-Control: no-store`.
4. Never return R2 object contents from an unauthenticated endpoint.
5. Never log Access JWTs, cookies, Telegram secrets, or Inquiry contents.
6. Admin UI may expose only data returned by the authenticated private API.

## Initial scope
Read-only administration only. No status mutation, delete, attachment download, or other write operation is part of Stage 12-B.

## Blocking prerequisite
The repository connector can modify GitHub source, but the current tool environment has no Cloudflare Access/MCP administration capability. Therefore Access application/policy configuration and live JWT verification cannot honestly be marked complete from this environment.
