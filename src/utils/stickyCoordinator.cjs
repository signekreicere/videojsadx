// Shared across all player instances on the page; entries report whether they are sticky right now.
function isEntryPlaying(entry) {
  return typeof entry.isStickyPlaying === 'function' && entry.isStickyPlaying();
}

function createPlayerRegistry() {
  const entries = new Map();

  return {
    register(id, entry) {
      entries.set(id, entry);
    },
    unregister(id) {
      entries.delete(id);
    },
    hasActiveSticky(excludeId) {
      for (const [id, entry] of entries) {
        if (id !== excludeId && entry.isStickyActive()) {
          return true;
        }
      }
      return false;
    },
    hasPlayingSticky(excludeId) {
      for (const [id, entry] of entries) {
        if (id !== excludeId && isEntryPlaying(entry)) {
          return true;
        }
      }
      return false;
    },
    yieldPlayingStickies(excludeId) {
      entries.forEach((entry, id) => {
        if (id !== excludeId && isEntryPlaying(entry) && typeof entry.yieldToUser === 'function') {
          entry.yieldToUser();
        }
      });
    },
    notifyStickyChange(sourceId) {
      entries.forEach((entry, id) => {
        if (id !== sourceId && typeof entry.onStickyChange === 'function') {
          entry.onStickyChange();
        }
      });
    },
  };
}

const STICKY_MODES = {
  ALWAYS: 'always',
  ON_LOAD: 'onLoad',
};

// alwaysSticky wins over stickyOnLoad; both need content and a docked position for this device.
function resolveStickyMode({ alwaysSticky, stickyOnLoad, hasVideoSrc, hasDeviceMiniPlayer }) {
  const requested = alwaysSticky ? 'alwaysSticky' : stickyOnLoad ? 'stickyOnLoad' : null;
  if (!requested) {
    return { mode: null, warning: null };
  }
  if (!hasVideoSrc) {
    return {
      mode: null,
      warning: requested + ' requires videoSrc (ads-only slots must use GPT plcmt=4)',
    };
  }
  if (!hasDeviceMiniPlayer) {
    return {
      mode: null,
      warning: requested + ' requires miniPlayer / miniPlayerMobile config for this device',
    };
  }
  return {
    mode: alwaysSticky ? STICKY_MODES.ALWAYS : STICKY_MODES.ON_LOAD,
    warning: alwaysSticky && stickyOnLoad ? 'alwaysSticky overrides stickyOnLoad' : null,
  };
}

function shouldYieldToSticky({ isSticky, stickyActive, inView }) {
  return Boolean(!isSticky && stickyActive && inView);
}

function shouldPauseForeignVideo({ stickyActive, insideStpdPlayer, isPlaying, inView }) {
  return Boolean(stickyActive && !insideStpdPlayer && isPlaying && inView);
}

// Playback counts as user-started when the user interacted with that player moments before.
function isUserInitiatedPlay({ interactionAt, interactionInside, nowMs, windowMs = 2000 }) {
  return Boolean(interactionInside && interactionAt && nowMs - interactionAt <= windowMs);
}

module.exports = {
  STICKY_MODES,
  createPlayerRegistry,
  isUserInitiatedPlay,
  resolveStickyMode,
  shouldPauseForeignVideo,
  shouldYieldToSticky,
};
