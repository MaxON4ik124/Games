// src/entities/LootDrop.js
export class LootDrop {
  constructor(x, y, kind, value = 1, relic = null) {
    this.x = x;
    this.y = y;
    this.kind = kind; // 'mana' | 'heal' | 'relic'
    this.value = value;
    this.relic = relic;
    this.radius = 18;
  }
}