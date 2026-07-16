# Verification Inventory Social Pack

Grounded demo: `bash examples/verification-inventory-demo.sh`

## Short hooks

- Before an agent edits a repo, it should know the repo's verification commands.
  `repoctx` makes that inventory explicit in a local workspace file.
- A workspace map is more useful when it includes review policy, risky paths,
  and test commands together. That is the `repoctx` demo in one sentence.
- The `repoctx` fixture shows `branchbrief` with install, test, build, and
  typecheck commands plus review-pack policy in one agent-readable file.

## Demo beat

1. Open `examples/workspace.yaml` and show the `branchbrief` command inventory.
2. Run `bash examples/verification-inventory-demo.sh`.
3. Open the generated JSON export and point to `review_pack_required`.
4. Close with the local-first constraint: no network call is needed to read the
   workspace map.
