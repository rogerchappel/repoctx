# PRD: repoctx

## Product Name

**repoctx**

## Tagline

Give agents a map of your repos, commands, policies, and risks.

## One-Line Pitch

`repoctx` is an agent-readable repo context registry for multi-repo development workflows. It scans local repositories, detects useful metadata, and produces a workspace map that tools like `taskbrief`, `branchbrief`, CrewCMD, Codex, OpenClaw, Claude Code, and GitHub Copilot can use to understand where code lives, how to verify it, and what is safe to touch.

## 1. Objective

Create an open-source CLI that builds and maintains a machine-readable map of a developer's local repositories.

The map should answer:

- What repos exist?
- Where are they locally?
- What GitHub remote do they use?
- What type of project is each repo?
- What package manager does each repo use?
- What commands verify/build/test the repo?
- Does the repo have docs?
- Does the repo have `AGENTS.md`?
- Does the repo use `branchbrief`?
- Is the repo production-sensitive?
- Which paths should agents avoid by default?
- Which policies apply before an agent starts work?

`repoctx` should become the shared context layer for the rest of the agentic development stack.

```text
repoctx      = repo/workspace context
taskbrief    = messy input -> structured tasks using repoctx
CrewCMD      = task queue -> agents/worktrees/PRs using repoctx
branchbrief  = completed branch -> review brief using repoctx
```

## 2. Why This Exists

Existing multi-repo tools help you list repos or run commands across them.

Examples of existing categories:

- multi-repo status tools
- bulk git command runners
- monorepo/meta-repo managers
- scripts that run changes across GitHub repos

repoctx is different.

It does not primarily exist to run commands across repos.

It exists to describe repos in the way agents need:

- verification commands
- allowed/forbidden paths
- risk profile
- repo type
- docs URL
- default branch
- production sensitivity
- expected branch/PR policy
- agent instructions
- integrations

This makes agent work safer, more repeatable, and less dependent on guessing.

## 3. Core Product Principle

Agents should not have to guess how a repo works.

repoctx should make implicit repo knowledge explicit.

The output should be boring, predictable, and machine-readable.

## 4. Target Users

### Primary User

Roger Chappel, working across many OSS, product, and company repos with Codex, OpenClaw, CrewCMD, and other agents.

### Secondary Users

- developers working across many local repos
- AI-assisted developers
- OSS maintainers
- technical founders
- teams using coding agents
- people building multi-repo automation
- CrewCMD/taskbrief/branchbrief users

## 5. Relationship to Existing Tools

repoctx should not try to replace tools like:

- gita
- myrepos
- mani
- git-xargs
- repo status dashboards
- monorepo managers

Those tools mostly answer:

What repos do I have, and can I run commands across them?

repoctx answers:

What does an agent need to know before working in this repo?

## 6. Non-Goals

V1 should not:

- dispatch agents
- run arbitrary commands across all repos
- mutate repositories
- open PRs
- create branches
- edit repo files automatically
- push to remotes
- require GitHub authentication
- require API keys
- require an LLM
- become a dashboard
- become a hosted service
- replace CrewCMD
- replace taskbrief
- replace branchbrief

V1 should be a local-first scanner, registry, validator, and exporter.

## 7. V1 Scope

V1 should include:

1. CLI package
2. local repo scanner
3. workspace config file
4. repo metadata detection
5. package manager detection
6. common command detection
7. repo type hints
8. agent policy fields
9. risk policy fields
10. YAML and JSON output
11. validation command
12. inspect command
13. docs and examples
14. no network required by default

## 8. V2 Scope

V2 may add:

- GitHub API enrichment
- GitHub topics/description sync
- docs URL detection
- Cloudflare Pages detection
- branchbrief integration
- taskbrief integration
- CrewCMD integration
- repo health scoring
- policy packs
- interactive editing
- import from gita, mani, or other repo lists
- support for repo groups/tags
- local TUI

## 9. V3 Scope

V3 may add:

- org-level workspace maps
- dependency graph between repos
- dashboard/static site output
- issue seeding
- integration with agent dispatch systems
- auto-created repo contexts from GitHub orgs
- policy-as-code
- multi-machine sync
- per-agent context generation
- historical repo health reports

## 10. Required Repository Structure

