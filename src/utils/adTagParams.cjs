function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setAdTagParam(url, key, value) {
  const source = typeof url === 'string' ? url : '';
  const hashIndex = source.indexOf('#');
  const base = hashIndex >= 0 ? source.slice(0, hashIndex) : source;
  const hash = hashIndex >= 0 ? source.slice(hashIndex) : '';
  const param = key + '=' + encodeURIComponent(String(value));
  const pattern = new RegExp('([?&])' + escapeRegExp(key) + '=[^&]*');

  if (pattern.test(base)) {
    return base.replace(pattern, (match, separator) => separator + param) + hash;
  }

  const separator = base.includes('?') ? '&' : '?';
  return base + separator + param + hash;
}

module.exports = {
  setAdTagParam,
};
