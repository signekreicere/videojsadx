const test = require('node:test');
const assert = require('node:assert/strict');

const { onPageLoadOnce } = require('../../src/utils/pageLifecycle.cjs');

function createFakeWindow(readyState) {
  const listeners = new Set();
  return {
    document: { readyState },
    addEventListener(type, fn) {
      if (type === 'load') listeners.add(fn);
    },
    removeEventListener(type, fn) {
      if (type === 'load') listeners.delete(fn);
    },
    dispatchLoad() {
      [...listeners].forEach((fn) => fn());
    },
  };
}

test('onPageLoadOnce runs once on load even when load is dispatched again', () => {
  const win = createFakeWindow('interactive');
  let calls = 0;
  onPageLoadOnce(() => calls++, win);

  assert.equal(calls, 0);
  win.dispatchLoad();
  win.dispatchLoad();
  assert.equal(calls, 1);
});

test('onPageLoadOnce runs immediately when the page has already loaded', () => {
  const win = createFakeWindow('complete');
  let calls = 0;
  onPageLoadOnce(() => calls++, win);
  win.dispatchLoad();

  assert.equal(calls, 1);
});
