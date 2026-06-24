# Local Workspace Map Launch Note

`repoctx` now has a compact local demo for showing how an agent-readable
workspace map is created from disposable Git repositories.

## What changed

- `README.md` links directly to `demo/run-local-workspace-map.sh`.
- `docs/tutorials/local-workspace-map.md` explains the generated workspace
  file and the `list` and `inspect` follow-up commands.
- `docs/promo/social-hooks.md` provides grounded post drafts for the same
  local-first demo.

## Suggested post

I added a `repoctx` demo that creates two temporary Git repositories, scans
them, writes a YAML workspace map, then runs `repoctx list` and `repoctx
inspect` against it. It is a small way to show the "inspect before acting"
workflow for local agent tooling.

Run it:

```sh
bash demo/run-local-workspace-map.sh
```

## Do not claim

- production adoption
- benchmark speed
- full semantic repository understanding
