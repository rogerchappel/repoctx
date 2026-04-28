# Roadmap

This roadmap describes likely direction, not a delivery promise. `repoctx` should stay local-first, boring to operate, and useful to both humans and agents.

## Now

- Define the workspace schema and example files.
- Document scanner, validation, risk policy, and integration expectations.
- Keep examples safe by using placeholder paths and non-sensitive metadata.
- Align README and docs with the PRD without claiming unimplemented runtime behavior.

## V1

- CLI package with `repoctx --help`.
- Local repo scanner that finds Git repositories and ignores common generated folders.
- Workspace config support using `workspace.yaml` as the preferred file name.
- Repo metadata detection for remotes, branches, package managers, package scripts, docs files, agent instruction files, and branchbrief signals.
- YAML and JSON output.
- `validate`, `inspect`, and export commands.
- Local-first safety defaults with no network requirement.
- Focused tests for scanning, detection, workspace IO, validation, and inspect output.

## V2

- Optional GitHub API enrichment for repository description, topics, and docs URLs.
- Integrations for taskbrief, branchbrief, and CrewCMD.
- Importers for existing repo lists such as gita or mani.
- Repo groups, tags, policy packs, and health scoring.
- Interactive editing or a small local TUI if manual workspace maintenance becomes repetitive.

## V3

- Org-level workspace maps.
- Dependency graphs across local repos.
- Static dashboard output.
- Per-agent context generation.
- Historical repo health reports.
- Policy-as-code and multi-machine sync.

## Not planned for V1

- Dispatching agents.
- Running arbitrary commands across all repos.
- Mutating scanned repositories.
- Opening pull requests.
- Requiring GitHub authentication.
- Requiring API keys or an LLM.
- Hosted service or dashboard behavior.

## Review cadence

Review this roadmap before meaningful releases and after integration feedback. Move completed user-visible work into `CHANGELOG.md`, and remove items that no longer match the product direction.
