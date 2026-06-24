# Agent context brief demo

This recipe uses the committed `examples/workspace.yaml` file to show how a
repoctx workspace map can become a quick handoff brief before an agent changes a
repository.

## What the demo proves

- `repoctx list` can show the configured repositories in a workspace file.
- `repoctx inspect branchbrief` prints the commands, docs, risk boundaries, and
  PR policy for one repo.
- The example keeps paths and remotes fictional so the demo is safe for public
  screenshots.
- The script checks that review-pack and forbidden-path boundaries are present
  in the handoff text.

## Run it from a checkout

```sh
npm install
npm run build
bash demo/run-agent-context-brief.sh
```

The script writes `repos.txt` and `branchbrief-context.txt` under
`${TMPDIR:-/tmp}/repoctx-agent-context-brief`.

## Manual commands

```sh
node dist/cli.js list --workspace examples/workspace.yaml
node dist/cli.js inspect branchbrief --workspace examples/workspace.yaml
```

## Promotion angle

Use this demo for a short "show the context first" clip: list the workspace,
inspect one repo, and point to the exact verification and safety boundaries an
agent should honor before opening a branch.
