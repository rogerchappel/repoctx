# Current Repo Scan Hooks

Grounding: `examples/scan-current-repo-demo.sh` runs `repoctx scan` against the
checked-out repo, writes YAML and JSON workspace artifacts, then verifies them
with `list`, `inspect`, and `validate`.

## Short Posts

1. repoctx can turn a local checkout into a reusable agent workspace entry. The
   new scan demo captures the repo remote, npm commands, instruction files, and
   package metadata without a hosted service.

2. Before handing a repo to an agent, make the repo facts explicit. `repoctx
   scan "$PWD"` exports YAML or JSON that downstream tools can inspect instead
   of rediscovering the same context.

3. The smallest useful repoctx demo is now one command: scan this checkout,
   inspect the generated entry, and validate the workspace file before using it
   in an agent workflow.

## Video Angle

Open with a local checkout and run the scan demo. Show the generated YAML beside
the `inspect repoctx` output, highlighting `package_manager`, verification
commands, and instruction files as the facts an agent should know before
editing.

## Limits To Mention

- repoctx records local repository context; it does not dispatch agents.
- Generated paths are local to the machine that ran the scan.
- Operators should review workspace files before sharing them.
