#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="/tmp/repoctx-demo"
OUT_FILE="$OUT_DIR/workspace.json"

cd "$ROOT"
mkdir -p "$OUT_DIR"

npm run build
node dist/cli.js scan "$ROOT" --output "$OUT_FILE" --format json
node dist/cli.js validate --workspace "$OUT_FILE"
node dist/cli.js list --workspace "$OUT_FILE"

echo "Wrote demo workspace map to $OUT_FILE"
