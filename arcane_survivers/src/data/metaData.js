// src/data/metaData.js
export const STORAGE_KEY = 'abyss_alchemist_meta_v2';
export const MAX_PLAYER_SPEED = 380;

export const META_UPGRADES = [
  { id: 'hp',       name: 'Кровь Древних',         maxLvl: 5, baseCost: 15, costStep: 15, tex: 'meta_hp',       desc: '+3 к макс. здоровью за каждый уровень.' },
  { id: 'dmg',      name: 'Печать Разрушения',     maxLvl: 5, baseCost: 20, costStep: 20, tex: 'meta_dmg',      desc: '+10% ко всему магическому урону за уровень.' },
  { id: 'haste',    name: 'Поток Времени',         maxLvl: 5, baseCost: 22, costStep: 22, tex: 'meta_haste',    desc: '+6% к скорости перезарядки заклинаний за уровень.' },
  { id: 'wealth',   name: 'Астральный Кошель',     maxLvl: 5, baseCost: 16, costStep: 16, tex: 'meta_wealth',   desc: '+15 стартовых кристаллов маны в начале забега.' },
  { id: 'mobility', name: 'Поступь Тени',          maxLvl: 5, baseCost: 15, costStep: 15, tex: 'meta_mobility', desc: '+5% к скорости бега и +20% к радиусу магнита.' },
  { id: 'discount', name: 'Благословение Кузницы', maxLvl: 5, baseCost: 20, costStep: 20, tex: 'meta_discount', desc: '-7% стоимость всех покупок в лавке за уровень.' }
];

// Небольшие постоянные баффы статов, выпадающие из разрушаемых ящиков на арене
export const CRATE_STAT_BOOSTS = [
  {
    id: 'crate_hp',
    name: '+2 Макс. HP',
    color: '#52e69e',
    apply: p => { p.maxHp += 2; p.hp = Math.min(p.maxHp, p.hp + 2); }
  },
  {
    id: 'crate_dmg',
    name: '+2% Урона',
    color: '#ff9e2c',
    apply: p => { p.dmgMult = (p.dmgMult || 1) + 0.02; }
  },
  {
    id: 'crate_speed',
    name: '+2% Скорости',
    color: '#38b6ff',
    apply: p => { p.speed = Math.min(MAX_PLAYER_SPEED, (p.speed || 210) * 1.02); }
  },
  {
    id: 'crate_haste',
    name: '+2% Перезарядки',
    color: '#e594ff',
    apply: p => { p.cdrMult = Math.max(0.25, (p.cdrMult || 1) * 0.98); }
  },
  {
    id: 'crate_luck',
    name: '+3 Удачи',
    color: '#ffd275',
    apply: p => { p.luck = (p.luck || 0) + 3; }
  }
];

