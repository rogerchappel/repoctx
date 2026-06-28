# repoctx Workspace Handoff Hooks

Grounding: `repoctx` currently validates, lists, inspects, scans, and exports
local workspace maps for agentic development workflows.

## Short posts

1. `repoctx` makes multi-repo context explicit: repo paths, commands, docs,
   risk defaults, and agent requirements in one local workspace file.

2. Demo idea: validate `examples/workspace.yaml`, inspect one repo entry, then
   export JSON that an agent can consume without rereading every README.

3. Agent workflows get safer when workspace facts are structured before the
   model starts editing. `repoctx` is a small local-first map for that handoff.

## Video beats

1. Run `bash demo/run-workspace-handoff.sh`.
2. Open `.repoctx-demo/list.txt` to show the compact workspace index.
3. Open `.repoctx-demo/branchbrief.txt` to show commands and review
   requirements.
4. Open `.repoctx-demo/workspace.json` to show the machine-readable export.

## Limits to mention

- The checked-in workspace uses placeholder paths.
- It is local-first and does not replace repo-specific verification.
- It gives agents context; it does not grant approval to mutate repositories.
