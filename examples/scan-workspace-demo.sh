#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-scan-workspace-demo"
REPO_DIR="$OUT_DIR/repos"
APP_DIR="$REPO_DIR/demo-app"
WORKSPACE_FILE="$OUT_DIR/workspace.json"

rm -rf "$OUT_DIR"
mkdir -p "$APP_DIR"

git init --initial-branch=main "$APP_DIR" >/dev/null
git -C "$APP_DIR" config user.email "repoctx-demo@example.com"
git -C "$APP_DIR" config user.name "Repoctx Demo"
git -C "$APP_DIR" remote add origin "git@github.com:example/demo-app.git"

cat >"$APP_DIR/README.md" <<'EOF'
# Demo App

Fixture repository for the repoctx scan demo.
EOF

cat >"$APP_DIR/package.json" <<'EOF'
{
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  }
}
EOF

touch "$APP_DIR/package-lock.json"
git -C "$APP_DIR" add README.md package.json package-lock.json
git -C "$APP_DIR" commit -m "Create demo app fixture" >/dev/null

cd "$ROOT_DIR"
npm run build
node dist/cli.js scan "$REPO_DIR" --output "$WORKSPACE_FILE" --format json
node dist/cli.js validate --workspace "$WORKSPACE_FILE"
node dist/cli.js inspect demo-app --workspace "$WORKSPACE_FILE"

grep -q '"demo-app"' "$WORKSPACE_FILE"
grep -q '"package_manager": "npm"' "$WORKSPACE_FILE"
grep -q '"build": "npm run build"' "$WORKSPACE_FILE"

echo "Workspace map: $WORKSPACE_FILE"
