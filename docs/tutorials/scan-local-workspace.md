# Scan a Local Workspace

This tutorial shows how `repoctx scan` turns a directory of Git repositories
into a reusable workspace map for agents and maintainer tooling.

## Run the Demo

```sh
npm install
bash examples/scan-workspace-demo.sh
```

The script creates a temporary Git repository with a README, npm scripts, a
package lockfile, and an `origin` remote. It then runs:

```sh
node dist/cli.js scan "$REPO_DIR" --output "$WORKSPACE_FILE" --format json
node dist/cli.js validate --workspace "$WORKSPACE_FILE"
node dist/cli.js inspect demo-app --workspace "$WORKSPACE_FILE"
```

## What to Look For

The generated workspace file includes the discovered repo path, remote,
default branch, package manager, README path, and safe verification commands.
`repoctx validate` checks that the workspace is usable, and `repoctx inspect`
prints the context for a single repo.

## Safety Notes

The demo only writes to a temporary directory under `${TMPDIR:-/tmp}`. It does
not mutate existing repositories, call hosted APIs, dispatch agents, or open
pull requests.
