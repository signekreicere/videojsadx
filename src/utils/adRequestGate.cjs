const CONSENT_READY_STATUSES = ['tcloaded', 'useractioncomplete'];
const DEFAULT_CMP_RESPONSE_TIMEOUT_MS = 3000;
const ENGAGEMENT_EVENT_TYPES = ['scroll', 'wheel', 'pointerdown', 'touchstart', 'keydown'];

function createGate() {
  let ready = false;
  let reason = null;
  const callbacks = [];
  return {
    isReady: () => ready,
    getReason: () => reason,
    onReady(callback) {
      if (ready) {
        callback(reason);
      } else {
        callbacks.push(callback);
      }
    },
    open(openReason) {
      if (ready) {
        return false;
      }
      ready = true;
      reason = openReason;
      callbacks.splice(0).forEach((callback) => callback(reason));
      return true;
    },
  };
}

// Opens once the TCF CMP has an answer (stored or new), GDPR does not apply, or there is no CMP.
// A CMP showing its banner (cmpuishown) keeps the gate closed until the visitor decides.
function createConsentGate(options = {}) {
  const win = options.win;
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? options.timeoutMs
    : DEFAULT_CMP_RESPONSE_TIMEOUT_MS;
  const setTimer = options.setTimer || setTimeout;
  const clearTimer = options.clearTimer || clearTimeout;
  const gate = createGate();

  if (!win || typeof win.__tcfapi !== 'function') {
    gate.open('no-cmp');
    return gate;
  }

  let listenerId = null;
  const removeListener = () => {
    if (listenerId !== null && listenerId !== undefined) {
      try {
        win.__tcfapi('removeEventListener', 2, () => {}, listenerId);
      } catch (e) {
        // CMP may already be gone; nothing to clean up.
      }
      listenerId = null;
    }
  };
  // A CMP that never answers must not block ads for the whole pageview.
  let timer = setTimer(() => {
    timer = null;
    gate.open('cmp-timeout');
  }, timeoutMs);
  const stopTimer = () => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  };

  try {
    win.__tcfapi('addEventListener', 2, (tcData, success) => {
      if (tcData && tcData.listenerId !== undefined) {
        listenerId = tcData.listenerId;
      }
      if (gate.isReady()) {
        removeListener();
        return;
      }
      stopTimer();
      if (!success || !tcData) {
        gate.open('cmp-error');
      } else if (tcData.gdprApplies === false) {
        gate.open('gdpr-not-applicable');
      } else if (CONSENT_READY_STATUSES.includes(tcData.eventStatus)) {
        gate.open(tcData.eventStatus);
      }
      if (gate.isReady()) {
        removeListener();
      }
    });
  } catch (e) {
    stopTimer();
    gate.open('cmp-error');
  }

  return gate;
}

// Opens on the first visitor interaction, or after holdMs of the page being visible.
function createEngagementGate(options = {}) {
  const doc = options.doc;
  const holdMs = Number.isFinite(options.holdMs) ? Math.max(options.holdMs, 0) : 0;
  const setTimer = options.setTimer || setTimeout;
  const clearTimer = options.clearTimer || clearTimeout;
  const gate = createGate();

  if (holdMs === 0) {
    gate.open('no-hold');
    return gate;
  }
  if (options.alreadyEngaged) {
    gate.open('interaction');
    return gate;
  }
  if (!doc) {
    gate.open('no-document');
    return gate;
  }

  let timer = null;
  const listenerOptions = { capture: true, passive: true };
  const stopTimer = () => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  };
  const cleanup = () => {
    stopTimer();
    ENGAGEMENT_EVENT_TYPES.forEach((type) =>
      doc.removeEventListener(type, onInteraction, listenerOptions)
    );
    doc.removeEventListener('visibilitychange', syncDwellTimer);
  };
  const openGate = (reason) => {
    if (gate.open(reason)) {
      cleanup();
    }
  };
  function onInteraction(event) {
    openGate('interaction:' + event.type);
  }
  // Dwell time only counts while the page is visible, so background tabs don't qualify.
  function syncDwellTimer() {
    if (doc.visibilityState === 'hidden') {
      stopTimer();
    } else if (timer === null) {
      timer = setTimer(() => {
        timer = null;
        openGate('dwell');
      }, holdMs);
    }
  }

  ENGAGEMENT_EVENT_TYPES.forEach((type) =>
    doc.addEventListener(type, onInteraction, listenerOptions)
  );
  doc.addEventListener('visibilitychange', syncDwellTimer);
  syncDwellTimer();

  return gate;
}

module.exports = {
  CONSENT_READY_STATUSES,
  ENGAGEMENT_EVENT_TYPES,
  createConsentGate,
  createEngagementGate,
};
