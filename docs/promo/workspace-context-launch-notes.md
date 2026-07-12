# Workspace Context Launch Notes

These notes are grounded in the existing runnable demos:

- `bash demo/run-agent-context-brief.sh`
- `bash demo/run-agent-handoff-export.sh`
- `bash demo/verification-command-inventory.sh`

## Positioning

`repoctx` turns local repository facts into agent-readable workspace context:
repository entries, verification commands, path boundaries, docs references,
and handoff-ready JSON.

Use it as the setup step before asking an agent or queue runner to work across
multiple repositories. The tool is local-first and works from checked-in
workspace files or temporary scan fixtures.

## What to show

1. Open `examples/workspace.yaml` and point out the `branchbrief` entry.
2. Run `bash demo/run-agent-context-brief.sh`.
3. Show the generated brief preserving verification commands and path
   boundaries.
4. Run `bash demo/run-agent-handoff-export.sh`.
5. Show the exported JSON and handoff text as inputs for a downstream agent.

## Safe claims

- Scans and exports local workspace context.
- Preserves verification commands for review.
- Produces JSON that downstream tools can read.
- Keeps the workflow local; it does not dispatch agents or mutate repos by
  itself.

## Avoid claiming

- Automatic code review.
- Guaranteed risk detection.
- Hosted workspace synchronization.
- Production agent orchestration.

## Short posts

- Multi-repo agents need context before commands. `repoctx` exports local
  workspace facts and verification hints into reviewable JSON.
- Before handing work to an agent, show it the map: repos, commands, boundaries,
  and docs links. That is the `repoctx` lane.
- The demo does not mutate your repos. It lists, inspects, and exports the
  workspace context an agent should read first.
