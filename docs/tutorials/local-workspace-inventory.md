# Local Workspace Inventory Demo

This recipe shows how to turn a local folder of Git repositories into a
reviewable `repoctx` workspace file. It is useful before handing a multi-repo
task queue to an agent, because it records where repos live, which project
signals were detected, and which commands are likely to verify changes.

## What the Demo Covers

- Creates two temporary Git repositories: an API package and a docs package.
- Runs `repoctx scan` across the parent directory.
- Writes the discovered workspace as YAML.
- Runs `repoctx validate`, `repoctx list`, and `repoctx inspect` against the
  generated workspace.

The demo uses temporary files under `${TMPDIR:-/tmp}` and does not modify the
checkout except for building `dist/`.

## Run It

```sh
npm install
bash demo/local-workspace-inventory.sh
```

Expected output includes:

```text
Scanned 2 repo(s)
ok workspace is valid
api-service
docs-site
```

The generated workspace is written to:

```text
${TMPDIR:-/tmp}/repoctx-local-workspace-demo/repoctx-workspace.yaml
```

## Why This Helps

For a content or demo workflow, this gives reviewers a concrete before/after
artifact: local repositories go in, a machine-readable workspace map comes out,
and the follow-up commands prove that the map can be validated and inspected.
That makes `repoctx` easier to show in a short screencast or handoff note
without requiring access to a private workspace.
