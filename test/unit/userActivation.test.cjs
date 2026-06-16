const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FALLBACK_USER_ACTIVATION_EVENT_TYPES,
  hasUserActivationState,
  isFallbackUserActivationEvent,
  shouldTrackFallbackActivation,
} = require('../../src/utils/userActivation.cjs');

test('uses navigator.userActivation when available', () => {
  const result = hasUserActivationState({
    navigatorObj: {
      userActivation: {
        isActive: false,
        hasBeenActive: true,
      },
    },
    documentObj: {
      userActivation: {
        isActive: false,
        hasBeenActive: false,
      },
    },
    lastUserActivationAt: 0,
  });

  assert.equal(result, true);
});

test('falls back to timestamp when userActivation API is unavailable', () => {
  const nowMs = 5000;
  const result = hasUserActivationState({
    navigatorObj: null,
    documentObj: null,
    lastUserActivationAt: 1000,
    nowMs,
    fallbackWindowMs: 10000,
  });

  assert.equal(result, true);
});

test('fallback timestamp expires after threshold', () => {
  const result = hasUserActivationState({
    navigatorObj: null,
    documentObj: null,
    lastUserActivationAt: 1000,
    nowMs: 12001,
    fallbackWindowMs: 10000,
  });

  assert.equal(result, false);
});

test('tracks fallback activation only without native API', () => {
  assert.equal(
    shouldTrackFallbackActivation({
      navigatorObj: {
        userActivation: {
          isActive: false,
          hasBeenActive: false,
        },
      },
      documentObj: null,
    }),
    false
  );

  assert.equal(
    shouldTrackFallbackActivation({
      navigatorObj: null,
      documentObj: null,
    }),
    true
  );
});

test('exposes expected fallback activation event types', () => {
  assert.deepEqual(FALLBACK_USER_ACTIVATION_EVENT_TYPES, [
    'keydown',
    'mousedown',
    'pointerdown',
    'pointerup',
    'touchend',
  ]);
});

test('fallback keydown rejects escape and modifier shortcuts', () => {
  assert.equal(
    isFallbackUserActivationEvent({
      type: 'keydown',
      key: 'Escape',
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    }),
    false
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'keydown',
      key: 'k',
      metaKey: true,
      ctrlKey: false,
      altKey: false,
    }),
    false
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'keydown',
      key: 'Enter',
      metaKey: false,
      ctrlKey: false,
      altKey: false,
    }),
    true
  );
});

test('fallback pointer events follow pointerType rules', () => {
  assert.equal(
    isFallbackUserActivationEvent({
      type: 'pointerdown',
      pointerType: 'mouse',
    }),
    true
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'pointerdown',
      pointerType: 'touch',
    }),
    false
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'pointerup',
      pointerType: 'mouse',
    }),
    false
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'pointerup',
      pointerType: 'touch',
    }),
    true
  );
});

test('fallback mousedown and touchend are accepted', () => {
  assert.equal(
    isFallbackUserActivationEvent({
      type: 'mousedown',
    }),
    true
  );

  assert.equal(
    isFallbackUserActivationEvent({
      type: 'touchend',
    }),
    true
  );
});
