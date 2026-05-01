# repoctx

`repoctx` is an agent-readable workspace map for multi-repo development.

It is designed to scan local repositories, detect useful metadata, and export
context that tools like `taskbrief`, `branchbrief`, CrewCMD, Codex, OpenClaw,
Claude Code, and GitHub Copilot can use to understand what exists, how a repo is
verified, and where the risky edges are.

## Why this exists

Multi-repo work gets expensive fast when every tool has to rediscover the same
facts: where repositories live, which commands are safe, what package manager a
project uses, whether docs exist, and which policies apply before editing.

`repoctx` aims to make that context explicit and reusable.

## What it is meant to provide

The product brief scopes `repoctx` around:

- discovering local git repositories
- mapping local paths to git remotes and default branches
- detecting project type, package manager, docs, and agent instructions
- identifying verification commands and risk-relevant metadata
- exporting a machine-readable workspace map for downstream tools

## Current status

This repository is actively taking shape. The current tree already includes a
placeholder CLI, compiled build output, and repository-scanning modules, but the
full command set is not finished yet.

Today you can inspect the scaffolded CLI help locally:

```sh
node dist/cli.js --help
```

See [docs/PRD.md](docs/PRD.md) for the full product definition.

## Development

If you are working on the TypeScript source, install dependencies and run the
project's local checks before opening a PR.

The repository also contains local validation helpers and workflow docs for the
agent-oriented operating model.

## Safety and local-first notes

`repoctx` is intentionally local-first. It is meant to help agents understand a
workspace before acting, not to hide risky mutations behind opaque automation.

## License

MIT
