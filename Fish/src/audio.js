(() => {
  'use strict';
  const F = window.Fish;
  F.audio = {
    context: null,
    unlock() { if (!F.state.sound) return; try { if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)(); if (this.context.state === 'suspended' && !document.hidden && !F.focusLost && !F.platform?.adOpen) this.context.resume().catch(() => {}); } catch {} },
    suspend(paused) { if (!this.context) return; try { (document.hidden || F.focusLost || F.platform?.adOpen || !F.state.sound ? this.context.suspend() : this.context.resume()).catch(() => {}); } catch {} },
    play(type) {
      if (!F.state.sound) return; this.unlock(); const ctx = this.context; if (!ctx || ctx.state !== 'running') return;
      const notes = { cast: [320, 210], bite: [640, 880, 640], hook: [300, 600], catch: [523, 659, 784], legendary: [523, 659, 784, 1047, 1319], coin: [880, 1175], buy: [440, 554, 659], miss: [320, 220] }[type] || [440];
      notes.forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); const at = ctx.currentTime + i * .095; osc.type = 'sine'; osc.frequency.setValueAtTime(freq, at); gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.07, at + .015); gain.gain.exponentialRampToValueAtTime(.001, at + .22); osc.connect(gain); gain.connect(ctx.destination); osc.start(at); osc.stop(at + .24); });
    }
  };
})();
