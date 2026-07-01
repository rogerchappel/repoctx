# Short Video Brief: Example Workspace Review

## Goal

Show how repoctx turns a workspace file into a reviewable map for agentic development.

## Grounded Demo Path

1. Open `examples/workspace.yaml` and point out the two placeholder repos, command fields, tags, integrations, and risk settings.
2. Run `npm run build`.
3. Run `bash demo/example-workspace-review.sh`.
4. Open the generated list report and inspect report from `/tmp/repoctx-example-workspace`.
5. Explain how the JSON export can feed downstream tools without exposing private paths in public examples.

## Talking Points

- The public examples use placeholders on purpose.
- The CLI can list, inspect, validate, scan, and export workspace context.
- repoctx is useful before agent work because it names verification commands and risk defaults up front.

## Honest Limits

repoctx does not make local paths public-safe by itself. Private workspace files still need normal secret and path hygiene before sharing.
