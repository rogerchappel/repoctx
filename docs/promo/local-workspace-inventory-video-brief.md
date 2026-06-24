# Video Brief: Local Workspace Inventory

## Angle

Show `repoctx` as the first step before assigning agent work across several
local repositories: scan the workspace, validate the generated context, then
inspect one repo before deciding what to edit.

## Demo Beats

1. Start with an empty temporary folder that contains two tiny Git repos.
2. Run `bash demo/local-workspace-inventory.sh`.
3. Highlight the `repoctx scan` line that writes a YAML workspace.
4. Show `repoctx validate` confirming that the generated file is usable.
5. Show `repoctx list` and `repoctx inspect api-service` as the handoff view an
   agent or maintainer can read before changing code.

## Proof Points to Say Out Loud

- The demo uses local Git repositories and does not require a hosted service.
- The output is a plain YAML workspace file that can be reviewed in a PR.
- The follow-up commands validate and inspect the same generated artifact.

## Limitations to Mention

- The demo uses small fixture repositories so it is safe to run anywhere.
- It demonstrates repository discovery and context inspection, not automated
  task dispatch or pull request creation.
