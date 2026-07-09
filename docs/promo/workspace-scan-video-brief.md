# Workspace Scan Video Brief

## Angle

Show `repoctx` turning a local repository into an agent-readable workspace map, then validating and listing that context before another tool acts on it.

## Grounded demo beats

1. Start with the checked-in `repoctx` repo and mention that it is local-first workspace context tooling for agentic development workflows.
2. Run `bash demo/run-workspace-scan.sh`.
3. Show the script building the CLI, scanning the current repo, validating the generated workspace file, and listing the discovered entry.
4. Open `/tmp/repoctx-demo/workspace.json` and point at concrete fields such as path, remote, branch, package manager, docs, and commands.
5. Close on the review value: agents can consume one explicit workspace map instead of rediscovering repository facts every run.

## Suggested short script

```text
Before an agent edits a repo, it needs context: where the repo lives, what it runs, and which docs or guardrails exist.

repoctx scans that local context into a reusable workspace map.

This demo builds the CLI, scans the repo, validates the generated map, and lists the configured entry. The output is plain JSON, so it can feed other local tools or review automation without calling a hosted service.
```

## Capture checklist

- Terminal: `bash demo/run-workspace-scan.sh`
- File view: `/tmp/repoctx-demo/workspace.json`
- README line: local-first workspace map for multi-repo development
- Limitation to say plainly: the map reflects local repository metadata; it is not a hosted inventory service.
