#!/usr/bin/env bash
set -euo pipefail

# Workers Builds exposes Build Variables/Secrets as environment variables.
# Convert only the required Worker secrets into a temporary secrets file for
# this version upload. The file is deleted on every exit and is never committed.

: "${ADMIN_PASSWORD:?ADMIN_PASSWORD build secret is required}"
: "${ADMIN_SESSION_SECRET:?ADMIN_SESSION_SECRET build secret is required}"

SECRETS_FILE="$(mktemp)"
cleanup() {
  rm -f "$SECRETS_FILE"
}
trap cleanup EXIT HUP INT TERM

node -e '
const fs = require("fs");
const file = process.argv[1];
const secrets = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
};
fs.writeFileSync(file, JSON.stringify(secrets), { encoding: "utf8", mode: 0o600 });
' "$SECRETS_FILE"

npx wrangler versions upload --secrets-file "$SECRETS_FILE"
