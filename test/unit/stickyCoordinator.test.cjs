const test = require('node:test');
const assert = require('node:assert/strict');

const {
  STICKY_MODES,
  createPlayerRegistry,
  isUserInitiatedPlay,
  resolveStickyMode,
  shouldPauseForeignVideo,
  shouldYieldToSticky,
} = require('../../src/utils/stickyCoordinator.cjs');

const sticky = (active) => ({ isStickyActive: () => active });

test('registry reports an active sticky only for other instances', () => {
  const registry = createPlayerRegistry();
  registry.register('sticky', sticky(true));
  registry.register('inline', sticky(false));

  assert.equal(registry.hasActiveSticky('inline'), true);
  assert.equal(registry.hasActiveSticky('sticky'), false);
});

test('registry follows sticky state changes of an entry', () => {
  const registry = createPlayerRegistry();
  let docked = false;
  registry.register('onload', { isStickyActive: () => docked });

  assert.equal(registry.hasActiveSticky('inline'), false);
  docked = true;
  assert.equal(registry.hasActiveSticky('inline'), true);
});

test('registry stops reporting a sticky after unregister', () => {
  const registry = createPlayerRegistry();
  registry.register('sticky', sticky(true));
  registry.unregister('sticky');

  assert.equal(registry.hasActiveSticky('inline'), false);
});

test('hasPlayingSticky only reports docked stickies that are playing', () => {
  const registry = createPlayerRegistry();
  let playing = true;
  registry.register('sticky', { ...sticky(true), isStickyPlaying: () => playing });
  registry.register('legacy', sticky(true));

  assert.equal(registry.hasPlayingSticky('inline'), true);
  playing = false;
  assert.equal(registry.hasPlayingSticky('inline'), false);
  assert.equal(registry.hasActiveSticky('inline'), true);
});

test('yieldPlayingStickies asks only other playing stickies to yield', () => {
  const registry = createPlayerRegistry();
  const calls = [];
  const entry = (id, playing) => ({
    ...sticky(true),
    isStickyPlaying: () => playing,
    yieldToUser: () => calls.push(id),
  });
  registry.register('playing', entry('playing', true));
  registry.register('paused', entry('paused', false));
  registry.register('self', entry('self', true));

  registry.yieldPlayingStickies('self');
  assert.deepEqual(calls, ['playing']);
});

test('isUserInitiatedPlay needs a recent interaction inside the player', () => {
  const nowMs = 10000;

  assert.equal(isUserInitiatedPlay({ interactionAt: 9500, interactionInside: true, nowMs }), true);
  assert.equal(
    isUserInitiatedPlay({ interactionAt: 9500, interactionInside: false, nowMs }),
    false
  );
  assert.equal(isUserInitiatedPlay({ interactionAt: 7000, interactionInside: true, nowMs }), false);
  assert.equal(isUserInitiatedPlay({ interactionAt: 0, interactionInside: true, nowMs }), false);
});

test('notifyStickyChange notifies every instance except the source', () => {
  const registry = createPlayerRegistry();
  const calls = [];
  registry.register('sticky', { ...sticky(true), onStickyChange: () => calls.push('sticky') });
  registry.register('inline-1', { ...sticky(false), onStickyChange: () => calls.push('inline-1') });
  registry.register('inline-2', { ...sticky(false), onStickyChange: () => calls.push('inline-2') });

  registry.notifyStickyChange('sticky');
  assert.deepEqual(calls, ['inline-1', 'inline-2']);
});

test('resolveStickyMode picks the requested mode when requirements are met', () => {
  const base = { hasVideoSrc: true, hasDeviceMiniPlayer: true };

  assert.deepEqual(resolveStickyMode({ ...base }), { mode: null, warning: null });
  assert.equal(resolveStickyMode({ ...base, stickyOnLoad: true }).mode, STICKY_MODES.ON_LOAD);
  assert.equal(resolveStickyMode({ ...base, alwaysSticky: true }).mode, STICKY_MODES.ALWAYS);
});

test('resolveStickyMode lets alwaysSticky override stickyOnLoad with a warning', () => {
  const result = resolveStickyMode({
    alwaysSticky: true,
    stickyOnLoad: true,
    hasVideoSrc: true,
    hasDeviceMiniPlayer: true,
  });

  assert.equal(result.mode, STICKY_MODES.ALWAYS);
  assert.match(result.warning, /overrides stickyOnLoad/);
});

test('resolveStickyMode falls back to inline without content or device config', () => {
  const noSrc = resolveStickyMode({
    stickyOnLoad: true,
    hasVideoSrc: false,
    hasDeviceMiniPlayer: true,
  });
  const noConfig = resolveStickyMode({
    alwaysSticky: true,
    hasVideoSrc: true,
    hasDeviceMiniPlayer: false,
  });

  assert.equal(noSrc.mode, null);
  assert.match(noSrc.warning, /stickyOnLoad requires videoSrc/);
  assert.equal(noConfig.mode, null);
  assert.match(noConfig.warning, /alwaysSticky requires miniPlayer/);
});

test('shouldYieldToSticky requires an in-view non-sticky player and an open sticky', () => {
  assert.equal(shouldYieldToSticky({ isSticky: false, stickyActive: true, inView: true }), true);
  assert.equal(shouldYieldToSticky({ isSticky: false, stickyActive: true, inView: false }), false);
  assert.equal(shouldYieldToSticky({ isSticky: false, stickyActive: false, inView: true }), false);
  assert.equal(shouldYieldToSticky({ isSticky: true, stickyActive: true, inView: true }), false);
});

test('shouldPauseForeignVideo pauses only playing, in-view, non-stpd videos', () => {
  const base = { stickyActive: true, insideStpdPlayer: false, isPlaying: true, inView: true };

  assert.equal(shouldPauseForeignVideo(base), true);
  assert.equal(shouldPauseForeignVideo({ ...base, stickyActive: false }), false);
  assert.equal(shouldPauseForeignVideo({ ...base, insideStpdPlayer: true }), false);
  assert.equal(shouldPauseForeignVideo({ ...base, isPlaying: false }), false);
  assert.equal(shouldPauseForeignVideo({ ...base, inView: false }), false);
});
