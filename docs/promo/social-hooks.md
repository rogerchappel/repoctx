# Repoctx Social Hooks

Grounded copy for public promotion. Pair these with the checked-in workspace
examples and CLI output.

## Short hooks

- Repoctx gives agents a reusable map of local repos, verification commands,
  docs, risk metadata, and review expectations.
- Demo arc: open `examples/workspace.yaml`, run `repoctx list`, then export the
  same context as JSON.
- The example workspace shows command, integration, risk, and agent policy
  fields without exposing private machine state.
- Repoctx is for context discovery and export; it does not dispatch agents or
  mutate target repos by default.

## Video prompt

Run `bash demo/run-workspace-map-demo.sh`, show the listed repo entries, and
then open `/tmp/repoctx-workspace.json` to highlight structured context for
downstream tools.
