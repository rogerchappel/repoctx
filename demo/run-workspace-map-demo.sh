#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npm run build

echo "== repoctx help =="
node dist/cli.js --help

echo
echo "== repoctx list against the checked-in example workspace =="
node dist/cli.js list --workspace examples/workspace.yaml

echo
echo "== repoctx export as JSON =="
node dist/cli.js export --workspace examples/workspace.yaml --format json > /tmp/repoctx-workspace.json
node -e "const fs=require('node:fs'); const data=JSON.parse(fs.readFileSync('/tmp/repoctx-workspace.json','utf8')); console.log(JSON.stringify({workspace: data.workspace, repos: Object.keys(data.repos).length}, null, 2));"

echo
echo "Wrote /tmp/repoctx-workspace.json"
