#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/repoctx-package-smoke.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

cd "$repo_root"
npm run build >/dev/null
npm pack --dry-run --json > "$tmp_dir/pack.json"

node --input-type=module - "$tmp_dir/pack.json" <<'NODE'
import { readFileSync } from "node:fs";

const [pack] = JSON.parse(readFileSync(process.argv[2], "utf8"));
const files = new Set(pack.files.map((entry) => entry.path));
const required = [
  "dist/cli.js",
  "dist/index.js",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "ROADMAP.md",
  "docs/release-checklist.md",
  "examples/workspace.yaml",
  "templates/README.md",
  "demo/run-example-workspace.sh",
];

const missing = required.filter((file) => !files.has(file));
if (missing.length > 0) {
  console.error(`Missing package files: ${missing.join(", ")}`);
  process.exit(1);
}
NODE

printf 'repoctx package smoke passed\n'
