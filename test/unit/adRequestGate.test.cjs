const test = require('node:test');
const assert = require('node:assert/strict');

const { createConsentGate, createEngagementGate } = require('../../src/utils/adRequestGate.cjs');

function createFakeTimers() {
  const timers = new Map();
  let nextId = 1;
  return {
    setTimer(fn, ms) {
      const id = nextId++;
      timers.set(id, { fn, ms });
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
    },
    runAll() {
      [...timers.entries()].forEach(([id, { fn }]) => {
        timers.delete(id);
        fn();
      });
    },
    get size() {
      return timers.size;
    },
  };
}

function createFakeCmp() {
  const listeners = new Map();
  const removed = [];
  let nextId = 0;
  return {
    removed,
    win: {
      __tcfapi(command, version, callback, param) {
        if (command === 'addEventListener') {
          const id = nextId++;
          listeners.set(id, callback);
        } else if (command === 'removeEventListener') {
          removed.push(param);
          listeners.delete(param);
        }
      },
    },
    emit(data, success = true) {
      [...listeners.entries()].forEach(([id, callback]) =>
        callback({ listenerId: id, ...data }, success)
      );
    },
  };
}

function createFakeDocument(visibilityState = 'visible') {
  const listeners = new Map();
  return {
    visibilityState,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      if (listeners.has(type)) listeners.get(type).delete(fn);
    },
    dispatch(type) {
      [...(listeners.get(type) || [])].forEach((fn) => fn({ type }));
    },
    listenerCount() {
      let count = 0;
      listeners.forEach((set) => (count += set.size));
      return count;
    },
  };
}

test('consent gate opens immediately when there is no CMP', () => {
  const gate = createConsentGate({ win: {} });
  assert.equal(gate.isReady(), true);
  assert.equal(gate.getReason(), 'no-cmp');
});

test('consent gate waits while the banner is shown and opens on the visitor decision', () => {
  const cmp = createFakeCmp();
  const timers = createFakeTimers();
  const gate = createConsentGate({ win: cmp.win, ...timers });
  const reasons = [];
  gate.onReady((reason) => reasons.push(reason));

  cmp.emit({ eventStatus: 'cmpuishown', gdprApplies: true });
  assert.equal(gate.isReady(), false);
  assert.equal(timers.size, 0, 'a responsive CMP stops the timeout');

  cmp.emit({ eventStatus: 'useractioncomplete', gdprApplies: true });
  assert.equal(gate.isReady(), true);
  assert.deepEqual(reasons, ['useractioncomplete']);
  assert.deepEqual(cmp.removed, [0]);
});

test('consent gate opens on stored consent (tcloaded)', () => {
  const cmp = createFakeCmp();
  const gate = createConsentGate({ win: cmp.win, ...createFakeTimers() });
  cmp.emit({ eventStatus: 'tcloaded', gdprApplies: true });
  assert.equal(gate.getReason(), 'tcloaded');
});

test('consent gate opens when GDPR does not apply (e.g. US traffic)', () => {
  const cmp = createFakeCmp();
  const gate = createConsentGate({ win: cmp.win, ...createFakeTimers() });
  cmp.emit({ eventStatus: 'cmpuishown', gdprApplies: false });
  assert.equal(gate.getReason(), 'gdpr-not-applicable');
});

test('consent gate opens when the CMP never answers or fails', () => {
  const silentTimers = createFakeTimers();
  const silent = createConsentGate({ win: { __tcfapi() {} }, ...silentTimers });
  assert.equal(silent.isReady(), false);
  silentTimers.runAll();
  assert.equal(silent.getReason(), 'cmp-timeout');

  const cmp = createFakeCmp();
  const failing = createConsentGate({ win: cmp.win, ...createFakeTimers() });
  cmp.emit({}, false);
  assert.equal(failing.getReason(), 'cmp-error');

  const throwing = createConsentGate({
    win: {
      __tcfapi() {
        throw new Error('broken');
      },
    },
    ...createFakeTimers(),
  });
  assert.equal(throwing.getReason(), 'cmp-error');
});

test('engagement gate opens on the first interaction and cleans up listeners', () => {
  const doc = createFakeDocument();
  const timers = createFakeTimers();
  const gate = createEngagementGate({ doc, holdMs: 5000, ...timers });
  const reasons = [];
  gate.onReady((reason) => reasons.push(reason));

  assert.equal(gate.isReady(), false);
  doc.dispatch('scroll');
  doc.dispatch('keydown');
  assert.deepEqual(reasons, ['interaction:scroll']);
  assert.equal(doc.listenerCount(), 0);
  assert.equal(timers.size, 0);
});

test('engagement gate opens after the visible dwell time', () => {
  const doc = createFakeDocument();
  const timers = createFakeTimers();
  const gate = createEngagementGate({ doc, holdMs: 5000, ...timers });
  timers.runAll();
  assert.equal(gate.getReason(), 'dwell');
});

test('engagement dwell time does not run while the page is hidden', () => {
  const doc = createFakeDocument('hidden');
  const timers = createFakeTimers();
  const gate = createEngagementGate({ doc, holdMs: 5000, ...timers });
  assert.equal(timers.size, 0);

  doc.visibilityState = 'visible';
  doc.dispatch('visibilitychange');
  assert.equal(timers.size, 1);
  doc.visibilityState = 'hidden';
  doc.dispatch('visibilitychange');
  assert.equal(timers.size, 0);
  assert.equal(gate.isReady(), false);
});

test('engagement gate is open without a hold or after an earlier interaction', () => {
  assert.equal(
    createEngagementGate({ doc: createFakeDocument(), holdMs: 0 }).getReason(),
    'no-hold'
  );
  assert.equal(
    createEngagementGate({
      doc: createFakeDocument(),
      holdMs: 5000,
      alreadyEngaged: true,
    }).getReason(),
    'interaction'
  );
});
