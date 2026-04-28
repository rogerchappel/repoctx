# Validation

`repoctx validate` is planned to check that a workspace file is useful, internally consistent, and safe enough for agents to consume.

## Expected checks

V1 validation should check:

- workspace file exists
- repo names are unique
- repo paths exist
- repo paths are Git repositories
- repo types are supported values
- default branch is present or reported as missing
- remote is present or reported as missing
- command fields are strings
- package commands reference scripts that exist when package metadata is available
- production-sensitive repos define forbidden or high-risk paths
- agent-enabled repos declare branch and review policy
- `docs_url` values look like URLs when present

## Human-readable output

Validation should be understandable in terminal output:

```text
✓ branchbrief: path exists
✓ branchbrief: git repo detected
✓ branchbrief: npm scripts detected
⚠ branchbrief: docs_url missing
⚠ product-videogen: production_sensitive true but no high_risk_paths configured
✗ old-repo: path does not exist
```

Warnings should identify incomplete context. Errors should identify context that prevents safe use.

## JSON output

JSON validation output is useful for integration later, but V1 can be text-first. When JSON is added, keep it stable and include repo key, severity, check id, and message.

## Contributor guidance

Validation should prefer actionable messages over clever inference. If the tool cannot know whether a repo is production-sensitive, it should ask the workspace author to classify it instead of guessing from names alone.
