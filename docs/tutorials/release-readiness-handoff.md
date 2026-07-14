# Release Readiness Handoff Demo

This recipe turns the checked-in example workspace into a small release-review
handoff. It is meant for maintainers who want to show how `repoctx` preserves
repo metadata, verification commands, and risk flags before an agent or human
starts release work.

## Run it

```sh
bash demo/release-readiness-handoff.sh
```

The script builds the CLI, lists workspace repos from `examples/workspace.yaml`,
inspects the `product-videogen` entry, and exports JSON under
`/tmp/repoctx-release-readiness-handoff`.

## Evidence checked

- The workspace still lists `branchbrief`.
- The `product-videogen` entry can be inspected by name.
- The JSON export preserves `production_sensitive: true`.
- The JSON export preserves `human_approval_required: true`.

The example uses placeholder paths and public sample metadata, so it is safe for
video clips or public docs without exposing a private workspace. Because the
paths are placeholders, this demo does not run `repoctx validate`; validation is
reserved for workspaces whose local paths exist on the recording machine.
