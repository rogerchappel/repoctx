# Workspace Schema

`repoctx` workspaces describe local repositories in a format agents can read before acting. The preferred V1 file name is `workspace.yaml`; `repoctx.yaml` and `repos.yaml` are planned alternate names.

## Top-level fields

```yaml
version: "0.1"
workspace: example-workspace
defaults:
  default_base: main
  requires_branch: true
  review_pack_required: true
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
```

- `version`: workspace schema version.
- `workspace`: human-readable workspace name.
- `defaults`: policy values applied when a repo does not override them.
- `repos`: map of stable repo keys to repo context entries.

## Minimum valid repo entry

```yaml
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
```

Every other field can be detected, filled later, or left unknown.

## Repo fields

```yaml
path:
remote:
type:
default_base:
docs_url:
package_manager:
commands:
files:
integrations:
risk:
agents:
tags:
notes:
```

- `path`: local path to the repository. Example files may use `~`, but tools should resolve paths before filesystem checks.
- `remote`: Git remote URL, usually origin.
- `type`: repo classification. Use `unknown` when uncertain.
- `default_base`: expected base branch for PRs.
- `docs_url`: public or internal docs URL if known.
- `package_manager`: detected package manager such as `npm`, `pnpm`, `yarn`, or `bun`.
- `commands`: named commands agents can use for install, verification, build, docs, and release checks.
- `files`: important repo files such as `AGENTS.md`, `CHANGELOG.md`, or `ROADMAP.md`.
- `integrations`: booleans for tools that can consume repo context.
- `risk`: production sensitivity and paths that need caution.
- `agents`: branch, PR, review pack, and approval requirements.
- `tags`: optional grouping labels.
- `notes`: short human-readable context.

## Repo types

Initial supported values:

```text
oss-cli
oss-library
docs-site
github-action
template
product
production-saas
company
client
internal-tool
experiment
unknown
```

## Commands

Supported command keys:

```yaml
commands:
  install: npm ci
  test: npm test
  build: npm run build
  typecheck: npm run typecheck
  lint: npm run lint
  format: npm run format
  dev: npm run dev
  docs: npm run docs
  release_check: npm run release:check
```

Commands should be repo-local and safe to show to agents. Do not include secrets or machine-specific tokens.

## Risk fields

```yaml
risk:
  production_sensitive: false
  forbidden_by_default:
    - .env*
    - secrets/**
  high_risk_paths:
    - auth/**
    - billing/**
    - migrations/**
  medium_risk_paths:
    - .github/workflows/**
    - package.json
```

See [risk-policy.md](risk-policy.md) for policy guidance.

## Agent fields

```yaml
agents:
  requires_branch: true
  requires_pr: true
  review_pack_required: true
  human_approval_required: false
  preferred_agent: codex
```

These fields are policy hints for agents and orchestration tools. They do not replace maintainer judgment.

## Integration fields

```yaml
integrations:
  branchbrief: true
  taskbrief: true
  crewcmd: true
  copilot: true
```

Integration flags mean the repo has useful context for that tool. They do not mean the external tool is installed.
