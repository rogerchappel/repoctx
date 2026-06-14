# Local Workspace Map Demo

This recipe builds a disposable two-repo workspace and asks `repoctx` to turn it
into a reusable workspace file. It is useful when you want to show how an agent
can discover repository shape before making changes.

## Run it

```sh
bash demo/run-local-workspace-map.sh
```

The script creates two temporary Git repositories under
`/tmp/repoctx-local-workspace-demo/workspace`, builds the local CLI, scans the
workspace, and writes:

```text
/tmp/repoctx-local-workspace-demo/repoctx-workspace.yaml
```

## What to Look For

The generated map should include both demo repositories:

- `agent-notes`, an npm project with discovered `test` and `build` command
  hints.
- `policy-kit`, a Python-style project with a `pyproject.toml`.

The script also runs `repoctx list` and `repoctx inspect` against the generated
workspace file so the output demonstrates both broad discovery and one-repo
inspection.

## Promotion Angle

This demo is grounded in local files only. There is no GitHub API call, no
network service, and no private workspace state in the committed fixtures. That
makes it a good short screencast for the "agents should inspect before acting"
message.
