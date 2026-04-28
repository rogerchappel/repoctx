# GitHub Copilot

This guidance describes how Copilot should be used in repoctx.

## Scope

- Prefer small, reviewable changes that match the existing TypeScript and docs
  patterns.
- Follow [AGENTS.md](../AGENTS.md) before editing.
- Do not touch secrets, production data, auth, billing, licensing, telemetry,
  package publishing, or public API compatibility without explicit maintainer
  approval.
- Do not document CLI behavior as implemented until the command is wired and
  verified.

## Verification

Copilot-assisted changes should include the smallest relevant verification:

- targeted unit test
- typecheck
- build
- docs or example validation

For docs and examples, run:

```sh
bash scripts/validate-repoctx.sh
```

For package behavior, prefer the narrowest relevant test first, then run broader
checks when the touched area is shared.

## Review Summary

Summaries should include:

```md
Summary:
Files changed:
Verification:
Risk:
Rollback:
Human decision needed:
```
