const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPlayerRegistry,
  shouldPauseForeignVideo,
  shouldYieldToSticky,
} = require('../../src/utils/stickyCoordinator.cjs');

test('registry reports an active sticky only for other instances', () => {
  const registry = createPlayerRegistry();
  registry.register('sticky', { isSticky: true });
  registry.register('inline', { isSticky: false });

  assert.equal(registry.hasActiveSticky('inline'), true);
  assert.equal(registry.hasActiveSticky('sticky'), false);
});

test('registry stops reporting a sticky after unregister', () => {
  const registry = createPlayerRegistry();
  registry.register('sticky', { isSticky: true });
  registry.unregister('sticky');

  assert.equal(registry.hasActiveSticky('inline'), false);
});

test('notifyStickyChange notifies only non-sticky instances other than the source', () => {
  const registry = createPlayerRegistry();
  const calls = [];
  registry.register('sticky', { isSticky: true, onStickyChange: () => calls.push('sticky') });
  registry.register('inline-1', { isSticky: false, onStickyChange: () => calls.push('inline-1') });
  registry.register('inline-2', { isSticky: false, onStickyChange: () => calls.push('inline-2') });

  registry.notifyStickyChange('sticky');
  assert.deepEqual(calls, ['inline-1', 'inline-2']);
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
