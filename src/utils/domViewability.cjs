function resolveWindow(win) {
  if (win) {
    return win;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  return null;
}

function resolveDocument(doc) {
  if (doc) {
    return doc;
  }
  if (typeof document !== 'undefined') {
    return document;
  }
  return null;
}

function isElementOutOfView(el, win, doc) {
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    return true;
  }
  const resolvedWindow = resolveWindow(win);
  const resolvedDocument = resolveDocument(doc);
  if (!resolvedWindow && !resolvedDocument) {
    return true;
  }
  const rect = el.getBoundingClientRect();
  const viewportHeight = resolvedWindow
    ? resolvedWindow.innerHeight
    : resolvedDocument.documentElement.clientHeight;
  return rect.bottom <= 0 || rect.top >= viewportHeight;
}

function getElementViewRatio(el, win, doc) {
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    return 0;
  }
  const resolvedWindow = resolveWindow(win);
  const resolvedDocument = resolveDocument(doc);
  if (!resolvedWindow && !resolvedDocument) {
    return 0;
  }

  const rect = el.getBoundingClientRect();
  const viewportHeight = resolvedWindow
    ? resolvedWindow.innerHeight
    : resolvedDocument.documentElement.clientHeight;
  const viewportWidth = resolvedWindow
    ? resolvedWindow.innerWidth
    : resolvedDocument.documentElement.clientWidth;

  if (rect.width <= 0 || rect.height <= 0) {
    return 0;
  }

  const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
  );
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = rect.width * rect.height;

  return totalArea > 0 ? visibleArea / totalArea : 0;
}

function isElementViewable(el, threshold, win, doc) {
  return getElementViewRatio(el, win, doc) >= threshold;
}

module.exports = {
  getElementViewRatio,
  isElementOutOfView,
  isElementViewable,
};
