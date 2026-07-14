# Release Readiness Handoff Hooks

## Short posts

- Release work starts better when the agent can see repo type, commands, docs,
  and risk flags before editing.
- This `repoctx` demo lists a sample workspace, inspects a release-sensitive
  repo, and exports JSON that keeps human-approval metadata visible.
- The fixture is intentionally public and placeholder-based: useful for a clip,
  not a claim about a real private release process.

## Clip outline

1. Show `examples/workspace.yaml` with two repos and explicit risk metadata.
2. Run `bash demo/release-readiness-handoff.sh`.
3. Open the exported JSON and highlight `production_sensitive` plus
   `human_approval_required`.
4. Close by positioning `repoctx` as context plumbing for agents and reviewers,
   not an automatic release dispatcher.
