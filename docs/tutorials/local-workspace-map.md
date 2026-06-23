# Local Workspace Map Demo

This recipe shows how to create a small `repoctx` workspace map from a local checkout and export it as JSON for an agent or downstream script.

## Prerequisites

```sh
npm install
npm run build
```

## Run the demo

```sh
bash examples/local-workspace-demo.sh
```

The script writes a temporary `workspace.yaml`, adds the current repository as an `oss-cli`, lists the configured repos, inspects the entry, validates the workspace, and exports JSON.

## Manual flow

```sh
repoctx init --output workspace.yaml
repoctx add repoctx --workspace workspace.yaml --path . --type oss-cli --tag agent-context
repoctx list --workspace workspace.yaml
repoctx validate --workspace workspace.yaml
repoctx export --workspace workspace.yaml --format json
```

Use this when an agent needs a small, explicit map before touching a multi-repo workspace.
