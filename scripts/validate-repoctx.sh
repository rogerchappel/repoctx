#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

failed=0

pass() {
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  failed=1
}

check_file() {
  if [ -s "$1" ]; then
    pass "required file exists: $1"
  else
    fail "missing or empty required file: $1"
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    pass "required directory exists: $1"
  else
    fail "missing required directory: $1"
  fi
}

required_root_files="
AGENTS.md
CHANGELOG.md
CODE_OF_CONDUCT.md
CONTRIBUTING.md
LICENSE
README.md
ROADMAP.md
SECURITY.md
package.json
tsconfig.json
"

required_docs="
docs/PRD.md
docs/workspace-schema.md
docs/scanning.md
docs/validation.md
docs/risk-policy.md
docs/integrations.md
docs/taskbrief.md
docs/branchbrief.md
docs/crewcmd.md
docs/examples.md
docs/release-process.md
"

required_examples="
examples/workspace.yaml
examples/workspace.json
examples/rogerchappel-workspace.yaml
"

printf 'Checking required root files...\n'
for file in $required_root_files; do
  check_file "$file"
done

printf '\nChecking required docs...\n'
check_dir docs
for file in $required_docs; do
  check_file "$file"
done

printf '\nChecking required examples...\n'
check_dir examples
for file in $required_examples; do
  check_file "$file"
done

printf '\nScanning project-facing docs for unresolved template placeholders...\n'
placeholder_hits="$(rg -n '\{\{[A-Z0-9_]+\}\}' \
  README.md ROADMAP.md CHANGELOG.md docs examples \
  --glob '!docs/template-variables.md' \
  || true)"

if [ -n "$placeholder_hits" ]; then
  fail "found unresolved template placeholders in project-facing docs"
  printf '%s\n' "$placeholder_hits" >&2
else
  pass "no unresolved template placeholders in project-facing docs"
fi

printf '\nScanning project-facing docs for stale template identity...\n'
stale_hits="$(rg -n 'agentic-oss-template|generated from this template|template repository|Template validation passed|validate-template\.sh|examples/(cli-tooling|docs-only|minimal-library)' \
  README.md ROADMAP.md CHANGELOG.md docs examples \
  --glob '!docs/template-variables.md' \
  || true)"

if [ -n "$stale_hits" ]; then
  fail "found stale template-era language in project-facing docs"
  printf '%s\n' "$stale_hits" >&2
else
  pass "no stale template-era language in project-facing docs"
fi

if [ "$failed" -ne 0 ]; then
  printf '\nrepoctx validation failed.\n' >&2
  exit 1
fi

printf '\nrepoctx validation passed.\n'
