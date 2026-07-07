#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-scan-current-repo-demo"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build

node dist/cli.js scan "$ROOT_DIR" --output "$OUT_DIR/workspace.yaml"
node dist/cli.js scan "$ROOT_DIR" --output "$OUT_DIR/workspace.json" --format json

node dist/cli.js list --workspace "$OUT_DIR/workspace.yaml" | tee "$OUT_DIR/list.txt"
node dist/cli.js inspect repoctx --workspace "$OUT_DIR/workspace.yaml" | tee "$OUT_DIR/inspect.txt"
node dist/cli.js validate --workspace "$OUT_DIR/workspace.yaml"

test -s "$OUT_DIR/workspace.yaml"
test -s "$OUT_DIR/workspace.json"
grep -q "repoctx" "$OUT_DIR/list.txt"
grep -q "package_manager" "$OUT_DIR/workspace.json"
grep -q "npm run typecheck" "$OUT_DIR/workspace.json"

printf 'repoctx scan demo wrote workspace artifacts to %s\n' "$OUT_DIR"
