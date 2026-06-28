#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf .repoctx-demo
mkdir -p .repoctx-demo

npm run build

node dist/cli.js validate --workspace examples/workspace.yaml > .repoctx-demo/validate.txt
node dist/cli.js list --workspace examples/workspace.yaml > .repoctx-demo/list.txt
node dist/cli.js inspect branchbrief --workspace examples/workspace.yaml > .repoctx-demo/branchbrief.txt
node dist/cli.js export --workspace examples/workspace.yaml --format json --output .repoctx-demo/workspace.json

grep -q "ok workspace is valid" .repoctx-demo/validate.txt
grep -q "branchbrief" .repoctx-demo/list.txt
grep -q "review_pack_required" .repoctx-demo/branchbrief.txt
grep -q '"branchbrief"' .repoctx-demo/workspace.json

echo "repoctx demo ok: wrote workspace handoff files in .repoctx-demo/"