```text
repoctx/
  README.md
  LICENSE
  AGENTS.md
  CONTRIBUTING.md
  SECURITY.md
  CODE_OF_CONDUCT.md
  CHANGELOG.md
  ROADMAP.md
  docs/
    PRD.md
    workspace-schema.md
    scanning.md
    validation.md
    risk-policy.md
    integrations.md
    taskbrief.md
    branchbrief.md
    crewcmd.md
    examples.md
    release-process.md
  src/
    cli.ts
    index.ts
    types.ts
    scan/
      scanWorkspace.ts
      findGitRepos.ts
      detectRepoMetadata.ts
    git/
      getRemote.ts
      getDefaultBranch.ts
      getCurrentBranch.ts
      getStatus.ts
    detect/
      detectPackageManager.ts
      detectCommands.ts
      detectProjectType.ts
      detectDocs.ts
      detectAgentInstructions.ts
      detectBranchbrief.ts
    workspace/
      loadWorkspace.ts
      writeWorkspace.ts
      mergeWorkspace.ts
      validateWorkspace.ts
      schema.ts
    output/
      yaml.ts
      json.ts
      table.ts
    inspect/
      inspectRepo.ts
    policy/
      defaultPolicies.ts
      riskDefaults.ts
    errors/
      RepoctxError.ts
  examples/
    workspace.yaml
    workspace.json
    rogerchappel-workspace.yaml
  tests/
    scan/
    detect/
    workspace/
    output/
    fixtures/
  .github/
    workflows/
      ci.yml
      branchbrief.yml
    dependabot.yml
    ISSUE_TEMPLATE/
      bug_report.md
      feature_request.md
      agent_task.md
    pull_request_template.md
```

## 11. CLI Requirements

### Primary Commands

```text
repoctx init
repoctx scan <path>
repoctx scan <path> --output workspace.yaml
repoctx add <name> --path <path>
repoctx inspect <name>
repoctx validate
repoctx export --format yaml
repoctx export --format json
repoctx doctor
```

### Nice-to-Have V1 Commands

```text
repoctx list
repoctx list --type oss-cli
repoctx list --tag agentic
repoctx remove <name>
repoctx update <name>
```

### Example Usage

```text
repoctx init
repoctx scan ~/Developer/my-opensource --output workspace.yaml
repoctx add branchbrief --path ~/Developer/my-opensource/branchbrief
repoctx inspect branchbrief
repoctx validate
repoctx export --format json --output workspace.json
```

## 12. Workspace File

Default file name:

```text
workspace.yaml
```

Alternative supported names:

```text
repoctx.yaml
repos.yaml
```

V1 should prefer:

```text
workspace.yaml
```

### Example Workspace

```yaml
version: "0.1"
workspace: rogerchappel
defaults:
  default_base: main
  requires_branch: true
  review_pack_required: true
  forbidden_by_default:
    - .env*
    - secrets/**
    - credentials/**
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
    remote: https://github.com/rogerchappel/branchbrief.git
    type: oss-cli
    default_base: main
    docs_url: https://branchbrief.rogerchappel.com
    package_manager: npm
    commands:
      install: npm ci
      test: npm test
      build: npm run build
      typecheck: npm run typecheck
    files:
      agents: AGENTS.md
      changelog: CHANGELOG.md
      roadmap: ROADMAP.md
    integrations:
      branchbrief: true
      taskbrief: true
      crewcmd: false
    risk:
      production_sensitive: false
      forbidden_by_default:
        - .env*
        - secrets/**
    agents:
      requires_branch: true
      requires_pr: true
      review_pack_required: true
  product-videogen:
    path: ~/Developer/work/product-videogen
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
        - billing/**
        - auth/**
        - production/**
        - .env*
    agents:
      requires_branch: true
      requires_pr: true
      review_pack_required: true
      human_approval_required: true
```

## 13. Workspace Schema

Every repo entry should support:

```yaml
path:
remote:
type:
default_base:
docs_url:
package_manager:
commands:
files:
integrations:
risk:
agents:
tags:
notes:
```

### Required Fields

Minimum valid repo entry:

```yaml
repos:
  branchbrief:
    path: ~/Developer/my-opensource/branchbrief
```

Everything else can be detected or filled later.

### Repo Types

Supported initial repo types:

```text
oss-cli
oss-library
docs-site
github-action
template
product
production-saas
company
client
internal-tool
experiment
unknown
```

### Commands

Supported command keys:

```yaml
commands:
  install:
  test:
  build:
  typecheck:
  lint:
  format:
  dev:
  docs:
  release_check:
```

### Risk Fields

```yaml
risk:
  production_sensitive: false
  forbidden_by_default:
    - .env*
    - secrets/**
  high_risk_paths:
    - auth/**
    - billing/**
    - migrations/**
  medium_risk_paths:
    - .github/workflows/**
    - package.json
```

### Agent Fields

```yaml
agents:
  requires_branch: true
  requires_pr: true
  review_pack_required: true
  human_approval_required: false
  preferred_agent: codex
```

### Integration Fields

```yaml
integrations:
  branchbrief: true
  taskbrief: true
  crewcmd: true
  copilot: true
```

