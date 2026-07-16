#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/repoctx-verification-inventory"

cd "$repo_root"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build

node dist/cli.js list --workspace examples/workspace.yaml > "$out_dir/repos.txt"
node dist/cli.js inspect branchbrief --workspace examples/workspace.yaml > "$out_dir/branchbrief.txt"
node dist/cli.js export --workspace examples/workspace.yaml --format json > "$out_dir/workspace.json"

grep -q "branchbrief" "$out_dir/repos.txt"
grep -q "npm test" "$out_dir/branchbrief.txt"
grep -q '"review_pack_required": true' "$out_dir/workspace.json"

echo "Repo list: $out_dir/repos.txt"
echo "Repo inspection: $out_dir/branchbrief.txt"
echo "JSON export: $out_dir/workspace.json"
