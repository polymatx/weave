#!/usr/bin/env bash
# Build the docs site and rsync it to a remote host.
#
# Configure via environment variables:
#   WEAVE_DOCS_SSH   ssh target, e.g. user@host
#   WEAVE_DOCS_PATH  remote document root (defaults to /var/www/weave/)
#
# Example:
#   WEAVE_DOCS_SSH=user@host ./scripts/deploy-docs.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [ -z "${WEAVE_DOCS_SSH:-}" ]; then
  echo "error: set WEAVE_DOCS_SSH to your ssh target (e.g. user@host)" >&2
  exit 1
fi

REMOTE="${WEAVE_DOCS_SSH}"
REMOTE_PATH="${WEAVE_DOCS_PATH:-/var/www/weave/}"

echo "Building docs..."
pnpm --filter weave-docs build

echo "Deploying to ${REMOTE}:${REMOTE_PATH} ..."
rsync -az --delete apps/docs/dist/ "${REMOTE}:${REMOTE_PATH}"

ssh "${REMOTE}" "chown -R www-data:www-data ${REMOTE_PATH}"

echo "Done."
