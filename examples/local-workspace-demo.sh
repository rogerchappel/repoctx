#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

WORKSPACE="$TMP_DIR/workspace.yaml"

cd "$ROOT_DIR"

node dist/cli.js init --output "$WORKSPACE"
node dist/cli.js add repoctx \
  --workspace "$WORKSPACE" \
  --path "$ROOT_DIR" \
  --type oss-cli \
  --default-base main \
  --tag agent-context \
  --tag local-first

echo "== configured repos =="
node dist/cli.js list --workspace "$WORKSPACE"

echo
echo "== inspect repoctx =="
node dist/cli.js inspect repoctx --workspace "$WORKSPACE"

echo
echo "== validate workspace =="
node dist/cli.js validate --workspace "$WORKSPACE"

echo
echo "== export json =="
node dist/cli.js export --workspace "$WORKSPACE" --format json --output "$TMP_DIR/workspace.json"
grep -q '"repoctx"' "$TMP_DIR/workspace.json"
wc -c "$TMP_DIR/workspace.json"
