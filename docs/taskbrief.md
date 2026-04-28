# taskbrief

taskbrief turns messy input into structured tasks. `repoctx` can provide the repo map taskbrief needs to route work safely.

## Planned usage

```sh
taskbrief parse brain-dump.txt --workspace workspace.yaml
```

The command above belongs to taskbrief. `repoctx` provides the `workspace.yaml` context file.

## Context taskbrief can use

- repo keys and tags for task routing
- local paths for agent handoff
- repo type for expected workflow
- docs URLs for task enrichment
- verification commands for acceptance criteria
- risk paths for escalation rules
- branch and PR policy for execution planning

## Example task routing

If a task mentions "update branchbrief release docs", taskbrief can look up:

```yaml
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
    type: oss-cli
    commands:
      test: npm test
      typecheck: npm run typecheck
    agents:
      requires_branch: true
      review_pack_required: true
```

It can then produce a task that names the repo, expected branch policy, relevant docs, and verification command.

## Safety notes

taskbrief should not treat missing repoctx fields as permission to skip checks. Missing risk policy should become an explicit uncertainty in the generated task.
