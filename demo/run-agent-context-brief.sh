#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$ROOT_DIR/examples/workspace.yaml"
OUT_DIR="${TMPDIR:-/tmp}/repoctx-agent-context-brief"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "== List the example workspace entries =="
node "$ROOT_DIR/dist/cli.js" list --workspace "$WORKSPACE" | tee "$OUT_DIR/repos.txt"

echo
echo "== Inspect the branchbrief entry for agent handoff =="
node "$ROOT_DIR/dist/cli.js" inspect branchbrief --workspace "$WORKSPACE" | tee "$OUT_DIR/branchbrief-context.txt"

grep -q "branchbrief" "$OUT_DIR/repos.txt"
grep -q "Review pack required: yes" "$OUT_DIR/branchbrief-context.txt"
grep -q "Forbidden by default: .env\\*, secrets/\\*" "$OUT_DIR/branchbrief-context.txt"

echo
echo "Wrote agent context brief files to $OUT_DIR"
