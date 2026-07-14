#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-agent-workspace-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "== List repos from the checked-in example workspace =="
node "$ROOT_DIR/dist/cli.js" list --workspace "$ROOT_DIR/examples/workspace.yaml" \
  | tee "$OUT_DIR/repo-list.txt"

echo
echo "== Inspect the OSS CLI example entry =="
node "$ROOT_DIR/dist/cli.js" inspect branchbrief --workspace "$ROOT_DIR/examples/workspace.yaml" \
  | tee "$OUT_DIR/branchbrief-context.txt"

echo
echo "== Export the workspace as JSON for downstream tools =="
node "$ROOT_DIR/dist/cli.js" export --workspace "$ROOT_DIR/examples/workspace.yaml" --format json --output "$OUT_DIR/workspace.json"
sed -n '1,80p' "$OUT_DIR/workspace.json"

echo
echo "Demo output written to $OUT_DIR"
