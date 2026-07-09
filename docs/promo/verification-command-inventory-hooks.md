# Verification Command Inventory Hooks

- Multi-repo agents waste time rediscovering package managers and test commands.
- `repoctx scan` turns local repo facts into a reusable workspace map with
  package managers and verification commands.
- Demo angle: scan one npm repo and one pnpm repo, then inspect the command
  inventory before editing.
- Best clip: `package_manager: npm`, `package_manager: pnpm`, `npm test`, and
  `pnpm run build` appearing in one validated workspace file.

