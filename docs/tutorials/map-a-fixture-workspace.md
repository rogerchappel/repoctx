# Map a Fixture Workspace

This tutorial shows a small local-first repoctx workflow: create two placeholder
Git repositories, scan them, and write both YAML and JSON workspace maps.

## Run it

```sh
bash demo/workspace-map.sh
```

The script creates a temporary workspace under `/tmp` or `$TMPDIR`, initializes
two local Git repositories, builds the CLI, and runs:

```sh
node dist/cli.js scan "$FIXTURE_DIR" --output "$REPORT_OUT" --format yaml
node dist/cli.js scan "$FIXTURE_DIR" --output "$JSON_OUT" --format json
```

## Outputs

The generated files are written under `/tmp/repoctx-demo` by default:

- `workspace-map.yaml`: workspace context for humans and YAML-native tools.
- `workspace-map.json`: equivalent context for automation.

## What to check

Confirm that both placeholder repos appear in the outputs. The demo is safe to
rerun because it recreates only its own temporary fixture directory.
