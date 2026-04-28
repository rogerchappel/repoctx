# npm Publishing

repoctx is a Node package with a CLI entry point. Publishing is not automated in
V1 and must remain a human-approved release action.

## Preflight

Before publishing:

1. Confirm `package.json` name, version, binary path, exports, license, and
   `files` list are intentional.
2. Run:

```sh
npm test
npm run typecheck
npm run build
```

3. Pack locally:

```sh
npm pack --dry-run
```

4. Inspect the tarball contents before publishing.
5. Publish only from a clean release commit after explicit maintainer approval.

## Release notes

Update [CHANGELOG.md](../CHANGELOG.md) before a tagged package release. Keep
package publishing changes separate from unrelated feature or documentation
changes.
