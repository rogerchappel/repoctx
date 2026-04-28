# branchbrief

branchbrief summarizes completed branch work for review. `repoctx` can provide repo-specific context that makes those summaries more accurate.

## Planned usage

```sh
branchbrief --workspace workspace.yaml
```

The command above belongs to branchbrief. `repoctx` provides the workspace file.

## Context branchbrief can use

- default base branch
- docs URL
- repo type
- verification commands
- production sensitivity
- high-risk and forbidden paths
- review pack requirement
- integration flags

## Example enrichment

Given:

```yaml
repos:
  product-videogen:
    type: product
    default_base: main
    commands:
      test: npm test
      build: npm run build
    risk:
      production_sensitive: true
      high_risk_paths:
        - auth/**
        - billing/**
    agents:
      review_pack_required: true
      human_approval_required: true
```

branchbrief can flag auth or billing changes as high-risk, suggest the configured verification commands, and remind reviewers when human approval is expected.

## Integration boundary

`repoctx` should not generate pull request summaries in V1. It should expose enough stable context for branchbrief to consume when that integration is implemented.
