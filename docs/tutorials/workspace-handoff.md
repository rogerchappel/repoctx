# Workspace Handoff Demo

`repoctx` turns a local multi-repo map into reviewable context for agents and
developer tools. This demo uses the checked-in `examples/workspace.yaml` file.

## Run the handoff script

```sh
bash demo/run-workspace-handoff.sh
```

The script builds the CLI, validates the example workspace, lists the repos,
inspects the `branchbrief` entry, and exports JSON for downstream tooling.

Generated files:

- `.repoctx-demo/validate.txt`
- `.repoctx-demo/list.txt`
- `.repoctx-demo/branchbrief.txt`
- `.repoctx-demo/workspace.json`

## Manual commands

```sh
npm run build
node dist/cli.js validate --workspace examples/workspace.yaml
node dist/cli.js list --workspace examples/workspace.yaml
node dist/cli.js inspect branchbrief --workspace examples/workspace.yaml
node dist/cli.js export --workspace examples/workspace.yaml --format json
```

## What to look for

- Validation confirms the workspace shape is usable.
- The list view gives a compact index of repo names, types, tags, and paths.
- The inspect view shows handoff details such as commands, risk defaults, and
  agent requirements.
- The JSON export is suitable for tools that should consume structured context
  instead of scraping README text.

The example uses placeholder paths and remotes. Replace them in a private
workspace file before using `repoctx` for real local development.
