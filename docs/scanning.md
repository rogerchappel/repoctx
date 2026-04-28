# Scanning

`repoctx scan <path>` is planned to discover local Git repositories and write or update workspace context. It should inspect metadata, not mutate repositories.

## Scanner responsibilities

V1 scanning should:

- recursively find Git repositories
- ignore nested `.git` internals
- skip common generated or dependency folders
- detect repo name from folder or remote
- detect origin remote URL
- detect default and current branch where possible
- detect package manager from lockfiles
- detect common package scripts
- infer project type conservatively
- detect docs files and site signals
- detect agent instruction files
- detect branchbrief workflow signals
- write workspace output only when requested

## Ignored folders

The scanner should skip at least:

```text
node_modules
.venv
dist
build
.next
.turbo
.cache
```

Implementations may add more generated folders when the behavior is documented and tested.

## Remote detection

Use the repo-local origin remote when available:

```sh
git remote get-url origin
```

Supported GitHub forms:

```text
https://github.com/owner/repo.git
git@github.com:owner/repo.git
```

If parsing fails, keep the raw remote string and avoid guessing owner or repo metadata.

## Default branch detection

Suggested order:

1. symbolic ref for `origin/HEAD`
2. local `main`
3. local `master`
4. current branch
5. `unknown`

## Package manager detection

Detect by lockfile:

```text
pnpm-lock.yaml => pnpm
package-lock.json => npm
yarn.lock => yarn
bun.lockb => bun
```

If multiple lockfiles exist, validation should report ambiguity rather than silently choosing a surprising value.

## Command detection

For Node projects, package scripts can map to workspace commands:

```json
{
  "scripts": {
    "test": "...",
    "build": "...",
    "typecheck": "...",
    "lint": "...",
    "dev": "..."
  }
}
```

Use the detected package manager when building command strings, such as `npm test` or `pnpm test`.

## Project type heuristics

Heuristics should stay conservative:

- `package.json` with `bin` can indicate `oss-cli`
- `action.yml` can indicate `github-action`
- `astro.config.*` and docs content can indicate `docs-site`
- `templates/` plus `AGENTS.md` can indicate `template`
- product frameworks can indicate `product` only when there is enough evidence

Use `unknown` rather than overclaiming.

## Safety expectations

Scanning must not read `.env` contents, print secrets, install dependencies, run package scripts, create branches, push, or edit scanned repos. It may detect that sensitive files or configured paths exist.
