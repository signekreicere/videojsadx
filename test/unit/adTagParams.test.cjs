const test = require('node:test');
const assert = require('node:assert/strict');

const { setAdTagParam } = require('../../src/utils/adTagParams.cjs');

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
