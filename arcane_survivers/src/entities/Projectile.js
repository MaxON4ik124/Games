// src/entities/Projectile.js
export class Projectile {
  constructor(x, y, vx, vy, stats) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.stats = stats;
    this.pierce = stats.pierce || 1;
    this.hitSet = new Set();
    this.life = 2.5;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  canHit(target) {
    return !this.hitSet.has(target);
  }

  registerHit(target) {
    this.hitSet.add(target);
    this.pierce--;
    return this.pierce <= 0;
  }
}