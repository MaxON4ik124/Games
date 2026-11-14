// src/systems/WaveSpawner.js
import { Enemy } from '../entities/Enemy.js';
import { SupplyCrate } from '../entities/SupplyCrate.js';

export const ENEMY_CATALOG = {
  // Увеличено здоровье всем врагам; мана = 1 со всех обычных, кроме фиолетовых (acolyte) и больших серых (golem), где мана = 2
  imp:     { hp: 58,   speed: 145, radius: 16, dmg: 2, mana: 1,  shards: 1, xp: 7,  color: '#e63950' },
  scarab:  { hp: 50,   speed: 184, radius: 15, dmg: 3, mana: 1,  shards: 1, xp: 8,  color: '#9be639' },
  acolyte: { hp: 96,   speed: 106, radius: 18, dmg: 3, mana: 2,  shards: 2, xp: 11, color: '#a84dff', ranged: true },
  stalker: { hp: 125,  speed: 178, radius: 17, dmg: 4, mana: 1,  shards: 2, xp: 13, color: '#38e8d6', dash: true },
  golem:   { hp: 260,  speed: 78,  radius: 26, dmg: 5, mana: 2,  shards: 3, xp: 18, color: '#7b8a9e' },
  boss:    { hp: 1950, speed: 98,  radius: 42, dmg: 7, mana: 15, shards: 25,xp: 90, color: '#ff1f40', isBoss: true }
};

export class WaveSpawner {
  constructor() {
    this.enemyTimer = 0;
    this.waveDuration = 30;
    this.totalCratesForWave = 1;
    this.cratesSpawnedSoFar = 0;
  }

  reset(waveDuration = 30, totalCrates = 1) {
    this.enemyTimer = 0;
    this.waveDuration = waveDuration;
    this.totalCratesForWave = Math.max(1, totalCrates);
    this.cratesSpawnedSoFar = 0;
  }

  // На 1-й волне x1.0, к 10-й волне ровно x5.0 живучести
  getHpScale(wave) {
    const w = Math.max(0, wave - 1);
    return 1 + w * 0.30 + w * w * 0.016;
  }

  spawnSingleCrate(wave, player) {
    const lim = Number.isFinite(player.arenaLimit) ? player.arenaLimit : 1120;
    const maxDist = Math.max(220, lim - 140);
    const ang = Math.random() * Math.PI * 2;
    const dist = 180 + Math.random() * (maxDist - 180);
    return new SupplyCrate(Math.cos(ang) * dist, Math.sin(ang) * dist, wave);
  }

  pickType(wave) {
    const r = Math.random();
    if (wave === 1) return 'imp';
    if (wave === 2) return r < 0.72 ? 'imp' : 'scarab';
    if (wave === 3) {
      if (r < 0.52) return 'imp';
      if (r < 0.78) return 'scarab';
      return 'acolyte';
    }
    if (wave <= 5) {
      if (r < 0.42) return 'imp';
      if (r < 0.66) return 'scarab';
      if (r < 0.85) return 'acolyte';
      return 'golem';
    }
    if (r < 0.34) return 'imp';
    if (r < 0.56) return 'scarab';
    if (r < 0.74) return 'acolyte';
    if (r < 0.88) return 'stalker';
    return 'golem';
  }

  createEnemyAt(x, y, wave, player, forcedType = null) {
    const type = forcedType || this.pickType(wave);
    const cfg = ENEMY_CATALOG[type];
    const hpScale = this.getHpScale(wave);
    const dmgScale = 1 + Math.floor((wave - 1) / 3) * 0.25;
    const waveSpeedScale = 1 + Math.min(0.40, (wave - 1) * 0.03);
    const playerEnemySpeedMod = Number.isFinite(player.enemySpeedMult) ? player.enemySpeedMult : 1.0;

    const enemy = new Enemy(x, y, type, cfg, hpScale, dmgScale);
    enemy.speed = Math.max(45, Math.round(cfg.speed * waveSpeedScale * playerEnemySpeedMod));
    return enemy;
  }

