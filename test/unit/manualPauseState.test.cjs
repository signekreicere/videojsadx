const test = require('node:test');
const assert = require('node:assert/strict');

const { syncManualPauseFlags } = require('../../src/utils/manualPauseState.cjs');

function baseState() {
  return {
    playerManuallyPaused: false,
    playerPaused: false,
    autoplayPending: true,
    miniPlayerClosed: false,
    miniPlayerCloseAfterAd: false,
    adManuallyPaused: false,
    adPausedByVisibility: true,
    adPausedByMiniPlayerClose: true,
  };
}

test('manual player pause sets paused and clears autoplay pending', () => {
  const next = syncManualPauseFlags(baseState(), { playerManual: true });

  assert.equal(next.playerManuallyPaused, true);
  assert.equal(next.playerPaused, true);
  assert.equal(next.autoplayPending, false);
});

test('manual player resume re-enables mini player state', () => {
  const state = baseState();
  state.miniPlayerClosed = true;
  state.miniPlayerCloseAfterAd = true;

  const next = syncManualPauseFlags(state, { playerManual: false });

  assert.equal(next.playerManuallyPaused, false);
  assert.equal(next.playerPaused, false);
  assert.equal(next.miniPlayerClosed, false);
  assert.equal(next.miniPlayerCloseAfterAd, false);
});

test('clearAdAutoPauseFlags resets ad auto pause tracking', () => {
  const next = syncManualPauseFlags(baseState(), {
    adManual: true,
    clearAdAutoPauseFlags: true,
  });

  assert.equal(next.adManuallyPaused, true);
  assert.equal(next.adPausedByVisibility, false);
  assert.equal(next.adPausedByMiniPlayerClose, false);
});
