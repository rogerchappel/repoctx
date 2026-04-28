# Examples

The `examples/` directory contains safe, placeholder workspace files. They are examples only and should not be treated as Roger's private machine state.

## Files

- `examples/workspace.yaml`: compact YAML workspace with representative fields.
- `examples/workspace.json`: JSON version for tools that prefer machine-readable input.
- `examples/rogerchappel-workspace.yaml`: larger example with the repos named in the PRD.

## Placeholder paths

Example paths use forms such as:

```text
~/Developer/example/branchbrief
~/Developer/example/product-videogen
```

Replace them with real local paths in a private workspace file. Do not commit credentials, tokens, customer names, private filesystem details, or secret values.

## Minimal example

```yaml
version: "0.1"
workspace: example-workspace
repos:
  branchbrief:
    path: ~/Developer/example/branchbrief
```

## Full example

Use fuller entries when agents need verification and risk context:

```yaml
repos:
  product-videogen:
    path: ~/Developer/example/product-videogen
    remote: git@github.com:example/product-videogen.git
    type: product
    default_base: main
    package_manager: npm
    commands:
      install: npm ci
      test: npm test
      build: npm run build
    risk:
      production_sensitive: true
      forbidden_by_default:
        - .env*
        - secrets/**
      high_risk_paths:
        - auth/**
        - billing/**
        - production/**
    agents:
      requires_branch: true
      requires_pr: true
      review_pack_required: true
      human_approval_required: true
```

## Validation expectations

Committed examples use placeholder paths, so runtime path validation may report them as missing. That is expected for public examples. A future validator may support an example mode that skips local path existence checks.
