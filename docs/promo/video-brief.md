# Video Brief: Give Agents a Local Workspace Map

## Viewer

Developers who run agents across several local repositories and want an explicit map of paths, repo types, tags, and defaults.

## Demo arc

1. Start with the cost of rediscovering repo context in every session.
2. Run `npm run build`.
3. Run `bash examples/local-workspace-demo.sh`.
4. Show the generated `workspace.yaml` flow: init, add, list, inspect, validate, export JSON.
5. Close on the local-first boundary: the demo only reads local files and writes temporary outputs.

## On-screen commands

```sh
npm run build
bash examples/local-workspace-demo.sh
node dist/cli.js export --workspace /tmp/workspace.yaml --format json
```

## Honest limitations

- `repoctx` maps local workspace facts; it does not run package checks or mutate repos.
- The demo adds one repo entry. Larger workspaces should tag entries consistently so agents can filter them.
- The project is still early and the full command set is evolving.
