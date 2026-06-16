function pauseAdPlayback(player) {
  if (!player || !player.ima) {
    return;
  }
  if (typeof player.ima.pauseAd === 'function') {
    player.ima.pauseAd();
    return;
  }
  if (typeof player.ima.getAdsManager === 'function') {
    const adsManager = player.ima.getAdsManager();
    if (adsManager && typeof adsManager.pause === 'function') {
      adsManager.pause();
    }
  }
}

function resumeAdPlayback(player) {
  if (!player || !player.ima) {
    return;
  }
  if (typeof player.ima.resumeAd === 'function') {
    player.ima.resumeAd();
    return;
  }
  if (typeof player.ima.getAdsManager === 'function') {
    const adsManager = player.ima.getAdsManager();
    if (adsManager && typeof adsManager.resume === 'function') {
      adsManager.resume();
    }
  }
}

function syncAdVolume(player) {
  if (
    !player ||
    !player.ima ||
    typeof player.muted !== 'function' ||
    typeof player.volume !== 'function'
  ) {
    return;
  }

  const volume = player.volume();
  const isMuted = player.muted() || volume === 0;

  if (player.ima.controller && player.ima.controller.settings) {
    player.ima.controller.settings.adsWillPlayMuted = isMuted;
  }

  if (typeof player.ima.getAdsManager === 'function') {
    const adsManager = player.ima.getAdsManager();
    if (adsManager && typeof adsManager.setVolume === 'function') {
      adsManager.setVolume(isMuted ? 0 : volume);
    }
  }
}

module.exports = {
  pauseAdPlayback,
  resumeAdPlayback,
  syncAdVolume,
};
