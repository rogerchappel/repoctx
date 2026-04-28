# Integrations

`repoctx` is intended to be a shared local context layer for agentic development tools. It should not replace those tools or dispatch work itself in V1.

## taskbrief

taskbrief can use a workspace file to map unstructured task input to repo context:

```sh
taskbrief parse brain-dump.txt --workspace workspace.yaml
```

Useful fields:

- repo names and tags
- local paths
- docs URLs
- verification commands
- risk policy
- agent review requirements

## branchbrief

branchbrief can use repo context to improve pull request review summaries:

```sh
branchbrief --workspace workspace.yaml
```

Potential uses:

- classify touched paths against repo-specific risk policy
- suggest verification commands
- include docs URLs
- call out branch and review pack requirements

This is a future integration path unless branchbrief support exists in the active branch.

## CrewCMD

CrewCMD can use workspace context when dispatching queued tasks:

```sh
crewcmd dispatch queue.yaml --workspace workspace.yaml
```

Useful fields:

- local repo path
- default base branch
- branch and PR requirements
- production sensitivity
- allowed and forbidden paths
- verification commands

## Codex, OpenClaw, Claude Code, and Copilot

Agents can read workspace files before choosing a repo, opening files, or proposing edits. The most important fields are `path`, `commands`, `risk`, and `agents`.

## Integration contract

Integrations should treat the workspace as advisory context. A missing command or unknown repo type should not be interpreted as permission to guess risky behavior. When context is incomplete, ask for clarification or run read-only inspection.
