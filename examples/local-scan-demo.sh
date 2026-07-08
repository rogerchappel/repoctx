#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_ROOT="${TMPDIR:-/tmp}/repoctx-local-scan-demo"
WORKSPACE_FILE="$DEMO_ROOT/workspace.json"

rm -rf "$DEMO_ROOT"
mkdir -p "$DEMO_ROOT/repos/api-service" "$DEMO_ROOT/repos/docs-site"

git -C "$DEMO_ROOT/repos/api-service" init --initial-branch=main >/dev/null
cat >"$DEMO_ROOT/repos/api-service/package.json" <<'JSON'
{
  "name": "api-service",
  "scripts": {
    "test": "node --test",
    "build": "tsc --noEmit"
  }
}
JSON
git -C "$DEMO_ROOT/repos/api-service" add package.json
git -C "$DEMO_ROOT/repos/api-service" commit -m "Seed api service fixture" >/dev/null

git -C "$DEMO_ROOT/repos/docs-site" init --initial-branch=main >/dev/null
cat >"$DEMO_ROOT/repos/docs-site/README.md" <<'MD'
# Docs Site

Static documentation fixture for the repoctx local scan demo.
MD
git -C "$DEMO_ROOT/repos/docs-site" add README.md
git -C "$DEMO_ROOT/repos/docs-site" commit -m "Seed docs fixture" >/dev/null

npm --prefix "$ROOT_DIR" run build >/dev/null
node "$ROOT_DIR/dist/cli.js" scan "$DEMO_ROOT/repos" --output "$WORKSPACE_FILE" --format json

node -e '
const fs = require("node:fs");
const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
for (const name of ["api-service", "docs-site"]) {
  if (!data.repos || !data.repos[name]) {
    throw new Error(`Missing scanned repo: ${name}`);
  }
}
if (data.repos["api-service"].commands?.test !== "npm test") {
  throw new Error("Expected api-service test command to be detected");
}
' "$WORKSPACE_FILE"

echo "Wrote $WORKSPACE_FILE"
