const MIN_VIEWABILITY_THRESHOLD = 0.7;

function isPageVisible(doc) {
  if (!doc) {
    return true;
  }

  const hasHidden = typeof doc.hidden === 'boolean';
  const hasVisibilityState = typeof doc.visibilityState === 'string';

  if (hasHidden && doc.hidden) {
    return false;
  }

  if (hasVisibilityState && doc.visibilityState !== 'visible') {
    return false;
  }

  return true;
}

function isPageFocused(doc) {
  if (!doc || typeof doc.hasFocus !== 'function') {
    return true;
  }

  return doc.hasFocus();
}

function isPlaybackAllowed(doc) {
  return isPageVisible(doc) && isPageFocused(doc);
}

function normalizeThreshold(threshold) {
  if (!Number.isFinite(threshold)) {
    return MIN_VIEWABILITY_THRESHOLD;
  }

  return Math.min(Math.max(threshold, 0), 1);
}

function resolveViewabilityThreshold(threshold) {
  return normalizeThreshold(threshold);
}

function isViewRatioViewable(viewRatio, threshold) {
  if (!Number.isFinite(viewRatio)) {
    return false;
  }

  return viewRatio >= normalizeThreshold(threshold);
}

function shouldPauseForVisibility({ playbackAllowed, isViewable }) {
  return !playbackAllowed || !isViewable;
}

function shouldResumeAutoPausedPlayer({ playerPaused, adBreakActive, playerManuallyPaused }) {
  return Boolean(playerPaused && !adBreakActive && !playerManuallyPaused);
}

function canAttemptAutoplayInView({ autoplayPending, playbackAllowed, isOutOfView, playerManuallyPaused }) {
  return Boolean(autoplayPending && playbackAllowed && !isOutOfView && !playerManuallyPaused);
}

function shouldAutoplayAfterQueuedAd({ pendingAdAutoplay, playerManuallyPaused }) {
  return Boolean(pendingAdAutoplay && !playerManuallyPaused);
}

function shouldResumeAutoPausedAd({ autoPaused, adManuallyPaused, playerManuallyPaused }) {
  return Boolean(autoPaused && !adManuallyPaused && !playerManuallyPaused);
}

function isAutoplayPolicyEligible({ isMuted, hasUserActivation }) {
  return Boolean(isMuted || hasUserActivation);
}

function canRequestAdsNow({
  pendingAdRequest,
  adBreakActive,
  initialized,
  isPlayerViewable,
  initDelayElapsed,
  playbackPolicyEligible,
}) {
  return Boolean(
    pendingAdRequest &&
      !adBreakActive &&
      initialized &&
      isPlayerViewable &&
      initDelayElapsed &&
      playbackPolicyEligible
  );
}

module.exports = {
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
};
