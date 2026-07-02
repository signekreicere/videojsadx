# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Fixed
- Fixed the IMA ad surface breaking (ad video disappearing while audio kept playing) during fast up/down scrolling on mobile. Rapid mini-player size toggles flooded the IMA SDK with `resize()` calls; ad resizes are now coalesced into a single animation frame and skipped when the resolved dimensions and view mode are unchanged.
- Fixed mobile mini-player occasionally rendering off-screen during fast/momentum scrolling while the ad kept playing (audio-only, non-viewable impressions). Removed the conflicting centering `transform` on the mobile fixed mini-player and rebuilt positioning to set explicit, conflict-free style declarations that are fully cleared on each transition.
- Mini-player no longer tears down or visually "jumps" when the page loses focus (e.g. clicking into DevTools) while staying visible. It now stays anchored through a transient focus/visibility auto-pause and resumes playback automatically when the page is re-entered, provided playback was not manually paused. Focus/visibility pause gating itself is unchanged.

### Changed
- A closed mini-player now re-enables when the main content player resumes playback, matching the existing behavior for ad playback.

## [4.1.0] - 2026-06-16

### Added
- Configurable `adDisplayInitMinDelayMs` option to control minimum delay between ad display container initialization and ad requests.
- Configurable `enforceAdPlayEligibility` option to require muted playback or user activation before requesting ads.
- Dedicated user activation utility module and tests, including fallback handling for `keydown`, `mousedown`, `pointerdown`, `pointerup`, and `touchend` when native UserActivation API is unavailable.
- Configurable `viewabilityThreshold` option (0..1, clamped) for ad/player viewability checks.
- Ad pause/resume debug trace logs with explicit reason tags.
- Unit tests for playback visibility helpers and manual pause state transitions.
- Utility modules for ad playback controls, visibility math, and pause-state synchronization.

### Changed
- Switched IMA request flow to manual request mode so ad requests are centrally gated by viewability, page state, initialization state, policy eligibility, and init delay.
- Refactored activation and ad-request code paths in runtime logic to reduce duplication and keep behavior modular.
- Updated playback visibility helper tests to cover autoplay policy eligibility and ad-request gate decisions.
- Visibility gating now considers document visibility and focus in addition to viewport position.
- Auto-resume and queued autoplay behavior now respects manual pause intent.

### Fixed
- Prevented ad requests from firing before playback eligibility is met.
- Improved autoplay/ad-start consistency after first valid user interaction across desktop and mobile browser policy constraints.
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

