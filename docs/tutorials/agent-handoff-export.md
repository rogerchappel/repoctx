# Agent Handoff Export Demo

This recipe uses the committed `examples/workspace.yaml` file to produce two
handoff artifacts from the same public fixture workspace:

- a JSON workspace export for tools that prefer machine-readable input
- a text inspection brief for the `branchbrief` repository entry

## Run it

```sh
npm install
bash demo/run-agent-handoff-export.sh
```

The script builds the CLI, writes artifacts under
`${TMPDIR:-/tmp}/repoctx-agent-handoff-export`, and verifies that the exported
JSON and text brief both include review-pack and forbidden-path boundaries.

## Evidence files

- `workspace.json`: JSON export of the example workspace.
- `branchbrief.txt`: human-readable context for one repo.

Use this demo when showing how repoctx can give an agent both structured
workspace data and a reviewer-friendly handoff note before work starts.
