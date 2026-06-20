# repoctx Social Hook Pack

Use these drafts with the local workspace map demo. Keep captions grounded in
the committed script and avoid implying broad production adoption.

## Short hooks

1. Before an agent edits a repo, ask it to print the workspace map it is using.
2. `repoctx` turns local Git folders into an agent-readable map: repo names,
   package hints, docs, workflows, and verification commands.
3. The demo creates two temporary repositories, scans them, then runs `list`
   and `inspect` against the generated YAML file.
4. A workspace map is the difference between "guess what is here" and "show me
   the local facts first."
5. Local-first agent tooling should make repository context visible before it
   starts changing files.

## Demo caption

I made a disposable two-repo workspace, then used `repoctx` to generate a YAML
map and inspect one repo from it. No hosted service, no private repo metadata in
the fixture, just local Git repositories and deterministic command discovery.

Run it:

```sh
bash demo/run-local-workspace-map.sh
```

## Thread outline

1. Problem: agents and scripts often rediscover the same repo facts on every
   task.
2. Demo: run `demo/run-local-workspace-map.sh` to create two temporary repos and
   write `/tmp/repoctx-local-workspace-demo/repoctx-workspace.yaml`.
3. Evidence: show `agent-notes`, `policy-kit`, discovered project types, docs,
   workflows, and command hints in the generated map.
4. Close: `repoctx list` and `repoctx inspect` turn the map into a reusable
   context artifact for agent handoffs.

## Constraints

Do not claim the scanner fully understands arbitrary build systems. The current
demo proves local Git discovery, project-shape hints, workflow/docs detection,
and workspace file reuse over simple committed fixtures.
