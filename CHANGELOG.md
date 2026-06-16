# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Added
- Configurable `viewabilityThreshold` option (0..1, clamped) for ad/player viewability checks.
- Ad pause/resume debug trace logs with explicit reason tags.
- Unit tests for playback visibility helpers and manual pause state transitions.
- Utility modules for ad playback controls, visibility math, and pause-state synchronization.

### Changed
- Visibility gating now considers document visibility and focus in addition to viewport position.
- Auto-resume and queued autoplay behavior now respects manual pause intent.

### Fixed
- Prevented hidden or out-of-focus ad/content playback.
- Fixed ad auto-resume edge cases around mini-player close/reopen and manual ad pause.
- Improved consistency of ad volume synchronization with player state.

### Developer Experience
- Added `npm test` script for unit test execution.
- Pre-commit now runs formatting automatically, then builds bundles and runs tests.
- Pre-commit now stages regenerated `dist` bundle output automatically to avoid follow-up bundle-only commits.
- Pre-publish gate validates formatting (`format:check`), tests, and production build.
- Added AGENTS.md with project-specific contribution and workflow instructions.
- Changelog policy documented for append-only updates: do not rewrite previous version sections unless explicitly requested.
- npm package metadata now includes CHANGELOG.md while excluding AGENTS.md from publication.

