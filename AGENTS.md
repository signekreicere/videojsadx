# AGENTS

## Project Overview

This repository provides a Video.js plugin focused on AdX ad integration.

Core goals:
- Keep ad and content playback behavior consistent with page visibility and focus.
- Preserve user intent: manual pause should not be overridden by automatic resume.
- Keep behavior easy to reason about by using modular helpers in src/utils.

## Architecture

Main runtime entry:
- src/videojsadx.js

Modular helpers:
- src/utils/adPlaybackUtils.cjs: ad pause/resume/volume control helpers.
- src/utils/domViewability.cjs: viewport and element viewability helpers.
- src/utils/manualPauseState.cjs: state transitions for manual pause flags.
- src/utils/playbackVisibility.cjs: focus/visibility/viewability decisions.

When changing behavior, prefer adding or updating utility functions instead of expanding complex inline logic in src/videojsadx.js.

## Local Workflow

Development:
- npm run dev
- npm run start:docker

Quality and release gates:
- npm run precommit
  - Auto-formats code, builds dist bundle, runs unit tests.
- npm run prepublishOnly
  - Checks formatting, runs tests, and validates production build.

## Behavioral Guardrails

When updating playback logic:
- Never auto-resume content or ads if playback was manually paused by the user.
- Treat hidden tab, unfocused page, and low viewability as pause conditions.
- Emit debug trace reasons for ad pause/resume paths when debug mode is enabled.
- Keep mini-player transitions consistent with ad manual-pause state.

## Tests

Unit tests are in test/unit and should be updated with behavior changes.

Key test command:
- npm test

If you add decision branches in utility modules, add or update tests in test/unit to cover them.

## Changelog Policy

Use Keep a Changelog style in CHANGELOG.md.

Default rule:
- Append entries under Unreleased.

Do not rewrite or remove notes from previous version sections unless explicitly requested.

## Packaging Policy

Published package should include runtime artifacts and public docs, and exclude repository-only contributor guidance.

Current intent:
- Include CHANGELOG.md in npm package metadata.
- Exclude AGENTS.md from npm package publication.
