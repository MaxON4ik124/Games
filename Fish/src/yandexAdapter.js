/* Optional platform bridge. The game itself never requires network or player authorization. */
(() => {
  'use strict';
  const F = window.Fish;
  F.platform = {
    sdk: null, player: null, readySent: false, playing: false, cloudTimer: null, adOpen: false,
    async init() {
      const host = location.hostname;
      // /sdk.js is provided by the Yandex Games hosting environment. Do not request it locally.
      const hosted = /(^|\.)(yandex\.(ru|com|net)|yandexgames\.com|yandexgames\.net|games\.s3\.yandex\.net)$/.test(host) || new URLSearchParams(location.search).has('yandex');
      if (!window.YaGames && hosted) {
        await new Promise(resolve => { const script = document.createElement('script'); script.src = '/sdk.js'; script.onload = resolve; script.onerror = resolve; document.head.appendChild(script); setTimeout(resolve, 3500); });
      }
      if (!window.YaGames) return;
      try {
        this.sdk = await window.YaGames.init();
        this.sdk.on?.('game_api_pause', () => { this.adOpen = true; F.syncPause(); });
        this.sdk.on?.('game_api_resume', () => { this.adOpen = false; F.syncPause(); });
        this.ready(); this.gameplay(!F.fishing.paused);
        // Cloud synchronization is opt-in to avoid silently replacing a session with a delayed response.
      } catch { this.sdk = null; }
    },
    ready() { if (this.sdk && !this.readySent) { try { this.sdk.features?.LoadingAPI?.ready(); this.readySent = true; } catch {} } },
    gameplay(active) { if (!this.sdk || active === this.playing) return; try { if (active) this.sdk.features?.GameplayAPI?.start(); else this.sdk.features?.GameplayAPI?.stop(); this.playing = active; } catch {} },
    async getPlayer() { try { if (!this.player && this.sdk) this.player = await this.sdk.getPlayer(); } catch {} return this.player; },
    async cloudLoad() { const player = await this.getPlayer(); if (!player) return null; try { const data = await player.getData(['fishSave']); return data.fishSave?.version === 1 ? F.sanitize(data.fishSave) : null; } catch { return null; } },
    async cloudSave() { const player = await this.getPlayer(); if (!player) return false; try { await player.setData({ fishSave: F.state }); return true; } catch { return false; } },
    queueSave() { if (!this.player) return; clearTimeout(this.cloudTimer); this.cloudTimer = setTimeout(() => this.cloudSave(), 6000); },
    rewarded(onReward) {
      if (!this.sdk?.adv?.showRewardedVideo) { F.ui.toast('Реклама доступна только на платформе Яндекс Игр.', 'info'); return; }
      let rewarded = false;
      const resume = () => { this.adOpen = false; F.syncPause(); };
      try { this.sdk.adv.showRewardedVideo({ callbacks: { onOpen: () => { this.adOpen = true; F.syncPause(); }, onRewarded: () => { if (!rewarded) { rewarded = true; onReward(); } }, onClose: resume, onError: () => { resume(); F.ui.toast('Реклама сейчас недоступна. Попробуй позже.', 'info'); } } }); } catch { resume(); }
    },
    interstitial() {
      if (!this.sdk?.adv?.showFullscreenAdv) return;
      const resume = () => { this.adOpen = false; F.syncPause(); };
      try { this.sdk.adv.showFullscreenAdv({ callbacks: { onOpen: () => { this.adOpen = true; F.syncPause(); }, onClose: resume, onError: resume } }); } catch { resume(); }
    },
    track(event, params) { window.dispatchEvent(new CustomEvent('fish:analytics', { detail: { event, params } })); }
  };
})();
