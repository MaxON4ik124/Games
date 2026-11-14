// src/systems/AudioSystem.js
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.userEnabled = true;
    this.adMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  playTone(freqStart, freqEnd, duration, type = 'sine', vol = 0.11) {
    if (!this.userEnabled || this.adMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  toggle() { this.userEnabled = !this.userEnabled; return this.userEnabled; }
  setAdMute(m) { this.adMuted = m; }
  shoot()  { this.playTone(520, 150, 0.11, 'triangle', 0.08); }
  melee()  { this.playTone(230, 70, 0.15, 'sawtooth', 0.10); }
  zap()    { this.playTone(980, 260, 0.12, 'square', 0.07); }
  gem()    { this.playTone(680, 1220, 0.08, 'sine', 0.07); }
  crate()  { this.playTone(190, 65, 0.12, 'square', 0.11); }
  heal()   {
    this.playTone(420, 760, 0.16, 'sine', 0.12);
    setTimeout(() => this.playTone(640, 1080, 0.22, 'triangle', 0.12), 70);
  }
  craft()  {
    this.playTone(440, 880, 0.18, 'triangle', 0.12);
    setTimeout(() => this.playTone(660, 1320, 0.25, 'sine', 0.14), 90);
  }
  revive() {
    this.playTone(330, 660, 0.22, 'sine', 0.14);
    setTimeout(() => this.playTone(550, 1100, 0.35, 'triangle', 0.15), 120);
  }
  hit()    { this.playTone(140, 50, 0.09, 'sawtooth', 0.09); }
}