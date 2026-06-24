# Social Hooks

These drafts are grounded in the current README, examples, and CLI behavior.

## Workspace Map Angle

Agents waste time rediscovering the same repo facts: where projects live, which
commands are available, what docs exist, and which paths need care.

repoctx turns a local workspace into a reusable YAML or JSON map that other
tools can read before they act.

Demo: `bash demo/workspace-map.sh`.

## Multi-Repo Review Angle

Before an agent touches a multi-repo workspace, give it a context file instead
of asking it to infer everything from scratch.

repoctx scans local Git repositories and records project metadata, package
signals, documentation signals, and verification commands in one local file.

## Limitation-Aware Post

repoctx is local-first context plumbing, not a deploy bot and not a replacement
for human approval.

Its job is to make workspace facts explicit so downstream tools can plan with
less guesswork.
