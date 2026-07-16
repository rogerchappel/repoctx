# Verification Inventory Demo

This recipe uses the checked-in `examples/workspace.yaml` fixture to show how
`repoctx` can turn repository metadata into a quick verification inventory for
agent handoffs.

## Run it

```sh
bash examples/verification-inventory-demo.sh
```

The script builds the CLI, lists configured repos, inspects the `branchbrief`
entry, exports the workspace as JSON, and checks that the output still includes:

- the `branchbrief` repository entry
- the documented `npm test` verification command
- the `review_pack_required` agent policy flag

## Why it is useful

The fixture is intentionally small, but it mirrors the information an agent
needs before touching a repo: where the project lives, which commands are safe
to run, whether review packs are required, and which paths are risky.
