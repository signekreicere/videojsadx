const FALLBACK_USER_ACTIVATION_EVENT_TYPES = Object.freeze([
  'keydown',
  'mousedown',
  'pointerdown',
  'pointerup',
  'touchend',
]);

function getUserActivationState({ navigatorObj, documentObj }) {
  if (navigatorObj && navigatorObj.userActivation) {
    return navigatorObj.userActivation;
  }

  if (documentObj && documentObj.userActivation) {
    return documentObj.userActivation;
  }

  return null;
}

function shouldTrackFallbackActivation({ navigatorObj, documentObj }) {
  return !getUserActivationState({ navigatorObj, documentObj });
}

function isFallbackKeydownActivationEvent(event) {
  if (!event || event.type !== 'keydown') {
    return false;
  }

  const key = event.key;
  if (key === 'Escape' || key === 'Esc') {
    return false;
  }

  return !(event.metaKey || event.ctrlKey || event.altKey);
}

function isFallbackUserActivationEvent(event) {
  if (!event || typeof event.type !== 'string') {
    return false;
  }

  switch (event.type) {
    case 'keydown':
      return isFallbackKeydownActivationEvent(event);
    case 'mousedown':
      return true;
    case 'pointerdown':
      return event.pointerType === 'mouse';
    case 'pointerup':
      return event.pointerType !== 'mouse';
    case 'touchend':
      return true;
    default:
      return false;
  }
}

function hasUserActivationState({
  navigatorObj,
  documentObj,
  lastUserActivationAt,
  nowMs = Date.now(),
  fallbackWindowMs = 10000,
}) {
  const userActivation = getUserActivationState({ navigatorObj, documentObj });

  if (userActivation) {
    return Boolean(userActivation.isActive || userActivation.hasBeenActive);
  }

  if (!lastUserActivationAt) {
    return false;
  }

  return nowMs - lastUserActivationAt <= fallbackWindowMs;
}

module.exports = {
  FALLBACK_USER_ACTIVATION_EVENT_TYPES,
  hasUserActivationState,
  isFallbackUserActivationEvent,
  shouldTrackFallbackActivation,
};