## 14. Scanner Requirements

`repoctx scan <path>` should:

1. recursively find Git repos
2. ignore nested `.git` internals
3. respect common ignore folders:
   - `node_modules`
   - `.venv`
   - `dist`
   - `build`
   - `.next`
   - `.turbo`
   - `.cache`
4. detect repo name from folder or remote
5. detect remote URL
6. detect default branch
7. detect current branch
8. detect package manager
9. detect common package scripts
10. detect project type
11. detect docs files/site config
12. detect `AGENTS.md`
13. detect branchbrief workflow if present
14. write/update workspace config

## 15. Detection Requirements

### Git Remote

Detect:

```text
git remote get-url origin
```

Support:

```text
https://github.com/owner/repo.git
git@github.com:owner/repo.git
```

Parse owner/repo if possible.

### Default Branch

Detection order:

1. symbolic ref for origin HEAD
2. local main
3. local master
4. fallback to current branch
5. unknown

### Package Manager

Detect by lockfile:

```text
pnpm-lock.yaml => pnpm
package-lock.json => npm
yarn.lock => yarn
bun.lockb => bun
```

### Commands

From `package.json` scripts:

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

Map to:

```yaml
commands:
  test: npm test
  build: npm run build
  typecheck: npm run typecheck
  lint: npm run lint
```

Use detected package manager.

### Project Type Heuristics

Examples:

- `astro.config.*` + `src/content/docs` => `docs-site`
- `package.json` bin => `oss-cli`
- `action.yml` => `github-action`
- `templates/` + `AGENTS.md` => `template`
- `next.config.*` => `product` or `web-app`
- `wrangler.toml` => `cloudflare-deployable`

If uncertain:

```yaml
type: unknown
```

Do not overclaim.

### Docs Detection

Detect:

- `README.md`
- `docs/`
- `astro.config.*`
- `src/content/docs/`
- `wrangler.toml`

### Agent Instructions Detection

Detect:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`

### Branchbrief Detection

Detect:

- `.github/workflows/branchbrief.yml`
- `BRANCH_BRIEF.md`
- branchbrief config if later added

## 16. Validation Requirements

`repoctx validate` should check:

- workspace file exists
- all repo paths exist
- repo paths are Git repos
- duplicate repo names
- invalid repo types
- missing default branch
- missing remote
- commands reference package scripts that do not exist
- production-sensitive repos have forbidden paths
- agent-enabled repos require branch/review policy
- docs URLs are valid-looking URLs if present

Validation output should be human-readable.

Example:

```text
✓ branchbrief: path exists
✓ branchbrief: git repo detected
✓ branchbrief: npm scripts detected
⚠ branchbrief: docs_url missing
⚠ product-videogen: production_sensitive true but no high_risk_paths configured
✗ old-repo: path does not exist
```

JSON output should be supported later, but V1 can be text-first.

## 17. Inspect Requirements

`repoctx inspect <name>` should show one repo's context.

Example:

```text
repoctx inspect branchbrief
```

Output:

```text
branchbrief
  Path: ~/Developer/my-opensource/branchbrief
  Remote: https://github.com/rogerchappel/branchbrief.git
  Type: oss-cli
  Base: main
  Package manager: npm
  Commands:
    test: npm test
    build: npm run build
    typecheck: npm run typecheck
  Docs: https://branchbrief.rogerchappel.com
  AGENTS.md: yes
  branchbrief workflow: yes
  Production sensitive: no
  Requires PR: yes
```

## 18. Output Requirements

Support:

```text
repoctx export --format yaml
repoctx export --format json
```

Default output file:

```text
workspace.yaml
```

Explicit output:

```text
repoctx export --format json --output workspace.json
```

YAML should be readable and stable.

JSON should be machine-readable for tools.

## 19. Integration Requirements

### taskbrief

taskbrief should be able to consume `workspace.yaml`.

repoctx should document this.

Example:

```text
taskbrief parse brain-dump.txt --workspace workspace.yaml
```

### branchbrief

branchbrief should eventually use repoctx to improve:

- risk classification
- suggested verification commands
- repo-specific policies
- docs URLs

Example future command:

```text
branchbrief --workspace workspace.yaml
```

### CrewCMD

CrewCMD should use repoctx to know:

- where repos live
- which branch policy applies
- which commands verify each repo
- which repos are production-sensitive

Example future command:

```text
crewcmd dispatch queue.yaml --workspace workspace.yaml
```

### Codex/OpenClaw

Agents should be able to read the workspace map to choose:

- correct repo
- safe paths
- verification commands
- review requirements

## 20. Security and Safety Requirements

Default mode must:

- not call external APIs
- not require GitHub auth
- not require LLMs
- not mutate repos
- not edit files inside scanned repos
- only write the workspace output file when requested
- not read `.env` contents
- not print secrets

repoctx may detect that `.env` files exist, but must not read their contents.

## 21. README Requirements

README should include:

- what repoctx is
- why it exists
- how it differs from multi-repo command runners
- quickstart
- CLI usage
- example `workspace.yaml`
- how taskbrief uses it
- how branchbrief can use it
- how CrewCMD can use it
- local-first safety policy
- roadmap

Opening copy:

```markdown
# repoctx

