# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

## [0.2.0] - 2026-08-02

### Fixed

- Prevented npm releases from reusing an already-published package version.
- Added a release-readiness check that keeps manifest, lockfile, changelog,
  built CLI, and packed package versions aligned.

### Added

- Initial repoctx PRD, roadmap, release-process documentation, workspace schema,
  scanning, validation, risk policy, and integration docs.
- Placeholder CLI surface for the planned V1 commands.
- Repoctx workspace examples in YAML and JSON, including a larger
  Roger Chappel example with placeholder paths only.
- Local repoctx documentation validation script.
- Reusable agent prompt library for repoctx maintenance tasks.

### Changed

- Replaced the docs workflow placeholder with a concrete package/docs surface check.
- Aligned README and docs with the current implemented package scaffold and
  planned V1 command behavior.
- Quarantined inherited scaffold material so repoctx is presented as a
  repository context tool.

### Removed

- Stale generated-repository example directories that belonged to the source
  template rather than repoctx.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/repoctx/compare/v0.2.0...HEAD`
- 0.2.0:
  `https://github.com/rogerchappel/repoctx/compare/v0.1.4...v0.2.0`
- Latest release:
  `https://github.com/rogerchappel/repoctx/releases/latest`
