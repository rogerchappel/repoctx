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

# repoctx Social Hook Pack

These drafts are grounded in the current README, examples, and CLI behavior.

## Workspace Map Angle

Agents waste time rediscovering the same repo facts: where projects live, which
commands are available, what docs exist, and which paths need care.

repoctx turns a local workspace into a reusable YAML or JSON map that other
tools can read before they act.

Demo: `bash demo/workspace-map.sh`.

## Multi-Repo Review Angle

Before an agent touches a multi-repo workspace, give it a context file instead
of asking it to infer everything from scratch.

repoctx scans local Git repositories and records project metadata, package
signals, documentation signals, and verification commands in one local file.

## Limitation-Aware Post

repoctx is local-first context plumbing, not a deploy bot and not a replacement
for human approval.

Its job is to make workspace facts explicit so downstream tools can plan with
less guesswork.

## Short hooks

Use these drafts with the local workspace map demo. Keep captions grounded in
the committed script and avoid implying broad production adoption.

1. Before an agent edits a repo, ask it to print the workspace map it is using.
2. `repoctx` turns local Git folders into an agent-readable map: repo names,
   package hints, docs, workflows, and verification commands.
3. The demo creates two temporary repositories, scans them, then runs `list`
   and `inspect` against the generated YAML file.
4. A workspace map is the difference between "guess what is here" and "show me
   the local facts first."
5. Local-first agent tooling should make repository context visible before it
   starts changing files.
6. `repoctx` gives agents a local workspace map: repo paths, types, tags,
   defaults, and exports that downstream tools can consume.
7. Before an agent edits a multi-repo workspace, give it the map. `repoctx`
   turns local repo context into reviewable YAML or JSON.

## Demo caption

I made a disposable two-repo workspace, then used `repoctx` to generate a YAML
map and inspect one repo from it. No hosted service, no private repo metadata in
the fixture, just local Git repositories and deterministic command discovery.

Run it:

```sh
bash demo/run-local-workspace-map.sh
```

Shorter handoff clip:

```sh
npm run build
bash demo/run-agent-context-brief.sh
```

Current checkout demo:

```sh
npm run build
bash examples/local-workspace-demo.sh
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
