#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${TMPDIR:-/tmp}/repoctx-workspace-demo"
workspace_file="${out_dir}/workspace.yaml"
json_file="${out_dir}/workspace.json"

cd "$repo_root"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js init --output "$workspace_file" --force
node dist/cli.js add repoctx \
  --path "$repo_root" \
  --remote "https://github.com/rogerchappel/repoctx.git" \
  --type oss-cli \
  --default-base main \
  --tag demo \
  --workspace "$workspace_file"
node dist/cli.js validate --workspace "$workspace_file"
node dist/cli.js list --workspace "$workspace_file"
node dist/cli.js inspect repoctx --workspace "$workspace_file"
node dist/cli.js export --workspace "$workspace_file" --format json --output "$json_file"

grep -Fq '"version": "0.1"' "$json_file"
grep -Fq '"repoctx"' "$json_file"
grep -Fq '"demo"' "$json_file"

printf 'Repoctx workspace demo files:\n'
printf '  %s\n' "$workspace_file"
printf '  %s\n' "$json_file"
