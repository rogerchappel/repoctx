# Workspace Map Demo

This demo builds a temporary `repoctx` workspace around the current checkout and
exports it as JSON for downstream tools.

## Run it

```bash
npm install
bash demo/workspace-map-demo.sh
```

The script writes temporary files under:

```text
${TMPDIR:-/tmp}/repoctx-workspace-demo
```

## Commands exercised

The demo uses the real CLI commands in sequence:

```bash
node dist/cli.js init --output "$workspace_file" --force
node dist/cli.js add repoctx \
  --path "$repo_root" \
  --remote "https://github.com/rogerchappel/repoctx.git" \
  --type oss-cli \
  --default-base main \
  --tag demo \
  --workspace "$workspace_file"
node dist/cli.js validate --workspace "$workspace_file"
node dist/cli.js list --workspace "$workspace_file"
node dist/cli.js inspect repoctx --workspace "$workspace_file"
node dist/cli.js export --workspace "$workspace_file" --format json --output "$json_file"
```

It then checks that the JSON export contains the workspace schema version, the
`repoctx` entry, and the `demo` tag.

## Promotion angle

This is a short, local-first walkthrough for showing how `repoctx` can turn a
checkout into an explicit workspace map that agents and maintainers can inspect
before editing.

## Example workspace variant

This demo shows how Repoctx turns a workspace file into agent-readable context
without touching any target repositories.

### Run the committed example

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
