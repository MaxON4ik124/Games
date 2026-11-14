// src/entities/Entity.js
export class Entity {
  constructor(x, y, radius, maxHp = 1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.isDead = false;
    this.flash = 0;
  }

  takeDamage(amount) {
    if (this.isDead) return 0;
    const dmg = Math.max(1, Math.round(amount));
    this.hp -= dmg;
    this.flash = 0.12;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
    }
    return dmg;
  }

  collidesWith(other, extra = 0) {
    return Math.hypot(this.x - other.x, this.y - other.y) <= this.radius + other.radius + extra;
  }

  update(dt) {
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);
  }
}