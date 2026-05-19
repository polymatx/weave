#!/usr/bin/env bash
# Build the docs site and rsync it to the polymatx.dev VPS.
#
# Requires SSH access as root@REDACTED (or set WEAVE_DOCS_SSH).
# The remote nginx is already configured to serve /weave/ from /var/www/weave/.

set -euo pipefail

cd "$(dirname "$0")/.."

REMOTE="${WEAVE_DOCS_SSH:-root@REDACTED}"
REMOTE_PATH="${WEAVE_DOCS_PATH:-/var/www/weave/}"

echo "Building docs..."
pnpm --filter weave-docs build

echo "Deploying to ${REMOTE}:${REMOTE_PATH} ..."
rsync -az --delete apps/docs/dist/ "${REMOTE}:${REMOTE_PATH}"

ssh "${REMOTE}" "chown -R www-data:www-data ${REMOTE_PATH}"

echo "Done. Live at https://polymatx.dev/weave/"
