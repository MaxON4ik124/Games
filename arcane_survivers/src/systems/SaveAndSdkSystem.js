// src/systems/SaveAndSdkSystem.js
import { STORAGE_KEY } from '../data/metaData.js';

export class SaveAndSdkSystem {
  constructor(audio, onCloudSync) {
    this.audio = audio;
    this.onCloudSync = onCloudSync;
    this.ysdk = null;
    this.yPlayer = null;
    this.isSimulated = true;

    this.meta = {
      shards: 30,
      totalRuns: 0,
      bestWave: 1,
      levels: { hp: 0, dmg: 0, haste: 0, wealth: 0, mobility: 0, discount: 0 }
    };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.shards === 'number') this.meta.shards = parsed.shards;
        if (typeof parsed.totalRuns === 'number') this.meta.totalRuns = parsed.totalRuns;
        if (typeof parsed.bestWave === 'number') this.meta.bestWave = parsed.bestWave;
        if (parsed.levels) Object.assign(this.meta.levels, parsed.levels);
      }
    } catch (e) {}
  }

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.meta)); } catch (e) {}
    if (this.yPlayer && typeof this.yPlayer.setData === 'function') {
      this.yPlayer.setData(this.meta, true).catch(() => {});
    }
  }

  getDiscountedCost(baseCost) {
    const mult = 1 - (this.meta.levels.discount || 0) * 0.07;
    return Math.max(4, Math.round(baseCost * mult));
  }

  initSdk() {
    const badge = document.getElementById('sdkStatusBadge');
    const script = document.createElement('script');
    script.src = '/sdk.js';
    script.async = true;
    script.onload = () => {
      if (window.YaGames) {
        window.YaGames.init().then(_sdk => {
          this.ysdk = _sdk;
          this.isSimulated = false;
          if (badge) badge.textContent = 'OOP Modular Engine • Yandex SDK Активен';
          if (_sdk.features && _sdk.features.LoadingAPI) _sdk.features.LoadingAPI.ready();
          return _sdk.getPlayer({ scopes: false });
        }).then(_p => {
          this.yPlayer = _p;
          return _p.getData();
        }).then(data => {
          if (data && typeof data.shards === 'number' && (data.totalRuns || 0) >= this.meta.totalRuns) {
            Object.assign(this.meta, data);
            this.save();
            if (this.onCloudSync) this.onCloudSync();
          }
        }).catch(() => {});
      }
    };
    document.head.appendChild(script);
  }

  gameplayStart() {
    if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
      this.ysdk.features.GameplayAPI.start();
    }
  }

  gameplayStop() {
    if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
      this.ysdk.features.GameplayAPI.stop();
    }
  }

  simulatePopup(title, tag, durationMs, onDone) {
    const modal = document.getElementById('adSimModal');
    document.getElementById('adSimType').textContent = tag;
    document.getElementById('adSimTitle').textContent = title;
    const bar = document.getElementById('adProgressFill');
    bar.style.width = '0%';
    modal.classList.remove('hidden');
    this.audio.setAdMute(true);

    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / durationMs);
      bar.style.width = (p * 100) + '%';
      if (p < 1) requestAnimationFrame(step);
      else {
        modal.classList.add('hidden');
        this.audio.setAdMute(false);
        if (onDone) onDone();
      }
    };
    requestAnimationFrame(step);
  }

  showInterstitial(onDone) {
    this.gameplayStop();
    if (!this.isSimulated && this.ysdk && this.ysdk.adv) {
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => this.audio.setAdMute(true),
          onClose: () => { this.audio.setAdMute(false); if (onDone) onDone(); },
          onError: () => { this.audio.setAdMute(false); if (onDone) onDone(); }
        }
      });
    } else {
      this.simulatePopup('Межволновая реклама', 'ЛОКАЛЬНЫЙ ЭМУЛЯТОР YANDEX SDK', 1000, onDone);
    }
  }

  showRewarded(label, onRewarded) {
    this.gameplayStop();
    if (!this.isSimulated && this.ysdk && this.ysdk.adv) {
      let ok = false;
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => this.audio.setAdMute(true),
          onRewarded: () => { ok = true; },
          onClose: () => { this.audio.setAdMute(false); if (ok && onRewarded) onRewarded(); },
          onError: () => { this.audio.setAdMute(false); }
        }
      });
    } else {
      this.simulatePopup(`Награда: ${label}`, 'ТЕСТ REWARDED VIDEO', 1500, onRewarded);
    }
  }
}