function syncManualPauseFlags(state, options) {
  const nextState = { ...state };
  const opts = options || {};

  if (typeof opts.playerManual === 'boolean') {
    nextState.playerManuallyPaused = opts.playerManual;
    if (opts.playerManual) {
      nextState.playerPaused = true;
      nextState.autoplayPending = false;
    } else {
      nextState.playerPaused = false;
      if (nextState.miniPlayerClosed) {
        nextState.miniPlayerClosed = false;
        nextState.miniPlayerCloseAfterAd = false;
      }
    }
  }

  if (typeof opts.adManual === 'boolean') {
    nextState.adManuallyPaused = opts.adManual;
  }

  if (opts.clearAdAutoPauseFlags) {
    nextState.adPausedByVisibility = false;
    nextState.adPausedByMiniPlayerClose = false;
  }

  return nextState;
}

module.exports = {
  syncManualPauseFlags,
};
