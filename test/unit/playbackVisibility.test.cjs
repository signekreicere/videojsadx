const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MIN_VIEWABILITY_THRESHOLD,
  canRequestAdsNow,
  canAttemptAutoplayInView,
  isAutoplayPolicyEligible,
  isPageFocused,
  isPageVisible,
  isPlaybackAllowed,
  resolveViewabilityThreshold,
  isViewRatioViewable,
  shouldAutoplayAfterQueuedAd,
  shouldPauseForVisibility,
  shouldResumeAutoPausedAd,
  shouldResumeAutoPausedPlayer,
} = require('../../src/utils/playbackVisibility.cjs');

test('isPageVisible returns false when document is hidden', () => {
  assert.equal(isPageVisible({ hidden: true, visibilityState: 'hidden' }), false);
});

test('isPageVisible returns false when visibilityState is not visible', () => {
  assert.equal(isPageVisible({ hidden: false, visibilityState: 'prerender' }), false);
});

test('isPlaybackAllowed requires both visible and focused states', () => {
  const doc = {
    hidden: false,
    visibilityState: 'visible',
    hasFocus: () => false,
  };

  assert.equal(isPlaybackAllowed(doc), false);
});

test('isPageFocused is tolerant when hasFocus is unavailable', () => {
  assert.equal(isPageFocused({}), true);
});

test('isViewRatioViewable honors default threshold boundary', () => {
  assert.equal(isViewRatioViewable(MIN_VIEWABILITY_THRESHOLD), true);
  assert.equal(isViewRatioViewable(MIN_VIEWABILITY_THRESHOLD - 0.01), false);
});

test('isViewRatioViewable normalizes invalid thresholds and ratios', () => {
  assert.equal(isViewRatioViewable(0.2, -1), true);
  assert.equal(isViewRatioViewable(0.8, 2), false);
  assert.equal(isViewRatioViewable(Number.NaN, 0.5), false);
});

test('resolveViewabilityThreshold clamps and defaults values', () => {
  assert.equal(resolveViewabilityThreshold(undefined), MIN_VIEWABILITY_THRESHOLD);
  assert.equal(resolveViewabilityThreshold(-0.3), 0);
  assert.equal(resolveViewabilityThreshold(1.5), 1);
  assert.equal(resolveViewabilityThreshold(0.75), 0.75);
});

test('shouldPauseForVisibility pauses when page is hidden or not viewable', () => {
  assert.equal(
    shouldPauseForVisibility({
      playbackAllowed: false,
      isViewable: true,
    }),
    true
  );
  assert.equal(
    shouldPauseForVisibility({
      playbackAllowed: true,
      isViewable: false,
    }),
    true
  );
});

test('manual pause prevents auto resume', () => {
  assert.equal(
    shouldResumeAutoPausedPlayer({
      playerPaused: true,
      adBreakActive: false,
      playerManuallyPaused: true,
    }),
    false
  );
});

test('auto-paused player can resume when conditions are valid', () => {
  assert.equal(
    shouldResumeAutoPausedPlayer({
      playerPaused: true,
      adBreakActive: false,
      playerManuallyPaused: false,
    }),
    true
  );
});

test('manual pause blocks autoplay attempts and queued ad autoplay', () => {
  assert.equal(
    canAttemptAutoplayInView({
      autoplayPending: true,
      playbackAllowed: true,
      isOutOfView: false,
      playerManuallyPaused: true,
    }),
    false
  );

  assert.equal(
    shouldAutoplayAfterQueuedAd({
      pendingAdAutoplay: true,
      playerManuallyPaused: true,
    }),
    false
  );
});

test('manual ad pause blocks automatic ad resume', () => {
  assert.equal(
    shouldResumeAutoPausedAd({
      autoPaused: true,
      adManuallyPaused: true,
      playerManuallyPaused: false,
    }),
    false
  );

  assert.equal(
    shouldResumeAutoPausedAd({
      autoPaused: true,
      adManuallyPaused: false,
      playerManuallyPaused: false,
    }),
    true
  );

  assert.equal(
    shouldResumeAutoPausedAd({
      autoPaused: true,
      adManuallyPaused: false,
      playerManuallyPaused: true,
    }),
    false
  );
});

test('isAutoplayPolicyEligible allows muted or activated playback', () => {
  assert.equal(
    isAutoplayPolicyEligible({
      isMuted: true,
      hasUserActivation: false,
    }),
    true
  );

  assert.equal(
    isAutoplayPolicyEligible({
      isMuted: false,
      hasUserActivation: true,
    }),
    true
  );

  assert.equal(
    isAutoplayPolicyEligible({
      isMuted: false,
      hasUserActivation: false,
    }),
    false
  );
});

test('canRequestAdsNow requires all eligibility gates', () => {
  assert.equal(
    canRequestAdsNow({
      pendingAdRequest: true,
      adBreakActive: false,
      initialized: true,
      isPlayerViewable: true,
      initDelayElapsed: true,
      playbackPolicyEligible: true,
    }),
    true
  );

  assert.equal(
    canRequestAdsNow({
      pendingAdRequest: true,
      adBreakActive: false,
      initialized: true,
      isPlayerViewable: true,
      initDelayElapsed: false,
      playbackPolicyEligible: true,
    }),
    false
  );

  assert.equal(
    canRequestAdsNow({
      pendingAdRequest: false,
      adBreakActive: false,
      initialized: true,
      isPlayerViewable: true,
      initDelayElapsed: true,
      playbackPolicyEligible: true,
    }),
    false
  );
});
