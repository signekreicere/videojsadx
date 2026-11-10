// Google Ad Manager filters programmatic video below 256px on the longest side (256x144 at 16:9).
const MIN_PLAYER_WIDTH_PX = 256;
const MIN_PLAYER_HEIGHT_PX = 144;

function resolveMinPlayerWidth(width) {
  const minWidth = MIN_PLAYER_WIDTH_PX + 'px';

  if (Number.isFinite(width)) {
    return 'max(' + width + 'px, ' + minWidth + ')';
  }

  if (typeof width !== 'string' || width.trim() === '') {
    return minWidth;
  }

  return 'max(' + width.trim() + ', ' + minWidth + ')';
}

module.exports = {
  MIN_PLAYER_HEIGHT_PX,
  MIN_PLAYER_WIDTH_PX,
  resolveMinPlayerWidth,
};
