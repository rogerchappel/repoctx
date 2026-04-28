# Risk Policy

`repoctx` risk fields tell agents when to slow down, avoid paths, or ask for human approval. They are context hints, not a permission system.

## Default posture

For unknown repositories, agents should assume:

- branch required
- review pack required
- no production data mutation
- no secret reading
- no destructive commands
- forbidden paths are off-limits unless a human explicitly approves the task

Recommended workspace defaults:

```yaml
defaults:
  default_base: main
  requires_branch: true
  review_pack_required: true
  forbidden_by_default:
    - .env*
    - secrets/**
    - credentials/**
```

## Production-sensitive repos

Mark a repo as production-sensitive when it controls customer-facing services, production infrastructure, billing, authentication, private data, or company/client operations:

```yaml
risk:
  production_sensitive: true
  forbidden_by_default:
    - .env*
    - secrets/**
  high_risk_paths:
    - auth/**
    - billing/**
    - migrations/**
    - production/**
agents:
  requires_branch: true
  requires_pr: true
  review_pack_required: true
  human_approval_required: true
```

## Forbidden paths

`forbidden_by_default` means an agent should not edit, delete, or inspect contents without explicit human direction. Examples:

```text
.env*
secrets/**
credentials/**
private/**
```

The scanner may detect file existence, but it should not read secret contents.

## High-risk paths

`high_risk_paths` identify areas that often need human approval or extra verification:

```text
auth/**
billing/**
payments/**
migrations/**
production/**
.github/workflows/**
```

High-risk does not always mean forbidden. It means the review and verification bar is higher.

## Medium-risk paths

`medium_risk_paths` are paths where agents can usually work, but should report impact clearly:

```text
package.json
lockfiles
release config
CI config
public API docs
```

## Review packs

For risky repos, downstream agents should report branch, files changed, verification, rollback plan, and human decisions needed. The workspace can require this through:

```yaml
agents:
  review_pack_required: true
```
