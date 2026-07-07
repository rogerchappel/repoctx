#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="${TMPDIR:-/tmp}/repoctx-local-workspace-demo"
DEMO_ROOT="$TMP_DIR/workspace"
OUTPUT_FILE="$TMP_DIR/repoctx-workspace.yaml"

rm -rf "$TMP_DIR"
mkdir -p "$DEMO_ROOT/api-service" "$DEMO_ROOT/docs-site"

git -C "$DEMO_ROOT/api-service" init -q
cat >"$DEMO_ROOT/api-service/package.json" <<'JSON'
{
  "name": "api-service",
  "scripts": {
    "test": "node --test",
    "build": "tsc --noEmit"
  }
}
JSON
mkdir -p "$DEMO_ROOT/api-service/src"
printf "export const ok = true;\n" >"$DEMO_ROOT/api-service/src/index.ts"

git -C "$DEMO_ROOT/docs-site" init -q
cat >"$DEMO_ROOT/docs-site/package.json" <<'JSON'
{
  "name": "docs-site",
  "scripts": {
    "check": "astro check",
    "build": "astro build"
  }
}
JSON
printf "# Docs site\n" >"$DEMO_ROOT/docs-site/README.md"

cd "$ROOT"
npm run build >/dev/null

node dist/cli.js scan "$DEMO_ROOT" --output "$OUTPUT_FILE" --format yaml
node dist/cli.js validate --workspace "$OUTPUT_FILE"
node dist/cli.js list --workspace "$OUTPUT_FILE"
node dist/cli.js inspect api-service --workspace "$OUTPUT_FILE"

grep -q "api-service:" "$OUTPUT_FILE"
grep -q "docs-site:" "$OUTPUT_FILE"

echo "repoctx demo wrote $OUTPUT_FILE"
