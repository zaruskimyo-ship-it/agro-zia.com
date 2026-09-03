# Stage Security — Sensitive Path Guard

## Scope

Protect the Worker from accidental exposure of repository and deployment configuration files while preserving the existing inquiry/API and asset routes.

## Guarded path classes

The Worker returns `404 Not Found` for requests targeting:

- Git metadata under `/.git/`
- Environment files such as `/.env` and `/.env.*`
- Wrangler configuration files (`wrangler.json`, `wrangler.jsonc`, `wrangler.toml`)
- Common package-manager metadata that should never be served (`/.npmrc`)

## Validation

Test only on a non-production Preview deployment. Confirm the guarded paths return 404 while `/api/health`, `/api/inquiries`, and the multilingual preview remain functional.

`main` and Production must not be modified or promoted until Preview validation is complete and explicitly approved.
