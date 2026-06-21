# repoctx Video Brief

## Promise

Show how `repoctx` turns a set of local repository facts into a reusable
workspace map that agents and developer tools can inspect before acting.

## Demo flow

```sh
npm ci
bash demo/run-example-workspace.sh
```

The script builds the local CLI, lists the placeholder workspace, inspects the
`branchbrief` entry, and exports the same workspace as JSON.

## Grounded talking points

- `repoctx` keeps workspace context in explicit files instead of relying on each
  agent to rediscover repo paths, commands, docs, and risk notes.
- The committed examples use placeholder paths so they are safe for public docs.
- The CLI supports YAML and JSON output for downstream tools.
- Validation may warn on placeholder paths when users point it at public example
  files; private workspace files should use real local paths.