Give agents a map of your repos, commands, policies, and risks.

`repoctx` scans your local development workspace and creates a machine-readable repo context file for agentic development workflows. It helps tools like taskbrief, branchbrief, CrewCMD, Codex, OpenClaw, Claude Code, and Copilot understand where repos live, how to verify them, and what is safe to touch.

It does not dispatch agents or run commands across repos. It gives your agents context before they act.
```

## 22. Docs Requirements

Create:

- `docs/PRD.md`
- `docs/workspace-schema.md`
- `docs/scanning.md`
- `docs/validation.md`
- `docs/risk-policy.md`
- `docs/integrations.md`
- `docs/taskbrief.md`
- `docs/branchbrief.md`
- `docs/crewcmd.md`
- `docs/examples.md`
- `docs/release-process.md`

Docs should be useful for both contributors and agents.

## 23. Testing Requirements

Tests should cover:

- scanning fixture directories
- detecting Git repos
- parsing GitHub remote URLs
- detecting package managers
- detecting package scripts
- detecting project type
- writing YAML
- writing JSON
- validating workspace entries
- inspecting a repo entry
- ignoring common folders
- handling missing paths
- handling repos without remotes

## 24. Suggested Tech Stack

Use TypeScript/Node.

Recommended dependencies:

- commander or cac for CLI
- yaml for YAML read/write
- zod for schema validation
- execa for git commands
- fast-glob or globby for scanning
- vitest for tests
- tsup for builds

Keep dependencies modest.

## 25. Suggested Initial Commits

```text
chore(repo): scaffold repoctx package
docs(prd): define repo context registry
feat(scan): discover local git repositories
feat(git): detect remotes and default branches
feat(detect): infer package manager and commands
feat(detect): identify repo type and agent files
feat(workspace): write workspace yaml
feat(validate): validate workspace entries
feat(inspect): show repo context summary
docs(readme): document repoctx workflow
test(scan): cover repo discovery fixtures
```

## 26. Agent Work Plan

### Agent 1: Repo Scaffold

- TypeScript package
- CLI shell
- README skeleton
- AGENTS.md
- docs skeleton
- CI

### Agent 2: Git Scanner

- find git repos
- ignore common folders
- parse remotes
- detect branches

### Agent 3: Project Detector

- package manager
- package scripts
- project type
- docs/agent files
- branchbrief workflow

### Agent 4: Workspace Schema

- zod schema
- YAML/JSON read/write
- merge/update logic
- validation

### Agent 5: CLI Commands

- init
- scan
- add
- inspect
- validate
- export

### Agent 6: Docs and Examples

- README
- workspace schema docs
- examples
- integration docs

## 27. V1 Acceptance Criteria

V1 is complete when:

- CLI package exists
- `repoctx --help` works
- `repoctx init` creates a workspace file
- `repoctx scan <path>` finds local git repos
- scanner ignores common folders
- remote URLs are detected
- default branches are detected where possible
- package managers are detected
- package scripts are mapped to commands
- project type is inferred or marked unknown
- `AGENTS.md` detection works
- branchbrief workflow detection works
- YAML output works
- JSON output works
- `repoctx validate` reports useful results
- `repoctx inspect <name>` works
- no network calls are required
- no repo mutation occurs
- README explains why this is not a multi-repo command runner
- docs exist
- tests pass

## 28. Required Review Pack

Every agent must return:

```markdown
## Review Pack
Repo:
Branch:
PR:
Task:
Status:
Summary:
Commits:
Files changed:
Verification:
Risk level:
Rollback plan:
Human decision needed:
Next recommended task:
```

## 29. First Example Workspace

Create:

```text
examples/rogerchappel-workspace.yaml
```

It should include example entries for:

- branchbrief
- taskbrief
- agentic-team-playbook
- repoctx
- CrewCMD
- product-videogen

Use placeholder paths and clearly mark them as examples.

Do not include private credentials or sensitive details.

## 30. Final Product Promise

repoctx gives agents the context they need before they touch code.

It does not replace human judgment.

It makes multi-repo agentic development safer, clearer, and easier to orchestrate.
