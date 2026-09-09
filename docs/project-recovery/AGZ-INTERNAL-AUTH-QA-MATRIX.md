# AGZ Internal Auth Gate QA Matrix

| Test | Expected | Status |
|---|---|---|
| Missing ADMIN_PASSWORD/ADMIN_SESSION_SECRET | Private API fails closed; no Inquiry data | Pending runtime |
| GET /api/admin/inquiries without session | 401 | Pending runtime |
| GET /api/admin/inquiries/:reference without session | 401 | Pending runtime |
| Invalid login password | 401, generic error | Pending runtime |
| Valid login | Secure HttpOnly session cookie | Pending runtime |
| Session API after login | authenticated=true only | Pending runtime |
| Admin list after login | bounded read-only data | Pending runtime |
| Search/filter | validated and bounded | Pending runtime |
| Pagination | default 20, max 50 | Pending runtime |
| Admin detail | correct inquiry + attachment metadata only | Pending runtime |
| R2 object bytes/keys unauthenticated | never exposed | Pending runtime |
| Private response caching | `Cache-Control: no-store` | Pending runtime |
| Logout | session cookie expired; subsequent private API 401 | Pending runtime |
| Public Inquiry POST regression | still works without Admin auth | Pending runtime |
| Secrets in source/logs | none | Pending source/runtime audit |
| Oversized/invalid public attachment regression | existing rejection behavior preserved | Pending runtime |

## Release rule
No Production promotion or merge to `main` until all applicable runtime tests pass on Preview and the user explicitly approves release.
