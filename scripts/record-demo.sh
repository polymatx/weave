#!/usr/bin/env bash
# Reproducible demo GIF recorder for weave.
# Requires: charmbracelet/vhs (`brew install vhs`)
#           bat (`brew install bat`) — for syntax-highlighted file display
#           tree (`brew install tree`)
#
# Output: docs/assets/demo.gif
#
# Usage:
#   ./scripts/record-demo.sh

set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p docs/assets

for tool in vhs bat tree; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "missing tool: $tool" >&2
    echo "install with: brew install $tool" >&2
    exit 1
  fi
done

echo "Recording demo (this may take ~30s)..."
vhs scripts/demo.tape

echo "Done: docs/assets/demo.gif"
echo "Preview:  open docs/assets/demo.gif"
