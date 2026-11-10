const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MIN_PLAYER_HEIGHT_PX,
  MIN_PLAYER_WIDTH_PX,
  resolveMinPlayerWidth,
} = require('../../src/utils/playerDimensions.cjs');

test('minimum player dimensions match 16:9 at 256px', () => {
  assert.equal(MIN_PLAYER_WIDTH_PX, 256);
  assert.equal(MIN_PLAYER_HEIGHT_PX, 144);
  assert.equal(MIN_PLAYER_HEIGHT_PX / MIN_PLAYER_WIDTH_PX, 9 / 16);
});

test('resolveMinPlayerWidth clamps configured widths with CSS max()', () => {
  assert.equal(resolveMinPlayerWidth('200px'), 'max(200px, 256px)');
  assert.equal(resolveMinPlayerWidth('60%'), 'max(60%, 256px)');
  assert.equal(resolveMinPlayerWidth(' 400px '), 'max(400px, 256px)');
});

test('resolveMinPlayerWidth treats numbers as pixels', () => {
  assert.equal(resolveMinPlayerWidth(300), 'max(300px, 256px)');
});

test('resolveMinPlayerWidth falls back to minimum width when missing', () => {
  assert.equal(resolveMinPlayerWidth(undefined), '256px');
  assert.equal(resolveMinPlayerWidth(''), '256px');
  assert.equal(resolveMinPlayerWidth(Number.NaN), '256px');
});
