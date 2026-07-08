# Local workspace scan demo

This recipe creates two temporary Git repositories, scans them with `repoctx`,
and verifies that the generated workspace JSON contains both entries. It is
safe for public demos because it uses throwaway fixture repositories under
`${TMPDIR:-/tmp}`.

## Run

From a checkout:

```bash
npm install
bash examples/local-scan-demo.sh
```

The script writes a workspace file similar to:

```text
${TMPDIR:-/tmp}/repoctx-local-scan-demo/workspace.json
```

## What to inspect

- `api-service` has npm-style `test` and `build` commands detected from its
  `package.json` scripts.
- `docs-site` is detected from a separate Git repository containing a README.
- The command exits non-zero if either repository is missing from the generated
  workspace file.

## Promotion angle

This is the shortest repoctx story: point the CLI at a directory of local
repositories and get a machine-readable map that downstream agents can inspect
before editing. The demo does not read private workspace paths, call remote
APIs, or mutate existing checkouts.
