# Video Brief: Scan a Local Workspace Map

## Grounded product facts

- `repoctx scan <path>` discovers local Git repositories.
- The CLI can write YAML or JSON workspace files.
- Repository metadata includes local path, Git facts, docs, and
  verification-oriented context where it can be detected.
- The demo fixture creates temporary repositories instead of using private
  machine paths.

## 60-second flow

1. Show `examples/local-scan-demo.sh`.
2. Run:

   ```bash
   bash examples/local-scan-demo.sh
   ```

3. Open the generated `workspace.json` path printed by the script.
4. Point out the two discovered repositories: `api-service` and `docs-site`.
5. Call out that the fixture is temporary and local-first.

## Avoid claiming

- Do not claim repoctx dispatches agents or changes repositories.
- Do not claim it knows every verification command automatically.
- Do not show Roger's private workspace map in public footage.
