#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$repo_root"

npm run build

workspace="examples/workspace.yaml"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

node dist/cli.js --help >/dev/null
node dist/cli.js list --workspace "$workspace"
node dist/cli.js inspect branchbrief --workspace "$workspace"
node dist/cli.js export --workspace "$workspace" --format json --output "$tmp/workspace.json"
grep -q '"branchbrief"' "$tmp/workspace.json"

echo "repoctx demo completed against $workspace"
