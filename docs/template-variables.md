# Template Variables Archive

repoctx is not a project template. This file is retained as an archive pointer
because current repository hygiene checks still expect it to exist.

Template variables are allowed only inside the quarantined `templates/` archive
and the legacy validation script. Project-facing repoctx docs should not contain
unresolved double-brace placeholders.

Use the repoctx validation script for current docs and examples:

```sh
bash scripts/validate-repoctx.sh
```
