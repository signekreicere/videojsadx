function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitHash(url) {
  const source = typeof url === 'string' ? url : '';
  const hashIndex = source.indexOf('#');
  return hashIndex >= 0
    ? { base: source.slice(0, hashIndex), hash: source.slice(hashIndex) }
    : { base: source, hash: '' };
}

function setAdTagParam(url, key, value) {
  const { base, hash } = splitHash(url);
  const param = key + '=' + encodeURIComponent(String(value));
  const pattern = new RegExp('([?&])' + escapeRegExp(key) + '=[^&]*');

  if (pattern.test(base)) {
    return base.replace(pattern, (match, separator) => separator + param) + hash;
  }

  const separator = base.includes('?') ? '&' : '?';
  return base + separator + param + hash;
}

function removeAdTagParam(url, key) {
  const { base, hash } = splitHash(url);
  const pattern = new RegExp('([?&])' + escapeRegExp(key) + '=[^&]*(&?)');
  let result = base;
  let previous;
  do {
    previous = result;
    result = result.replace(pattern, (match, separator, trailing) => {
      if (separator === '?') {
        return trailing ? '?' : '';
      }
      return trailing ? '&' : '';
    });
  } while (result !== previous);
  return result + hash;
}

// vid_d must be the real content duration; omit it rather than send a guess.
function setAdTagVideoDuration(url, seconds) {
  if (Number.isFinite(seconds) && seconds > 0) {
    return setAdTagParam(url, 'vid_d', Math.round(seconds));
  }
  return removeAdTagParam(url, 'vid_d');
}

module.exports = {
  removeAdTagParam,
  setAdTagParam,
  setAdTagVideoDuration,
};
