# Social Hooks

## Short posts

1. `repoctx` gives agents a local workspace map: repo paths, types, tags, defaults, and exports that downstream tools can consume.

2. New fixture-free `repoctx` demo: init a temporary workspace, add the current repo, list, inspect, validate, and export JSON without touching your checkout.

3. Before an agent edits a multi-repo workspace, give it the map. `repoctx` turns local repo context into reviewable YAML or JSON.

## Demo CTA

```sh
npm run build
bash examples/local-workspace-demo.sh
```

## Grounding facts

- Commands demonstrated: `init`, `add`, `list`, `inspect`, `validate`, and `export`.
- The demo writes to a temporary directory.
- Export formats include YAML and JSON.
