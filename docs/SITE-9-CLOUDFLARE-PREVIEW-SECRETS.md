# SITE-9 — Cloudflare Preview Secret Upload

## Problem

Cloudflare Workers Builds exposes Build Variables and Secrets to the build environment, but `secrets.required` validates secrets on the Worker Version itself. Therefore `npx wrangler versions upload` can fail even when the same names exist under Workers Builds → Build Variables and Secrets.

## Safe solution

Use `scripts/cloudflare-preview-upload.sh` as the non-production Deploy command. The script:

1. Requires `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to exist in the build environment.
2. Creates a temporary JSON secrets file outside the repository.
3. Uploads the version with `wrangler versions upload --secrets-file`.
4. Deletes the temporary file on exit.
5. Never commits or prints secret values.

Cloudflare documents `--secrets-file` for `wrangler versions upload` and confirms that Workers Builds Build Variables/Secrets are available to the build process.

## Dashboard change required

Workers & Pages → `agro-zia-com` → Settings → Builds → Non-production branch deploy command:

```text
bash scripts/cloudflare-preview-upload.sh
```

Do not use `wrangler secret put`; that command creates and deploys a Worker version immediately. This project requires Preview-first release safety.

## Release boundary

This only affects the feature-branch Preview build. It does not merge the branch, promote the version, or modify `main`.
