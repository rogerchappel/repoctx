#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-example-workspace"
JSON_EXPORT="$OUT_DIR/workspace.json"
LIST_REPORT="$OUT_DIR/repo-list.txt"
INSPECT_REPORT="$OUT_DIR/branchbrief.txt"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null

node dist/cli.js export \
  --workspace examples/workspace.yaml \
  --format json \
  --output "$JSON_EXPORT"

node dist/cli.js list \
  --workspace examples/workspace.yaml >"$LIST_REPORT"

node dist/cli.js inspect branchbrief \
  --workspace examples/workspace.yaml >"$INSPECT_REPORT"

test -s "$JSON_EXPORT"
test -s "$LIST_REPORT"
test -s "$INSPECT_REPORT"
grep -q '"workspace": "example-workspace"' "$JSON_EXPORT"
grep -q "branchbrief" "$LIST_REPORT"
grep -q "Commands" "$INSPECT_REPORT"

echo "JSON export: $JSON_EXPORT"
echo "Repo list: $LIST_REPORT"
echo "Inspect report: $INSPECT_REPORT"
