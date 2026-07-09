# Verification Command Inventory

This demo builds a tiny two-repo workspace and uses `repoctx scan` to turn local
repository facts into a workspace file an agent can inspect before editing.

## Run it

```sh
bash demo/verification-command-inventory.sh
```

The script writes `.repoctx-command-inventory/workspace.yaml`, validates it,
lists the discovered repositories, and inspects the `agent-notes` entry.

## What it proves

- Lockfiles are enough to distinguish `npm` and `pnpm` projects.
- Common package scripts become verification commands such as `npm test`,
  `npm run typecheck`, and `pnpm run build`.
- The generated workspace can be validated and inspected before another tool
  chooses a test command.

Use this as promotion evidence for the "agents should not rediscover repo
commands from scratch" story.

