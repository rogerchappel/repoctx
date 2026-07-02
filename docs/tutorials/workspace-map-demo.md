# Workspace Map Demo

This demo shows how Repoctx turns a workspace file into agent-readable context
without touching any target repositories.

## Run the demo

```sh
bash demo/run-workspace-map-demo.sh
```

The script builds the CLI, prints help, lists the repositories in
`examples/workspace.yaml`, exports the same workspace as JSON, and checks the
exported repository count.

## Manual commands

```sh
npm run build
node dist/cli.js list --workspace examples/workspace.yaml
node dist/cli.js export --workspace examples/workspace.yaml --format json
```

## What to show in a recording

- `examples/workspace.yaml` as the source map.
- `repoctx list` for a human-readable inventory.
- The JSON export for tools that need structured workspace context.
- The risk and agent policy fields on the example repos.

## Limits to mention

The committed example paths are placeholders. Commands that inspect the actual
local repository path, such as path validation or deep repository inspection,
should be run against a private workspace file with real paths.
