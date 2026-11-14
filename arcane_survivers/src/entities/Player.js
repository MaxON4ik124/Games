// src/entities/Player.js
import { Entity } from './Entity.js';

const MAX_PLAYER_SPEED = 380;
const MAX_MASTERY_LEVEL = 5;

export class Player extends Entity {
  constructor(heroConfig, metaLevels = {}) {
    const bonusHp = (metaLevels.hp || 0) * 3;
    super(0, 0, 16, heroConfig.hp + bonusHp);

    this.hero = heroConfig;
    this.speed = Math.min(MAX_PLAYER_SPEED, heroConfig.speed * (1 + (metaLevels.mobility || 0) * 0.05));
    this.magnet = 145 * (1 + (metaLevels.mobility || 0) * 0.20);

    // Манипуляторы мира и удачи
    this.luck = heroConfig.id === 'ignis' ? 5 : 2;
    this.arenaLimit = 1120;
    this.cratesPerWave = 1;
    this.healPotionMult = 1.0;
    this.enemyCountMult = 1.0;
    this.enemySpeedMult = 1.0;

    // Боевые множители
    this.dmgMult = 1.0 + (metaLevels.dmg || 0) * 0.10;
    this.cdrMult = (heroConfig.id === 'malkor' ? 0.80 : 1.0) * Math.pow(0.94, metaLevels.haste || 0);
    this.meleeMult = heroConfig.meleeMult;
    this.rangedMult = heroConfig.rangedMult;
    this.lowLvlMult = heroConfig.lowLvlMult;
    this.highLvlMult = heroConfig.highLvlMult;

    // Опыт и уровни мастерства
    this.charLevel = 1;
    this.xp = 0;
    this.xpToNext = 20;
    this.pendingMasteryPicks = 0;
    this.spellMastery = {};

    this.facing = 1;
    this.walkAnim = 0;
    this.castSwing = 0;
    this.invulnTimer = 0;
  }

  getMasteryLevel(spellId) {
    return (this.spellMastery && this.spellMastery[spellId]) || 0;
  }

  upgradeSpellMastery(spellId) {
    const cur = this.getMasteryLevel(spellId);
    if (cur >= MAX_MASTERY_LEVEL) return false;
    this.spellMastery[spellId] = cur + 1;
    return true;
  }

  gainXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.charLevel++;
      this.xpToNext = Math.round(20 + this.charLevel * 12 * Math.pow(1.06, this.charLevel));

      // Незначительный прирост статов и Удачи за каждый полученный уровень
      this.maxHp += 1;
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.dmgMult += 0.015;
      this.speed = Math.min(MAX_PLAYER_SPEED, this.speed * 1.004);
      this.luck = Math.round((this.luck + 1.5) * 10) / 10;

      if (this.charLevel % 5 === 0) {
        this.pendingMasteryPicks++;
      }
      leveled = true;
    }
    return leveled;
  }

  takeDamage(rawDamage) {
    if (this.invulnTimer > 0 || this.isDead) return 0;
    const dmg = super.takeDamage(rawDamage);
    this.invulnTimer = 0.45;
    return dmg;
  }

  move(mx, my, dt, customLimit) {
    if (!Number.isFinite(this.x)) this.x = 0;
    if (!Number.isFinite(this.y)) this.y = 0;
    if (!Number.isFinite(this.speed)) this.speed = 210;
    this.speed = Math.min(MAX_PLAYER_SPEED, Math.max(90, this.speed));

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      if (len > 0.0001) {
        const nx = len > 1 ? mx / len : mx;
        const ny = len > 1 ? my / len : my;
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        if (Math.abs(nx) > 0.05) this.facing = nx > 0 ? 1 : -1;
        this.walkAnim += dt * 11;
      }
    }

    if (!Number.isFinite(this.arenaLimit) || this.arenaLimit < 300) {
      this.arenaLimit = Number.isFinite(customLimit) ? customLimit : 1120;
    }
    const lim = this.arenaLimit;
    this.x = Math.max(-lim, Math.min(lim, this.x));
    this.y = Math.max(-lim, Math.min(lim, this.y));
  }

  update(dt) {
    super.update(dt);
    if (this.castSwing > 0) this.castSwing = Math.max(0, this.castSwing - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
  }
}