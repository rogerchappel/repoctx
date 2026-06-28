#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/repoctx-smoke.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

node "$repo_root/dist/cli.js" --help | grep -q 'repoctx'
test "$(node "$repo_root/dist/cli.js" --version)" = "0.1.0"

node "$repo_root/dist/cli.js" init --output "$tmp_dir/workspace.yaml"
test -s "$tmp_dir/workspace.yaml"

node "$repo_root/dist/cli.js" validate --workspace "$tmp_dir/workspace.yaml"
node "$repo_root/dist/cli.js" export --workspace "$tmp_dir/workspace.yaml" --format json > "$tmp_dir/workspace.json"
grep -q '"repos"' "$tmp_dir/workspace.json"

printf 'repoctx smoke passed\n'
