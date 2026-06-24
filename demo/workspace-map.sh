#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-demo"
FIXTURE_DIR="$OUT_DIR/workspace"
REPORT_OUT="$OUT_DIR/workspace-map.yaml"
JSON_OUT="$OUT_DIR/workspace-map.json"

rm -rf "$OUT_DIR"
mkdir -p "$FIXTURE_DIR/api-service" "$FIXTURE_DIR/docs-site"

git -C "$FIXTURE_DIR/api-service" init --quiet
git -C "$FIXTURE_DIR/docs-site" init --quiet

cat > "$FIXTURE_DIR/api-service/package.json" <<'JSON'
{
  "name": "api-service",
  "scripts": {
    "test": "node --test",
    "build": "tsc -p tsconfig.json"
  }
}
JSON

cat > "$FIXTURE_DIR/docs-site/README.md" <<'MD'
# Docs Site

Placeholder docs repository for a repoctx workspace-map demo.
MD

cd "$ROOT_DIR"

npm run build

node dist/cli.js scan "$FIXTURE_DIR" --output "$REPORT_OUT" --format yaml
node dist/cli.js scan "$FIXTURE_DIR" --output "$JSON_OUT" --format json

test -s "$REPORT_OUT"
test -s "$JSON_OUT"
grep -q "api-service" "$REPORT_OUT"
grep -q "docs-site" "$JSON_OUT"

echo "YAML workspace map: $REPORT_OUT"
echo "JSON workspace map: $JSON_OUT"
