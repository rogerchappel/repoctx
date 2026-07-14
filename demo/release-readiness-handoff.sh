#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/repoctx-release-readiness-handoff"

rm -rf "$out_dir"
mkdir -p "$out_dir"

cd "$repo_root"
npm run build

node dist/cli.js list --workspace examples/workspace.yaml > "$out_dir/repos.txt"
node dist/cli.js inspect product-videogen --workspace examples/workspace.yaml > "$out_dir/product-videogen.txt"
node dist/cli.js export --workspace examples/workspace.yaml --format json --output "$out_dir/workspace.json"

grep -q "branchbrief" "$out_dir/repos.txt"
grep -q "product-videogen" "$out_dir/product-videogen.txt"
grep -q '"production_sensitive": true' "$out_dir/workspace.json"
grep -q '"human_approval_required": true' "$out_dir/workspace.json"

echo "Release-readiness handoff: $out_dir"
