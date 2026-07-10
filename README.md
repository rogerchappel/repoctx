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

## Installation

Install the published CLI from npm:

```sh
npm install -g repoctx
repoctx --help
```

You can also run it without a global install:

```sh
npx repoctx --help
```

When working from a source checkout, build first and then inspect the compiled
CLI help:

```sh
npm install
npm run build
node dist/cli.js --help
```

## Runnable Demo

The local scan demo creates two temporary Git repositories, scans them, and
checks that the generated workspace JSON contains both entries:

```sh
npm run build
bash examples/local-scan-demo.sh
```

See [Local workspace scan demo](docs/tutorials/local-workspace-scan.md) for the
walkthrough and [video brief](docs/promo/local-scan-video-brief.md) for a
promotion-safe beat sheet.

For a runnable workspace-map demo that initializes, validates, lists, inspects,
and exports a temporary workspace, run:

```sh
bash demo/workspace-map-demo.sh
```

See [Workspace Map Demo](docs/tutorials/workspace-map-demo.md) for the command
sequence and generated files.

Run a short workspace-map demo:

```sh
bash demo/run-workspace-map-demo.sh
```

The demo uses the checked-in placeholder workspace to list repository entries
and export agent-readable JSON. See
[Workspace Map Demo](docs/tutorials/workspace-map-demo.md).

## Demo

Run the local workspace inventory demo to scan two temporary Git repositories,
write a workspace file, validate it, list entries, and inspect one repo:

```sh
npm install
bash demo/local-workspace-inventory.sh
```

See [Local Workspace Inventory Demo](docs/tutorials/local-workspace-inventory.md)
for the walkthrough and
[video brief](docs/promo/local-workspace-inventory-video-brief.md) for a short
promotion script grounded in the same commands.

You can also run a fixture-backed scan demo:

```sh
bash demo/workspace-map.sh
```

The demo creates two temporary Git repositories, scans them, and writes YAML and
JSON workspace maps under `/tmp/repoctx-demo` or `$TMPDIR/repoctx-demo`.

Run the committed example workspace demo:

```sh
npm ci
bash demo/run-example-workspace.sh
```

The demo builds the CLI, lists the placeholder workspace, inspects the
`branchbrief` entry, and exports the workspace as JSON. A short promotion brief
for video or social drafting lives in [docs/promo/video-brief.md](docs/promo/video-brief.md).

Run a verification-command inventory demo:

```sh
bash demo/verification-command-inventory.sh
```

The demo scans npm and pnpm fixture repositories, validates the generated
workspace, and checks the detected command inventory. See
[docs/tutorials/verification-command-inventory.md](docs/tutorials/verification-command-inventory.md).
Promotion-ready hooks and a short video outline live in
[docs/promo/verification-command-inventory-hooks.md](docs/promo/verification-command-inventory-hooks.md)
and
[docs/promo/verification-command-inventory-video-brief.md](docs/promo/verification-command-inventory-video-brief.md).

See [docs/PRD.md](docs/PRD.md) for the full product definition.

## Workspace Handoff Demo

Run the example workspace handoff:

```sh
bash demo/run-workspace-handoff.sh
```

The script validates `examples/workspace.yaml`, lists the repos, inspects the
`branchbrief` entry, and exports JSON into `.repoctx-demo/`. See
[Workspace Handoff Demo](docs/tutorials/workspace-handoff.md) for the manual
commands and expected outputs.

## Runnable demo

Build the CLI, then run a temporary local workspace map flow:

```sh
npm run build
bash examples/local-workspace-demo.sh
```

The demo initializes a workspace file, adds this repository as an `oss-cli`,
lists and inspects it, validates the workspace, and exports JSON.

Run the local workspace map demo to create two disposable repositories, scan
them, and inspect the generated workspace file:

```sh
bash demo/run-local-workspace-map.sh
```

See [docs/tutorials/local-workspace-map.md](docs/tutorials/local-workspace-map.md)
for the walkthrough and [docs/promo/social-hooks.md](docs/promo/social-hooks.md)
for grounded promotion drafts.

For a shorter handoff clip using the committed example workspace:

```sh
npm run build
bash demo/run-agent-context-brief.sh
```

That script lists `examples/workspace.yaml`, inspects the `branchbrief` entry,
and checks that review-pack and forbidden-path boundaries appear in the brief.

To export the same public fixture as machine-readable context and a handoff
brief:

```sh
bash demo/run-agent-handoff-export.sh
```

See [docs/tutorials/agent-handoff-export.md](docs/tutorials/agent-handoff-export.md)
and [docs/promo/agent-handoff-export-social-hooks.md](docs/promo/agent-handoff-export-social-hooks.md).

## Demo and Promotion

- [Local workspace map demo](docs/tutorials/local-workspace-map.md)
- [Video brief](docs/promo/video-brief.md)
- [Social hooks](docs/promo/social-hooks.md)

## Development

If you are working on the TypeScript source, install dependencies and run the
project's local checks before opening a PR.

```sh
npm install
npm run release:check
```

The repository also contains local validation helpers and workflow docs for the
agent-oriented operating model.

## Safety and local-first notes

`repoctx` is intentionally local-first. It is meant to help agents understand a
workspace before acting, not to hide risky mutations behind opaque automation.

## License

MIT
