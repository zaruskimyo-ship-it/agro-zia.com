#!/usr/bin/env bash
set -euo pipefail

# Runtime Worker secrets remain configured in Cloudflare. They are deliberately
# not required in the build environment because public Preview versions must
# be buildable without exposing or copying secret values into the build job.

npx wrangler versions upload
