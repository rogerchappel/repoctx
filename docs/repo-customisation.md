# Repository Customisation

This repository is repoctx, not a reusable project template. Keep customization
work focused on repoctx identity, workspace examples, and V1 product behavior.

## Repoctx identity checklist

- README describes repoctx as a local-first repository context tool.
- CLI examples distinguish implemented behavior from planned V1 behavior.
- Examples use placeholder paths only.
- Docs required by [PRD.md](PRD.md) exist and describe repoctx-specific
  behavior.
- Inherited scaffold material is either removed from project-facing docs or
  clearly quarantined.

## Files to review during docs cleanup

- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/**`
- `examples/**`
- `scripts/validate-repoctx.sh`

## Validation

Run:

```sh
bash scripts/validate-repoctx.sh
```

For a broader manual scan, use:

```sh
rg 'source scaffold|legacy template identity|old generated-repository language' README.md ROADMAP.md CHANGELOG.md docs examples scripts
```
