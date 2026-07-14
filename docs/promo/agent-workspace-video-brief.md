# Video Brief: Agent-Readable Workspace Maps

## Positioning

Show `repoctx` as a small local CLI for turning a multi-repo workspace file into
context an agent can list, inspect, validate, and export before touching code.

## Grounded demo beats

1. Open `examples/workspace.yaml` and note that it uses placeholder paths and
   public example remotes, not private machine state.
2. Run `npm run build`.
3. Run `bash examples/agent-workspace-demo.sh`.
4. Show the `list` output for the configured repos.
5. Inspect the `branchbrief` entry to surface path, remote, type, commands,
   integrations, tags, and agent review settings.
6. Export the same workspace as JSON for a downstream tool.

## Demo script

```sh
npm run build
bash examples/agent-workspace-demo.sh
```

## What to say plainly

- `repoctx` is local-first workspace context, not a task runner.
- Example paths are placeholders and should be replaced in private workspace
  files.
- The checked-in examples model verification commands, forbidden paths, risk
  notes, and agent review requirements.

## Limits

Committed examples may contain placeholder paths that do not exist on a user's
machine. That is expected for public docs; private workspaces should point at
real local repositories.
