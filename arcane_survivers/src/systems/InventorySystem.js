// src/systems/InventorySystem.js
import { SPELLS, RECIPES } from '../data/spellsData.js';

const MAX_SPELL_LEVEL = 4;
const MAX_MASTERY_LEVEL = 5;
const BAG_CAPACITY = 13;

// Гарантируем наличие заклинаний Эволюции Тир 4 даже при старом spellsData.js
if (!SPELLS.vs_hellfire) {
  SPELLS.vs_hellfire = {
    id: 'vs_hellfire', name: 'Пепел Мироздания (ЭВОЛЮЦИЯ)', tier: 4, type: 'ranged', tex: 'armageddon',
    cost: 160, cd: 0.65, dmg: 290, radius: 135, speed: 520, pierce: 8, puddle: true, pull: true, color: '#ff3800',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Сверхмощный залп комет, стягивающих врагов в озера магмы.'
  };
  SPELLS.vs_thunderlord = {
    id: 'vs_thunderlord', name: 'Буря Вечности (ЭВОЛЮЦИЯ)', tier: 4, type: 'chain', tex: 'zeus',
    cost: 160, cd: 0.55, dmg: 240, radius: 380, chains: 14, puddle: true, slow: 0.7, color: '#80f5ff',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Каскад молний на 14 целей с электрическими полями.'
  };
  SPELLS.vs_soulreaver = {
    id: 'vs_soulreaver', name: 'Пожиратель Богов (ЭВОЛЮЦИЯ)', tier: 4, type: 'melee', tex: 'abyssgod',
    cost: 170, cd: 0.60, dmg: 320, radius: 230, vamp: 4, chaos: true, puddle: true, color: '#ff299c',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Разрез пространства вокруг мага с вампиризмом и разломами Хаоса.'
  };
}

export class InventorySystem {
  constructor(maxSlots = 5, tier1Only = false) {
    this.maxSlots = maxSlots;
    this.tier1Only = tier1Only;
    this.maxBagSlots = BAG_CAPACITY;
    this.activeSpells = [];
    this.bagSpells = [];
    this.altar = [null, null];
    this.uidSeq = 1;
  }

  reset(maxSlots, tier1Only, starterSpellId) {
    this.maxSlots = maxSlots;
    this.tier1Only = tier1Only;
    this.maxBagSlots = BAG_CAPACITY;
    this.activeSpells = [this.createSpell(starterSpellId, 1)];
    this.bagSpells = [];
    this.altar = [null, null];
  }

  createSpell(id, level = 1) {
    return {
      uid: this.uidSeq++,
      id,
      level: Math.min(MAX_SPELL_LEVEL, Math.max(1, level)),
      cdTimer: 0
    };
  }

  getAllOwned() {
    return [...this.activeSpells, ...this.bagSpells];
  }

  isFull() {
    return this.activeSpells.length >= this.maxSlots && this.bagSpells.length >= this.maxBagSlots;
  }

  addSpell(inst) {
    if (this.activeSpells.length < this.maxSlots) {
      this.activeSpells.push(inst);
      return true;
    }
    if (this.bagSpells.length < this.maxBagSlots) {
      this.bagSpells.push(inst);
      return true;
    }
    return false;
  }

  findByUid(uid) {
    let s = this.activeSpells.find(x => x.uid === uid);
    if (s) return { inst: s, isActive: true };
    s = this.bagSpells.find(x => x.uid === uid);
    if (s) return { inst: s, isActive: false };
    return null;
  }

  removeByUid(uid) {
    this.altar = this.altar.map(u => (u === uid ? null : u));
    let i = this.activeSpells.findIndex(x => x.uid === uid);
    if (i !== -1) return this.activeSpells.splice(i, 1)[0];
    i = this.bagSpells.findIndex(x => x.uid === uid);
    if (i !== -1) return this.bagSpells.splice(i, 1)[0];
    return null;
  }

  computeStats(inst, player) {
    const base = SPELLS[inst.id] || SPELLS.fireball;
    const mastery = player && typeof player.getMasteryLevel === 'function' ? player.getMasteryLevel(inst.id) : 0;

    const lvlScale = 1 + (inst.level - 1) * 0.45;
    const masteryDmg = 1 + (mastery >= 2 ? 0.25 : 0) + (mastery >= 4 ? 0.35 : 0);

    let dmg = base.dmg * lvlScale * masteryDmg * (player ? player.dmgMult : 1);
    if (player) {
      dmg *= base.type === 'melee' ? player.meleeMult : player.rangedMult;
      if (inst.level <= 2) dmg *= player.lowLvlMult;
      if (inst.level >= 3) dmg *= player.highLvlMult;
    }

    const masteryCdr = mastery >= 3 ? 0.82 : 1.0;
    const cd = Math.max(0.16, base.cd * Math.pow(0.90, inst.level - 1) * masteryCdr * (player ? player.cdrMult : 1));

    const masteryRad = (mastery >= 1 ? 0.20 : 0) + (mastery >= 4 ? 0.30 : 0);
    const radius = base.radius * (1 + (inst.level - 1) * 0.12 + masteryRad) *
      (base.type === 'melee' && player && player.meleeMult > 1 ? 1.25 : 1);

    const baseProjectiles = inst.level >= 4 ? 2 : 1;
    const extraProjectiles = (mastery >= 1 ? 1 : 0) + (mastery >= 2 ? 1 : 0) + (mastery >= 4 ? 1 : 0);

    return {
      ...base,
      mastery,
      dmg: Math.round(dmg),
      cd,
      radius,
      pierce: (base.pierce || 1) + (mastery >= 3 ? 2 : 0),
      chains: (base.chains || 3) + mastery,
      puddle: Boolean(base.puddle || mastery >= 5),
      projectilesCount: baseProjectiles + extraProjectiles
    };
  }

  evaluateAltar(player) {
    const sA = this.findByUid(this.altar[0]);
    const sB = this.findByUid(this.altar[1]);
    if (!sA || !sB || sA.inst.uid === sB.inst.uid) return null;

    const a = sA.inst;
    const b = sB.inst;
    const mastA = player && typeof player.getMasteryLevel === 'function' ? player.getMasteryLevel(a.id) : 0;
    const mastB = player && typeof player.getMasteryLevel === 'function' ? player.getMasteryLevel(b.id) : 0;

    if (a.level >= MAX_SPELL_LEVEL && b.level >= MAX_SPELL_LEVEL &&
        mastA >= MAX_MASTERY_LEVEL && mastB >= MAX_MASTERY_LEVEL) {
      const spA = SPELLS[a.id] || SPELLS.fireball;
      let evoId = 'vs_hellfire';
      if (spA.type === 'chain') evoId = 'vs_thunderlord';
      else if (spA.type === 'melee' || spA.type === 'nova') evoId = 'vs_soulreaver';
      return { id: evoId, level: MAX_SPELL_LEVEL, isEvolution: true };
    }

    if (a.id === b.id && a.level === b.level && a.level < MAX_SPELL_LEVEL) {
      return { id: a.id, level: a.level + 1, isEvolution: false };
    }

    if (this.tier1Only) return null;
    const rec = RECIPES.find(r => (r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id));
    if (rec) {
      return { id: rec.result, level: Math.min(a.level, b.level), isEvolution: false };
    }
    return null;
  }
}