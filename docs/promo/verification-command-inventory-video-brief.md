# Video Brief: Verification Command Inventory

## Hook

"Before an agent edits a repo, it should know how that repo is verified."

## Demo beats

1. Run `bash demo/verification-command-inventory.sh`.
2. Show the generated `.repoctx-command-inventory/workspace.yaml`.
3. Point out one npm repo and one pnpm repo in the same workspace map.
4. Highlight detected verification commands such as `npm test`,
   `npm run typecheck`, and `pnpm run build`.
5. Run the inspect step from the script output to show how a downstream tool can
   read one repository entry before choosing a check.

## Caption

`repoctx scan` turns local repo facts into a reusable workspace map, including
package managers and verification commands.

## Limitations to mention

- The demo uses temporary fixture repositories.
- Detected commands are a starting point for review, not a guarantee that every
  project-specific validation command has been captured.
