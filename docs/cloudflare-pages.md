# Cloudflare Pages

repoctx does not require Cloudflare Pages for V1. This page is retained as a
quarantined archive pointer because current repository hygiene checks still
expect it to exist.

Do not treat Cloudflare deployment as part of the repoctx product surface unless
a future docs-site or static dashboard feature is explicitly accepted.

## Current status

- No Cloudflare account is required.
- No Cloudflare secrets are required.
- No Pages deployment is part of the V1 workflow.
- Workspace scanning may eventually detect `wrangler.toml` as repo metadata,
  but that is detection only and should not deploy anything.

If repoctx later adds static dashboard output, document that feature in a new
repoctx-specific deployment guide and keep deployment credentials out of the
repository.
