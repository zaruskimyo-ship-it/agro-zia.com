# AGZ Admin API QA Matrix — Stage 12-C

| Test | Expected result | Current state |
|---|---|---|
| Unauthenticated `GET /api/admin/inquiries` | `401` | BLOCKED — live auth gate not configured in current environment |
| Unauthorized authenticated list request | `403` | BLOCKED — live Access identity/policy not configured |
| Authorized list request | bounded JSON list | BLOCKED — endpoint not activated |
| `q` search | server-side filtered results | READY FOR IMPLEMENTATION |
| `status` filter | server-side filtered results | READY FOR IMPLEMENTATION |
| `page` / `page_size` | bounded pagination, max 50 | READY FOR IMPLEMENTATION |
| Oversized page size | safe `400` | READY FOR IMPLEMENTATION |
| Exact detail by reference | one inquiry or `404` | READY FOR IMPLEMENTATION |
| Attachment metadata | metadata only, no bytes/R2 key | READY FOR IMPLEMENTATION |
| Private response caching | `Cache-Control: no-store` | CONTRACTED |
| Safe error responses | no stack traces/secrets | CONTRACTED |
| Public Inquiry regression | existing POST flow remains functional | MUST VERIFY AFTER IMPLEMENTATION |

## Release rule
Stage 12-C cannot be marked PASS until the authentication prerequisite is live and the blocked runtime tests are executed against Preview. No merge to `main` or Production promotion is authorized by this matrix.
