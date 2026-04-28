# GitHub Actions

repoctx uses GitHub Actions for package verification and lightweight repository
hygiene.

## Current workflows

- `CI` installs dependencies, runs tests, typechecks, builds the package, and
  performs repository hygiene checks.
- `Docs` validates markdown presence and the docs directory.
- `branchbrief` creates a pull request review artifact.

The workflows should not require repository secrets for normal pull request
validation. Keep permissions explicit and read-only unless a future workflow has
a specific reviewed need for write access.

## Local validation

Run the repoctx validation script before changing docs, examples, or public
workspace guidance:

```sh
bash scripts/validate-repoctx.sh
```

The script checks required repoctx docs and examples, then scans project-facing
documentation for unresolved template placeholders and stale source-scaffold
identity.

## Node checks

The package workflow mirrors these local commands:

```sh
npm test
npm run typecheck
npm run build
```

Use the smallest relevant local command while developing. Run all three before
opening a release-oriented pull request or changing shared package behavior.