  spawnEnemy(wave, player, forcedType = null) {
    const lim = Number.isFinite(player.arenaLimit) ? player.arenaLimit : 1120;
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.min(lim - 60, 380 + Math.random() * 140);
    const x = Math.max(-lim + 40, Math.min(lim - 40, player.x + Math.cos(ang) * dist));
    const y = Math.max(-lim + 40, Math.min(lim - 40, player.y + Math.sin(ang) * dist));
    return this.createEnemyAt(x, y, wave, player, forcedType);
  }

  // На 1-й волне размер пачки прежний (2..3 моба), а со 2-й волны группы значительно больше!
  queueGroupSpawn(wave, player, spawnWarnings) {
    const lim = Number.isFinite(player.arenaLimit) ? player.arenaLimit : 1120;
    const centerAng = Math.random() * Math.PI * 2;
    const centerDist = 175 + Math.random() * 260;
    const cx = Math.max(-lim + 100, Math.min(lim - 100, player.x + Math.cos(centerAng) * centerDist));
    const cy = Math.max(-lim + 100, Math.min(lim - 100, player.y + Math.sin(centerAng) * centerDist));

    let packSize;
    if (wave === 1) {
      packSize = 2 + Math.floor(Math.random() * 2); // На 1-й волне 2–3 врага в группе
    } else {
      const minPack = 4 + Math.floor((wave - 1) * 0.9);
      const maxPack = 6 + Math.floor((wave - 1) * 1.3);
      packSize = minPack + Math.floor(Math.random() * (maxPack - minPack + 1));
    }

    for (let i = 0; i < packSize; i++) {
      const offsetAng = (i / packSize) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
      const offsetDist = 26 + Math.random() * 72;
      const sx = Math.max(-lim + 35, Math.min(lim - 35, cx + Math.cos(offsetAng) * offsetDist));
      const sy = Math.max(-lim + 35, Math.min(lim - 35, cy + Math.sin(offsetAng) * offsetDist));
      const type = this.pickType(wave);
      const cfg = ENEMY_CATALOG[type];

      spawnWarnings.push({
        x: sx,
        y: sy,
        type,
        radius: cfg.radius + 6,
        color: cfg.color,
        timer: 1.15,
        maxTimer: 1.15
      });
    }
  }

  update(dt, wave, waveTimer, player, enemies, spawnWarnings, onSpawnEnemy, onSpawnCrate) {
    // 1. Поэтапный спавн ящиков по таймеру волны (30с, 15с и т.д.)
    while (this.cratesSpawnedSoFar < this.totalCratesForWave) {
      const nextTriggerTime = this.waveDuration * (this.totalCratesForWave - this.cratesSpawnedSoFar) / this.totalCratesForWave;
      if (waveTimer <= nextTriggerTime + 0.05) {
        this.cratesSpawnedSoFar++;
        if (onSpawnCrate) onSpawnCrate(this.spawnSingleCrate(wave, player));
      } else {
        break;
      }
    }

    // 2. Обновление меток спавна на земле
    if (Array.isArray(spawnWarnings)) {
      for (let i = spawnWarnings.length - 1; i >= 0; i--) {
        const sw = spawnWarnings[i];
        sw.timer -= dt;
        if (sw.timer <= 0) {
          onSpawnEnemy(this.createEnemyAt(sw.x, sw.y, wave, player, sw.type));
          spawnWarnings.splice(i, 1);
        }
      }
    }

    // 3. Задержка между группами: на 1-й волне ровно 5.0 секунд, на высоких волнах плавно сокращается до 2.2с
    const countMult = Number.isFinite(player.enemyCountMult) ? player.enemyCountMult : 1.0;
    const maxEnemies = Math.max(12, Math.round((24 + wave * 14) * countMult));

    const basePackInterval = Math.max(2.2, 5.0 - (wave - 1) * 0.28);
    const finalPackInterval = basePackInterval / countMult;

    this.enemyTimer += dt;
    if (this.enemyTimer >= finalPackInterval) {
      this.enemyTimer = 0;
      const pendingCount = Array.isArray(spawnWarnings) ? spawnWarnings.length : 0;
      if (enemies.length + pendingCount < maxEnemies && Array.isArray(spawnWarnings)) {
        this.queueGroupSpawn(wave, player, spawnWarnings);
      }
    }
  }
}