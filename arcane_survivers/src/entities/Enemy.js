// src/entities/Enemy.js
import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(x, y, type, cfg, hpScale = 1, dmgScale = 1) {
    super(x, y, cfg.radius, Math.round(cfg.hp * hpScale));
    this.type = type;
    this.speed = cfg.speed;
    this.dmg = Math.max(1, Math.round(cfg.dmg * dmgScale));
    this.mana = cfg.mana;
    this.shards = cfg.shards;
    this.xp = cfg.xp || 6;
    this.color = cfg.color;
    this.ranged = Boolean(cfg.ranged);
    this.dash = Boolean(cfg.dash);
    this.isBoss = Boolean(cfg.isBoss);
    this.seed = Math.random() * 100;
    this.shootCd = 2.2 + Math.random();
    this.slowTimer = 0;
    this.slowFactor = 1;

    // Статус отравления ядом
    this.poisonTimer = 0;
    this.poisonTick = 0;
    this.poisonDps = 0;
  }

  applySlow(factor, duration = 2.2) {
    this.slowTimer = duration;
    this.slowFactor = Math.max(0.2, 1 - factor);
  }

  applyPoison(dps, duration = 4.0) {
    this.poisonTimer = Math.max(this.poisonTimer, duration);
    this.poisonDps = Math.max(this.poisonDps, Math.round(dps));
    if (this.poisonTick <= 0) this.poisonTick = 0.5;
  }

  updateAI(dt, player, onShoot, onPoisonTick) {
    super.update(dt);
    if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - dt);

    // Периодический урон от яда каждые 0.5 сек
    if (this.poisonTimer > 0 && !this.isDead) {
      this.poisonTimer = Math.max(0, this.poisonTimer - dt);
      this.poisonTick -= dt;
      if (this.poisonTick <= 0) {
        this.poisonTick = 0.5;
        const tickDmg = Math.max(1, Math.round(this.poisonDps * 0.5));
        this.takeDamage(tickDmg);
        if (onPoisonTick) onPoisonTick(this, tickDmg);
        if (this.isDead) return;
      }
    }

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    const ang = Math.atan2(player.y - this.y, player.x - this.x);
    const spd = this.speed * (this.slowTimer > 0 ? this.slowFactor : 1);

    if (this.ranged || this.isBoss) {
      this.shootCd -= dt;
      if (this.shootCd <= 0 && dist < 440) {
        this.shootCd = this.isBoss ? 1.8 : 2.6;
        if (onShoot) onShoot(this, ang);
      }
    }

    if (!this.ranged || dist > 240) {
      this.x += Math.cos(ang) * spd * dt;
      this.y += Math.sin(ang) * spd * dt;
    }
  }
}