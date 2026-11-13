(() => {
  'use strict';
  const F = window.Fish;
  const fishing = F.fishing = {
    phase: 'idle', elapsed: 0, duration: 0, progress: 0, paused: false, lastCatch: null,
    cast() {
      if (this.paused) return;
      if (this.phase === 'bite') { this.phase = 'reeling'; this.elapsed = 0; this.duration = F.config.fishing.reelTime; this.progress = 0; F.audio.play('hook'); F.advanceTutorial(2); F.ui.renderFishing(); return; }
      if (this.phase !== 'idle') return;
      if (F.state.inventory.length >= F.capacity()) { F.ui.toast('Инвентарь заполнен. Продай улов и возвращайся!', 'info'); F.ui.open('inventory'); return; }
      this.phase = 'casting'; this.elapsed = 0; this.duration = F.config.fishing.castTime; this.progress = 0;
      // Equipment and location are captured for this cast, so menu changes never change an ongoing roll.
      this.location = F.state.location; this.bait = F.state.bait; this.rod = F.state.rod; F.state.stats.casts++;
      F.advanceTutorial(0); F.save(); F.audio.play('cast'); F.ui.renderFishing();
    },
    tick(ms) {
      if (this.paused || this.phase === 'idle') return;
      this.elapsed += ms; this.progress = Math.min(1, this.elapsed / this.duration);
      if (this.elapsed >= this.duration) {
        if (this.phase === 'casting') { this.phase = 'waiting'; this.elapsed = 0; this.duration = (F.config.fishing.waitMin + Math.random() * (F.config.fishing.waitMax - F.config.fishing.waitMin)) * (1 - F.config.rods[this.rod].reduction); }
        else if (this.phase === 'waiting') { this.phase = 'bite'; this.elapsed = 0; this.duration = F.config.fishing.biteWindow; F.advanceTutorial(1); F.audio.play('bite'); }
        else if (this.phase === 'bite') { this.cancel(); F.audio.play('miss'); F.ui.toast('Рыба уплыла… В следующий раз подсекай быстрее!', 'info'); }
        else if (this.phase === 'reeling') {
          const probabilities = F.probabilities(this.location, this.bait); let roll = Math.random(); let rarity = 3;
          for (let i = 0; i < probabilities.length; i++) { roll -= probabilities[i]; if (roll < 0) { rarity = i; break; } }
          const fishId = `${this.location}-${rarity}`; const weight = Math.round((.25 + Math.random() * (rarity + 1) * 2.5) * 100) / 100;
          const added = F.addCatch(fishId, weight); this.lastCatch = { fishId, weight }; this.cancel();
          if (added) { F.audio.play(rarity === 3 ? 'legendary' : 'catch'); F.ui.openCatch(this.lastCatch); F.platform?.track('catch', { rarity, location: this.location }); } else F.ui.toast('Нет свободного места в инвентаре.', 'info');
        }
        this.progress = 0; F.ui.renderFishing();
      }
      F.ui.updateProgress();
    },
    cancel() { this.phase = 'idle'; this.elapsed = 0; this.progress = 0; F.ui?.renderFishing(); },
    setPaused(value) { this.paused = value; F.ui?.renderFishing(); F.audio?.suspend(value); F.platform?.gameplay(!value); }
  };
})();
