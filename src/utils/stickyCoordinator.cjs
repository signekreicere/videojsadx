// Shared across all player instances on the page; a sticky stays registered until closed.
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
        if (id !== excludeId && entry.isSticky) {
          return true;
        }
      }
      return false;
    },
    notifyStickyChange(sourceId) {
      entries.forEach((entry, id) => {
        if (id !== sourceId && !entry.isSticky && typeof entry.onStickyChange === 'function') {
          entry.onStickyChange();
        }
      });
    },
  };
}

function shouldYieldToSticky({ isSticky, stickyActive, inView }) {
  return Boolean(!isSticky && stickyActive && inView);
}

function shouldPauseForeignVideo({ stickyActive, insideStpdPlayer, isPlaying, inView }) {
  return Boolean(stickyActive && !insideStpdPlayer && isPlaying && inView);
}

module.exports = {
  createPlayerRegistry,
  shouldPauseForeignVideo,
  shouldYieldToSticky,
};
