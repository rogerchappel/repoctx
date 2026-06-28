# Local Workspace Map Video Brief

## Hook

"Before an agent edits a repo, make it show you what it thinks the workspace is."

## Demo Beats

1. Run `bash demo/run-local-workspace-map.sh`.
2. Show the generated `repoctx-workspace.yaml` in `/tmp`.
3. Point out repo names, command hints, docs/workflow discovery, and the
   per-repo `inspect` output.
4. Close with the local-first safety point: the demo uses temporary local Git
   repositories and does not call a hosted service.

## Suggested Caption

`repoctx` turns a local folder of Git repositories into an agent-readable
workspace map: repo names, project type, docs, command hints, and risk context
in one deterministic file.

## Constraints

Do not claim production adoption, benchmark speed, or full semantic repo
understanding. The demo shows deterministic local discovery over simple Git
fixtures.
