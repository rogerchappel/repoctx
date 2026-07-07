# Agent Handoff Export Social Hooks

Grounded hooks for `demo/run-agent-handoff-export.sh`.

## Short posts

1. Before an agent edits a repo, it should know the verification commands and
   path boundaries. repoctx can export both from a public workspace fixture.
2. The handoff demo writes a machine-readable workspace JSON file and a
   human-readable `branchbrief` inspection note from the same source.
3. Good agent context is not just a list of repos. It includes review-pack
   requirements, forbidden paths, docs links, and the commands that prove a
   change.

## Video beat

- Open `examples/workspace.yaml`.
- Run `bash demo/run-agent-handoff-export.sh`.
- Show `workspace.json` for structured context.
- Show `branchbrief.txt` for reviewer-friendly handoff text.
