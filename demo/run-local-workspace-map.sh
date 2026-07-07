#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="${TMPDIR:-/tmp}/repoctx-local-workspace-demo"
SANDBOX_DIR="$TMP_DIR/workspace"
OUTPUT_FILE="$TMP_DIR/repoctx-workspace.yaml"

rm -rf "$TMP_DIR"
mkdir -p "$SANDBOX_DIR"

create_repo() {
  local name="$1"
  local package_manager="$2"
  local repo_dir="$SANDBOX_DIR/$name"

  mkdir -p "$repo_dir/.github/workflows" "$repo_dir/docs"
  git -C "$repo_dir" init --initial-branch=main >/dev/null
  git -C "$repo_dir" config user.email "demo@example.com"
  git -C "$repo_dir" config user.name "repoctx demo"

  cat >"$repo_dir/README.md" <<EOF
# $name

Demo repository for repoctx workspace scanning.
EOF

  if [[ "$package_manager" == "npm" ]]; then
    cat >"$repo_dir/package.json" <<EOF
{"name":"$name","version":"0.0.0","scripts":{"test":"node --version","build":"node --version"}}
EOF
  else
    cat >"$repo_dir/pyproject.toml" <<EOF
[project]
name = "$name"
version = "0.0.0"
EOF
  fi

  cat >"$repo_dir/.github/workflows/ci.yml" <<'EOF'
name: ci
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
EOF

  git -C "$repo_dir" add .
  git -C "$repo_dir" commit -m "seed demo repository" >/dev/null
}

create_repo "agent-notes" "npm"
create_repo "policy-kit" "python"

npm --prefix "$ROOT_DIR" run build >/dev/null
node "$ROOT_DIR/dist/cli.js" scan "$SANDBOX_DIR" --output "$OUTPUT_FILE" --format yaml
node "$ROOT_DIR/dist/cli.js" list --workspace "$OUTPUT_FILE"
node "$ROOT_DIR/dist/cli.js" inspect agent-notes --workspace "$OUTPUT_FILE"

grep -q "agent-notes" "$OUTPUT_FILE"
grep -q "policy-kit" "$OUTPUT_FILE"
grep -q 'build: "npm run build"' "$OUTPUT_FILE"

echo "Wrote demo workspace map to $OUTPUT_FILE"
