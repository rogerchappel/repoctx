# npm Publishing

repoctx is a Node package with a CLI entry point. Publishing is not automated in
V1 and must remain a human-approved release action.

## Preflight

Before publishing:

1. Confirm `package.json` name, version, binary path, exports, license, and
   `files` list are intentional.
2. Confirm the intended version is not already present in the registry:

```sh
npm view repoctx@$(node -p "require('./package.json').version") version
```

   A successful lookup means the version is already published and must not be
   reused. An `E404` response confirms that it is available.
3. Run:

```sh
npm test
npm run typecheck
npm run build
```

4. Pack locally:

```sh
npm pack --dry-run
```

5. Inspect the tarball contents before publishing.
6. Publish only from a clean release commit after explicit maintainer approval.

## Release notes

Update [CHANGELOG.md](../CHANGELOG.md) before a tagged package release. Keep
package publishing changes separate from unrelated feature or documentation
changes.