// Предметы магазина, разделенные на 4 тира редкости (Слабые, Средние, Сильные, Легендарные)
export const RELICS = [
  // ================= ТИР 1: СЛАБЫЕ (БЕЗ МИНУСОВ) =================
  {
    id: 't1_vitality_ring',
    name: 'Медное Кольцо Жизни',
    tier: 1,
    rarityLabel: 'Обычный предмет',
    tex: 'meta_hp',
    cost: 12,
    desc: '+2 к макс. здоровью и лечение +2 HP.',
    apply: p => { p.maxHp += 2; p.hp = Math.min(p.maxHp, p.hp + 2); }
  },
  {
    id: 't1_ember_rune',
    name: 'Малая Руна Огня',
    tier: 1,
    rarityLabel: 'Обычный предмет',
    tex: 'meta_dmg',
    cost: 13,
    desc: '+3% ко всему магическому урону.',
    apply: p => { p.dmgMult = (p.dmgMult || 1) + 0.03; }
  },
  {
    id: 't1_feather_boots',
    name: 'Легкие Поножи',
    tier: 1,
    rarityLabel: 'Обычный предмет',
    tex: 'meta_mobility',
    cost: 12,
    desc: '+3% к скорости передвижения мага.',
    apply: p => { p.speed = Math.min(MAX_PLAYER_SPEED, (p.speed || 210) * 1.03); }
  },
  {
    id: 't1_lucky_coin',
    name: 'Счастливый Клевер',
    tier: 1,
    rarityLabel: 'Обычный предмет',
    tex: 'meta_wealth',
    cost: 12,
    desc: '+4 к Удаче (выше шанс редких вещей и спеллов).',
    apply: p => { p.luck = (p.luck || 0) + 4; }
  },
  {
    id: 't1_quartz_pendulum',
    name: 'Кварцевый Маятник',
    tier: 1,
    rarityLabel: 'Обычный предмет',
    tex: 'meta_haste',
    cost: 14,
    desc: '+3% к скорости перезарядки заклинаний.',
    apply: p => { p.cdrMult = Math.max(0.25, (p.cdrMult || 1) * 0.97); }
  },

  // ================= ТИР 2: СРЕДНИЕ (МАЛЕНЬКИЕ МИНУСЫ) =================
  {
    id: 't2_oak_amulet',
    name: 'Дубовый Амулет',
    tier: 2,
    rarityLabel: 'Необычный предмет',
    tex: 'meta_hp',
    cost: 19,
    desc: '+5 к макс. здоровью, но -2% ко всему урону.',
    apply: p => {
      p.maxHp += 5;
      p.hp = Math.min(p.maxHp, p.hp + 5);
      p.dmgMult = Math.max(0.35, (p.dmgMult || 1) - 0.02);
    }
  },
  {
    id: 't2_obsidian_lens',
    name: 'Обсидиановая Линза',
    tier: 2,
    rarityLabel: 'Необычный предмет',
    tex: 'meta_dmg',
    cost: 20,
    desc: '+6% к магическому урону, но -2 к макс. здоровью.',
    apply: p => {
      p.dmgMult = (p.dmgMult || 1) + 0.06;
      p.maxHp = Math.max(5, p.maxHp - 2);
      p.hp = Math.min(p.hp, p.maxHp);
    }
  },
  {
    id: 't2_chrono_gear',
    name: 'Заводная Шестерня',
    tier: 2,
    rarityLabel: 'Необычный предмет',
    tex: 'meta_haste',
    cost: 20,
    desc: '+5% к скорости перезарядки, но -2% к скорости бега.',
    apply: p => {
      p.cdrMult = Math.max(0.25, (p.cdrMult || 1) * 0.95);
      p.speed = Math.max(110, (p.speed || 210) * 0.98);
    }
  },
  {
    id: 't2_gambler_dice',
    name: 'Кости Шулера',
    tier: 2,
    rarityLabel: 'Необычный предмет',
    tex: 'meta_wealth',
    cost: 19,
    desc: '+8 к Удаче и +15% радиус магнита, но -2% к урону.',
    apply: p => {
      p.luck = (p.luck || 0) + 8;
      p.magnet = Math.min(950, (p.magnet || 145) * 1.15);
      p.dmgMult = Math.max(0.35, (p.dmgMult || 1) - 0.02);
    }
  },

  // ================= ТИР 3: СИЛЬНЫЕ (СРЕДНИЕ МИНУСЫ) =================
  {
    id: 't3_golem_heart',
    name: 'Сердце Бастиона',
    tier: 3,
    rarityLabel: 'Редкий предмет',
    tex: 'meta_hp',
    cost: 28,
    desc: '+10 к макс. здоровью, но -3% урона и -3% скорости бега.',
    apply: p => {
      p.maxHp += 10;
      p.hp = Math.min(p.maxHp, p.hp + 10);
      p.dmgMult = Math.max(0.35, (p.dmgMult || 1) - 0.03);
      p.speed = Math.max(110, (p.speed || 210) * 0.97);
    }
  },
  {
    id: 't3_blood_pact',
    name: 'Кровавый Манускрипт',
    tier: 3,
    rarityLabel: 'Редкий предмет',
    tex: 'meta_dmg',
    cost: 30,
    desc: '+12% ко всему урону, но -4 макс. HP и -3% скорости бега.',
    apply: p => {
      p.dmgMult = (p.dmgMult || 1) + 0.12;
      p.maxHp = Math.max(5, p.maxHp - 4);
      p.hp = Math.min(p.hp, p.maxHp);
      p.speed = Math.max(110, (p.speed || 210) * 0.97);
    }
  },
  {
    id: 't3_aether_reactor',
    name: 'Эфирный Реактор',
    tier: 3,
    rarityLabel: 'Редкий предмет',
    tex: 'meta_haste',
    cost: 30,
    desc: '+10% к скорости перезарядки и +6 Удачи, но -3 макс. HP и -3% урона.',
    apply: p => {
      p.cdrMult = Math.max(0.25, (p.cdrMult || 1) * 0.90);
      p.luck = (p.luck || 0) + 6;
      p.maxHp = Math.max(5, p.maxHp - 3);
      p.hp = Math.min(p.hp, p.maxHp);
      p.dmgMult = Math.max(0.35, (p.dmgMult || 1) - 0.03);
    }
  },

  // ================= ТИР 4: ЛЕГЕНДАРНЫЕ (УНИКАЛЬНЫЕ БОНУСЫ МИРА) =================
  {
    id: 't4_royal_supply',
    name: 'Королевский Караван',
    tier: 4,
    rarityLabel: 'ЛЕГЕНДАРНЫЙ',
    tex: 'relicDrop',
    cost: 48,
    desc: 'УНИКАЛЬНО: +3 ящика снабжения на каждую волну и +10 к Удаче!',
    apply: p => {
      p.cratesPerWave = (Number.isFinite(p.cratesPerWave) ? p.cratesPerWave : 1) + 3;
      p.luck = (p.luck || 0) + 10;
    }
  },
  {
    id: 't4_abyss_banish',
    name: 'Печать Изгнания Бездны',
    tier: 4,
    rarityLabel: 'ЛЕГЕНДАРНЫЙ',
    tex: 'meta_discount',
    cost: 46,
    desc: 'УНИКАЛЬНО: -10% к количеству противников на волне и +8% к урону!',
    apply: p => {
      p.enemyCountMult = Math.max(0.45, (p.enemyCountMult || 1.0) * 0.90);
      p.dmgMult = (p.dmgMult || 1) + 0.08;
    }
  },
  {
    id: 't4_chrono_shackles',
    name: 'Кндалы Вечной Стужи',
    tier: 4,
    rarityLabel: 'ЛЕГЕНДАРНЫЙ',
    tex: 'frost',
    cost: 46,
    desc: 'УНИКАЛЬНО: -10% к скорости передвижения всех врагов и +5 макс. HP!',
    apply: p => {
      p.enemySpeedMult = Math.max(0.45, (p.enemySpeedMult || 1.0) * 0.90);
      p.maxHp += 5;
      p.hp = Math.min(p.maxHp, p.hp + 5);
    }
  },
  {
    id: 't4_philosopher_stone',
    name: 'Философский Камень',
    tier: 4,
    rarityLabel: 'ЛЕГЕНДАРНЫЙ',
    tex: 'healOrb',
    cost: 45,
    desc: 'УНИКАЛЬНО: +50% к лечению из ящиков, +1 ящик на волну и +4 макс. HP!',
    apply: p => {
      p.healPotionMult = (Number.isFinite(p.healPotionMult) ? p.healPotionMult : 1.0) + 0.50;
      p.cratesPerWave = (Number.isFinite(p.cratesPerWave) ? p.cratesPerWave : 1) + 1;
      p.maxHp += 4;
      p.hp = Math.min(p.maxHp, p.hp + 4);
    }
  }
];