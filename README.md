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

See [docs/PRD.md](docs/PRD.md) for the full product definition.

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
