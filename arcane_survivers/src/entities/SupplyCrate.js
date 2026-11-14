// src/entities/SupplyCrate.js
import { Entity } from './Entity.js';
import { LootDrop } from './LootDrop.js';
import { CRATE_STAT_BOOSTS } from '../data/metaData.js';

export class SupplyCrate extends Entity {
  constructor(x, y, wave) {
    super(x, y, 22, 26 + (wave - 1) * 9);
  }

  rollDrop() {
    const statBoost = CRATE_STAT_BOOSTS[Math.floor(Math.random() * CRATE_STAT_BOOSTS.length)];
    // 65% шанс: Сфера Статов (+2 макс HP, +2% урона и т.д. + легкий подхил)
    // 35% шанс: Целебный Эликсир (большой отхил + бонус +1 Удачи)
    if (Math.random() < 0.65) {
      return new LootDrop(this.x, this.y, 'stat', 0, statBoost);
    }
    return new LootDrop(this.x, this.y, 'heal', 0, statBoost);
  }
}