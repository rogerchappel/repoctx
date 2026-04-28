# CrewCMD

CrewCMD dispatches queued work to agents and worktrees. `repoctx` can help CrewCMD choose the right repo, branch policy, safety constraints, and verification commands.

## Planned usage

```sh
crewcmd dispatch queue.yaml --workspace workspace.yaml
```

The command above belongs to CrewCMD. `repoctx` provides the workspace context file.

## Context CrewCMD can use

- local repo paths
- default base branches
- repo tags and types
- required branch and PR policy
- production-sensitive flags
- forbidden and high-risk paths
- install, test, build, lint, and typecheck commands
- preferred agent hints

## Dispatch guidance

CrewCMD should treat repoctx risk fields as escalation rules. For example, if a queued task targets a production-sensitive repo and touches `billing/**`, CrewCMD should require explicit human approval before dispatch.

## Workspace example

```yaml
repos:
  crewcmd:
    path: ~/Developer/my-opensource/crewcmd
    type: oss-cli
    integrations:
      crewcmd: true
    agents:
      requires_branch: true
      requires_pr: true
      review_pack_required: true
```

## Integration boundary

`repoctx` should not dispatch agents, create worktrees, or open PRs in V1. It should make CrewCMD dispatch safer by providing context.
