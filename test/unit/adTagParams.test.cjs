const test = require('node:test');
const assert = require('node:assert/strict');

const {
  removeAdTagParam,
  setAdTagParam,
  setAdTagVideoDuration,
} = require('../../src/utils/adTagParams.cjs');

test('setAdTagParam appends a missing param', () => {
  assert.equal(
    setAdTagParam('https://x.test/ads?iu=1', 'vpmute', '1'),
    'https://x.test/ads?iu=1&vpmute=1'
  );
});

test('setAdTagParam adds a query string when none exists', () => {
  assert.equal(setAdTagParam('https://x.test/ads', 'plcmt', '2'), 'https://x.test/ads?plcmt=2');
});

test('setAdTagParam replaces an existing param after & and ?', () => {
  assert.equal(
    setAdTagParam('https://x.test/ads?iu=1&plcmt=1&sz=640x480', 'plcmt', '2'),
    'https://x.test/ads?iu=1&plcmt=2&sz=640x480'
  );
  assert.equal(
    setAdTagParam('https://x.test/ads?vpmute=1&iu=1', 'vpmute', '0'),
    'https://x.test/ads?vpmute=0&iu=1'
  );
});

test('setAdTagParam ignores params that only share a key suffix', () => {
  assert.equal(
    setAdTagParam('https://x.test/ads?xplcmt=9', 'plcmt', '2'),
    'https://x.test/ads?xplcmt=9&plcmt=2'
  );
});

test('setAdTagParam keeps the hash fragment at the end', () => {
  assert.equal(
    setAdTagParam('https://x.test/ads?iu=1#frag', 'vpmute', '1'),
    'https://x.test/ads?iu=1&vpmute=1#frag'
  );
});

test('removeAdTagParam removes the param in any position', () => {
  assert.equal(
    removeAdTagParam('https://x.test/ads?iu=1&vid_d=5&sz=1', 'vid_d'),
    'https://x.test/ads?iu=1&sz=1'
  );
  assert.equal(
    removeAdTagParam('https://x.test/ads?vid_d=5&iu=1', 'vid_d'),
    'https://x.test/ads?iu=1'
  );
  assert.equal(
    removeAdTagParam('https://x.test/ads?iu=1&vid_d=5', 'vid_d'),
    'https://x.test/ads?iu=1'
  );
  assert.equal(removeAdTagParam('https://x.test/ads?vid_d=5', 'vid_d'), 'https://x.test/ads');
});

test('removeAdTagParam removes duplicates and keeps similar keys', () => {
  assert.equal(
    removeAdTagParam('https://x.test/ads?vid_d=1&xvid_d=2&vid_d=3', 'vid_d'),
    'https://x.test/ads?xvid_d=2'
  );
});

test('setAdTagVideoDuration sets rounded seconds for a known duration', () => {
  assert.equal(
    setAdTagVideoDuration('https://x.test/ads?iu=1', 227.6),
    'https://x.test/ads?iu=1&vid_d=228'
  );
  assert.equal(
    setAdTagVideoDuration('https://x.test/ads?iu=1&vid_d=100', 60),
    'https://x.test/ads?iu=1&vid_d=60'
  );
});

test('setAdTagVideoDuration omits vid_d when the duration is unknown', () => {
  const url = 'https://x.test/ads?iu=1&vid_d=100';
  assert.equal(setAdTagVideoDuration(url, undefined), 'https://x.test/ads?iu=1');
  assert.equal(setAdTagVideoDuration(url, Number.NaN), 'https://x.test/ads?iu=1');
  assert.equal(setAdTagVideoDuration(url, Infinity), 'https://x.test/ads?iu=1');
  assert.equal(setAdTagVideoDuration(url, 0), 'https://x.test/ads?iu=1');
});
