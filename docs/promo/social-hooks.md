# Social Hooks

These drafts are grounded in the current repoctx README, CLI commands, and checked-in example workspace.

## Multi-Repo Context

Multi-repo agents keep rediscovering the same facts: where repos live, how they are verified, and which docs or policies matter before editing.

repoctx turns that into a local workspace file that can be listed, inspected, exported, and validated before an agent starts work.

Demo: run `bash demo/example-workspace-review.sh` to export the example workspace, list entries, and inspect the `branchbrief` context.

## Review Prep

Before handing a workspace to an agent, run repoctx against a local workspace file.

Use `repoctx list` for the scan-friendly overview, `repoctx inspect <name>` for one repo's commands and risk context, and `repoctx export --format json` for downstream tools that prefer machine-readable context.

## Limitation-Aware Post

repoctx is not a secret store and the public examples intentionally use placeholder paths.

The useful bit is the shape: repos, package managers, verification commands, docs, integration hints, and risk defaults in a local-first file agents can read.
