#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$ROOT_DIR/examples/workspace.yaml"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-agent-handoff-export"
JSON_OUT="$OUT_DIR/workspace.json"
INSPECT_OUT="$OUT_DIR/branchbrief.txt"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build >/dev/null

node "$ROOT_DIR/dist/cli.js" export \
  --workspace "$WORKSPACE" \
  --format json >"$JSON_OUT"

node "$ROOT_DIR/dist/cli.js" inspect branchbrief \
  --workspace "$WORKSPACE" >"$INSPECT_OUT"

grep -q '"branchbrief"' "$JSON_OUT"
grep -q '"review_pack_required": true' "$JSON_OUT"
grep -q 'Review pack required: yes' "$INSPECT_OUT"
grep -q 'Forbidden by default: .env\*, secrets/\*' "$INSPECT_OUT"

echo "Workspace JSON export: $JSON_OUT"
echo "Branchbrief handoff text: $INSPECT_OUT"
