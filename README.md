# repoctx

Give agents a map of your repos, commands, policies, and risks.

`repoctx` scans your local development workspace and creates a machine-readable repo context file for agentic development workflows. It helps tools like taskbrief, branchbrief, CrewCMD, Codex, OpenClaw, Claude Code, and Copilot understand where repos live, how to verify them, and what is safe to touch.

It does not dispatch agents or run commands across repos. It gives your agents context before they act.

## Why repoctx exists

Multi-repo tools usually answer: what repositories do I have, and can I run a command across them?

`repoctx` answers a different question: what does an agent need to know before working in this repo?

That context includes local paths, GitHub remotes, project type, package manager, useful verification commands, documentation files, agent instructions, branch policy, production sensitivity, forbidden paths, and integration flags.

## Current status

This repository is being built toward the V1 described in [docs/PRD.md](docs/PRD.md).

Current implementation on `main` includes:

- a Node package scaffold with `repoctx --help` and `repoctx --version`
- placeholder CLI command names for the intended V1 surface
- scanning, Git metadata, detection, workspace schema, validation, merge, YAML, JSON, and table modules
- tests for the implemented library modules and CLI help behavior
- repoctx-specific workspace docs and examples

The CLI subcommands listed below are still placeholders until command wiring lands. Treat command examples as target V1 behavior unless your branch contains the corresponding implementation.

## Quickstart

Target V1 flow once command wiring is implemented:

```sh
repoctx init
repoctx scan ~/Developer/my-opensource --output workspace.yaml
repoctx validate
repoctx inspect branchbrief
repoctx export --format json --output workspace.json
```

Until those commands are wired, use the examples in `examples/` as reference workspace files for contributors, agents, and integration prototypes.

## CLI usage

Current CLI command names, with implementation still pending:

```text
repoctx init
repoctx scan <path>
repoctx scan <path> --output workspace.yaml
repoctx add <name> --path <path>
repoctx inspect <name>
repoctx validate
repoctx export --format yaml
repoctx export --format json
repoctx doctor
```

Nice-to-have V1 command names, also pending:

```text
repoctx list
repoctx list --type oss-cli
repoctx list --tag agentic
repoctx remove <name>
repoctx update <name>
```

## Example workspace

`workspace.yaml` is the preferred V1 workspace file name. Minimal repo entries only require a path:

```yaml
version: "0.1"
workspace: example-workspace
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
```

A fuller entry can include detected metadata, commands, policies, and integration hints:

```yaml
version: "0.1"
workspace: example-workspace
defaults:
  default_base: main
  requires_branch: true
  review_pack_required: true
  forbidden_by_default:
    - .env*
    - secrets/**
    - credentials/**
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
    remote: https://github.com/example/branchbrief.git
    type: oss-cli
    default_base: main
    docs_url: https://example.com/branchbrief
    package_manager: npm
    commands:
      install: npm ci
      test: npm test
      build: npm run build
      typecheck: npm run typecheck
    files:
      agents: AGENTS.md
      changelog: CHANGELOG.md
      roadmap: ROADMAP.md
    integrations:
      branchbrief: true
      taskbrief: true
      crewcmd: false
      copilot: true
    risk:
      production_sensitive: false
      forbidden_by_default:
        - .env*
        - secrets/**
    agents:
      requires_branch: true
      requires_pr: true
      review_pack_required: true
      human_approval_required: false
```

See [docs/workspace-schema.md](docs/workspace-schema.md) and [docs/examples.md](docs/examples.md) for field guidance.

## Integrations

`repoctx` is intended to be a shared context layer:

- taskbrief can use a workspace file to map messy task input to the right repo, risk profile, and verification commands.
- branchbrief can use repo context to improve pull request summaries, risk classification, and suggested reviewer checks.
- CrewCMD can use repo context to dispatch work with the right branch policy, worktree path, and verification expectations.
- Codex, OpenClaw, Claude Code, Copilot, and other agents can read the map before deciding what to inspect or touch.

Example planned integration commands:

```sh
taskbrief parse brain-dump.txt --workspace workspace.yaml
branchbrief --workspace workspace.yaml
crewcmd dispatch queue.yaml --workspace workspace.yaml
```

These commands belong to their respective tools; `repoctx` provides the workspace context file.

## Safety policy

V1 is local-first by default:

- no external API calls required
- no GitHub authentication required
- no LLM required
- no repository mutation during scanning
- no edits inside scanned repositories
- no secret contents read from `.env` files
- no secret values printed
- workspace output written only when requested

`repoctx` may record that sensitive files or paths exist, but it should not read or expose their contents. Production-sensitive repositories should declare forbidden and high-risk paths so agents know when to stop for human approval.

## Roadmap summary

V1 focuses on local scanning, workspace config, metadata detection, validation, inspection, YAML/JSON export, docs, and examples.

V2 may add richer GitHub enrichment, integration-specific outputs, importers, policy packs, repo health signals, and interactive editing.

V3 may add org-level maps, dependency graphs, static dashboards, agent dispatch integration, policy-as-code, and multi-machine sync.

See [ROADMAP.md](ROADMAP.md) for the working roadmap.

## Contributing

Keep changes small, reviewable, and aligned with [AGENTS.md](AGENTS.md). Runtime work should not overclaim behavior in docs until commands are implemented and verified.

Run the repoctx hygiene check before docs or example changes:

```sh
bash scripts/validate-repoctx.sh
```

## License

MIT. See [LICENSE](LICENSE).
