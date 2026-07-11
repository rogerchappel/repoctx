# Repoctx Workspace Scan Video Brief

## Working Title

Stop making every agent rediscover your repos.

## Demo Promise

Show `repoctx` scanning a local Git workspace into an agent-readable context
file, then validating and inspecting one repository entry.

## 45-Second Outline

1. Show the temporary `demo-app` fixture with README, package scripts, package
   lockfile, and Git remote.
2. Run `bash examples/scan-workspace-demo.sh`.
3. Open the generated `workspace.json` and point out the repo path, remote,
   default branch, package manager, README path, and detected commands.
4. Run or replay `repoctx validate` and `repoctx inspect demo-app` output.
5. Close on the local-first posture: this maps context, it does not mutate
   existing repos or dispatch agents.

## Grounded Claims

- `repoctx scan` discovers local Git repositories.
- The scanner detects npm package metadata, README files, remotes, and default
  branches.
- `repoctx validate` and `repoctx inspect` are available CLI commands.
- The demo writes only to a temporary directory.
