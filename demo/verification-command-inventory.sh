#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="${TMPDIR:-/tmp}/repoctx-command-inventory"
workspace_root="$tmp_dir/workspace"
out_dir="${1:-"$root_dir/.repoctx-command-inventory"}"
workspace_file="$out_dir/workspace.yaml"
inspect_file="$out_dir/agent-notes-inspect.txt"

rm -rf "$tmp_dir"
mkdir -p "$workspace_root/agent-notes" "$workspace_root/docs-site" "$out_dir"

git -C "$workspace_root/agent-notes" init -q
cat > "$workspace_root/agent-notes/package.json" <<'JSON'
{
  "name": "agent-notes",
  "scripts": {
    "test": "node --test",
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit"
  }
}
JSON
touch "$workspace_root/agent-notes/package-lock.json"
printf "# Agent notes\n" > "$workspace_root/agent-notes/README.md"

git -C "$workspace_root/docs-site" init -q
cat > "$workspace_root/docs-site/package.json" <<'JSON'
{
  "name": "docs-site",
  "scripts": {
    "check": "astro check",
    "build": "astro build"
  }
}
JSON
touch "$workspace_root/docs-site/pnpm-lock.yaml"
printf "# Docs site\n" > "$workspace_root/docs-site/README.md"

cd "$root_dir"
npm run build >/dev/null

node dist/cli.js scan "$workspace_root" --output "$workspace_file" --format yaml
node dist/cli.js validate --workspace "$workspace_file" > "$out_dir/validate.txt"
node dist/cli.js list --workspace "$workspace_file" > "$out_dir/list.txt"
node dist/cli.js inspect agent-notes --workspace "$workspace_file" > "$inspect_file"

grep -q 'package_manager: "npm"' "$workspace_file"
grep -q 'package_manager: "pnpm"' "$workspace_file"
grep -q 'test: "npm test"' "$workspace_file"
grep -q 'build: "pnpm run build"' "$workspace_file"
grep -q "Commands" "$inspect_file"

echo "repoctx verification command inventory wrote $out_dir"
