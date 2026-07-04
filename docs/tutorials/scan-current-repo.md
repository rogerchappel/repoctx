# Scan The Current Repository

Use this recipe to turn one local Git checkout into a repoctx workspace entry
that another agent or maintainer can inspect.

The `scan` command reads repository metadata from the filesystem. In this repo
it detects the Git remote, default base branch, npm package manager, useful
verification commands, README, AGENTS instructions, and branchbrief integration
metadata.

## Run The Demo

```sh
npm install
bash examples/scan-current-repo-demo.sh
```

The demo writes both YAML and JSON workspace files to a temporary directory,
then runs `list`, `inspect`, and `validate` against the generated YAML file.

## Manual Commands

```sh
npm run build
node dist/cli.js scan "$PWD" --output /tmp/repoctx-workspace.yaml
node dist/cli.js scan "$PWD" --output /tmp/repoctx-workspace.json --format json
node dist/cli.js inspect repoctx --workspace /tmp/repoctx-workspace.yaml
node dist/cli.js validate --workspace /tmp/repoctx-workspace.yaml
```

Expected output includes:

- a `repoctx` repository entry
- `package_manager: npm`
- verification commands such as `npm test`, `npm run build`, and
  `npm run typecheck`
- local instruction files such as `README.md` and `AGENTS.md` when present

## Why This Helps

This gives a small, reproducible handoff for agent workflows. Instead of asking
each tool to rediscover the checkout, repoctx can export the repository facts
once and make them available as YAML or JSON.
