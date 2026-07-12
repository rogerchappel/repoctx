# Agent Context Brief Hooks

Grounded in `demo/run-agent-context-brief.sh` and
`docs/tutorials/agent-context-brief.md`.

## Short hooks

- `repoctx` can turn a checked-in workspace fixture into a brief an agent can
  read before touching a repo.
- The agent-context demo lists `examples/workspace.yaml`, inspects the
  `branchbrief` entry, and checks that review-pack and forbidden-path
  boundaries survive in the output.
- Local workspace context is more useful when it includes both what to inspect
  and what to avoid.

## Clip outline

1. Build the CLI with `npm run build`.
2. Run `bash demo/run-agent-context-brief.sh`.
3. Show the `branchbrief` entry from `examples/workspace.yaml`.
4. Highlight the review-pack notes and forbidden-path boundary in the generated
   brief.
5. Close on the local-first workflow: map the workspace, then hand a bounded
   context brief to the agent.
