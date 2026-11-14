// src/data/spellsData.js
export const MAX_SPELL_LEVEL = 4;
export const MAX_MASTERY_LEVEL = 5;
export const BAG_CAPACITY = 13;

export const MASTERY_DESCRIPTIONS = {
  1: 'Ур. Мастерства 1: +1 снаряд (или +20% радиус удара/новы).',
  2: 'Ур. Мастерства 2: Еще +1 снаряд и +25% к базовому урону.',
  3: 'Ур. Мастерства 3: -18% время перезарядки и +2 к пробиванию.',
  4: 'Ур. Мастерства 4: Еще +1 снаряд и +35% к урону и радиусу.',
  5: 'Ур. Мастерства 5 (МАКС): Оставляет стихийное поле на земле и открывает Эволюцию!'
};

export const SPELLS = {
  // ТИР 1 — 9 БАЗОВЫХ ЗАКЛИНАНИЙ (КД x1.5, урон снижен)
  fireball:     { id:'fireball',     name:'Огненный шар',      tier:1, type:'ranged', tex:'fireball',     cost:15, cd:1.95, dmg:18, radius:30, speed:430, color:'#ff7b24', desc:'Взрывной сгусток пламени по ближайшему врагу.' },
  stone:        { id:'stone',        name:'Каменный снаряд',   tier:1, type:'ranged', tex:'stone',        cost:15, cd:2.25, dmg:25, radius:24, speed:350, pierce:2, color:'#bfa588', desc:'Тяжелый валун, пробивающий врагов насквозь.' },
  water:        { id:'water',        name:'Водяная сфера',     tier:1, type:'ranged', tex:'water',        cost:15, cd:1.73, dmg:14, radius:38, speed:390, slow:0.35, color:'#2eb5ff', desc:'Водный всплеск, замедляющий группу целей.' },
  lightning:    { id:'lightning',    name:'Цепной разряд',     tier:1, type:'chain',  tex:'lightning',    cost:17, cd:1.88, dmg:16, radius:200, chains:3, color:'#ffea38', desc:'Молния, поражающая до 3 целей подряд.' },
  frost:        { id:'frost',        name:'Ледяной осколок',   tier:1, type:'ranged', tex:'frost',        cost:16, cd:1.65, dmg:15, radius:26, speed:470, slow:0.55, color:'#94f4ff', desc:'Крио-осколок с сильным замораживающим эффектом.' },
  blade:        { id:'blade',        name:'Вихревой клинок',   tier:1, type:'melee',  tex:'blade',        cost:16, cd:1.58, dmg:21, radius:98,  color:'#dce6f5', desc:'Ближний бой: круговой рассекающий удар сталью.' },
  scythe:       { id:'scythe',       name:'Костяная коса',     tier:1, type:'melee',  tex:'scythe',       cost:18, cd:2.10, dmg:27, radius:118, vamp:1, color:'#e6395c', desc:'Ближний бой: широкий взмах косой с вампиризмом.' },
  chaos:        { id:'chaos',        name:'Сфера Хаоса',       tier:1, type:'ranged', tex:'chaos',        cost:19, cd:1.80, dmg:23, radius:34, speed:400, chaos:true, color:'#d44dff', desc:'Нестабильная сфера со случайным уроном 50%–230%.' },
  poison:       { id:'poison',       name:'Эссенция Яда',      tier:1, type:'ranged', tex:'poison',       cost:16, cd:1.73, dmg:13, radius:34, speed:410, poison:10, color:'#52f246', desc:'Токсичный сгусток: отравляет врагов, нанося урон ядом каждую секунду.' },

  // ТИР 2 — СТАНДАРТНЫЕ ГИБРИДЫ (КД x1.5, урон снижен)
  lava:         { id:'lava',         name:'Лавовый метеор',    tier:2, type:'ranged', tex:'lava',         cost:38, cd:2.33, dmg:48, radius:66, speed:360, puddle:true, color:'#ff551a', desc:'Огонь + Камень: оставляет пылающую лаву на полу.' },
  steam:        { id:'steam',        name:'Паровой гейзер',    tier:2, type:'nova',   tex:'steam',        cost:36, cd:2.18, dmg:38, radius:140, slow:0.4, color:'#c4e8f7', desc:'Огонь + Вода: обжигающее облако пара вокруг героя.' },
  railgun:      { id:'railgun',      name:'Рельсотрон',        tier:2, type:'ranged', tex:'railgun',      cost:40, cd:2.03, dmg:52, radius:26, speed:720, pierce:6, color:'#52d1ff', desc:'Камень + Разряд: сверхзвуковой пробивной импульс.' },
  blizzard:     { id:'blizzard',     name:'Вечная метель',     tier:2, type:'nova',   tex:'blizzard',     cost:38, cd:2.10, dmg:35, radius:155, slow:0.65, color:'#6be5ff', desc:'Вода + Лёд: морозный шторм вокруг мага.' },
  storm:        { id:'storm',        name:'Грозовой шторм',    tier:2, type:'chain',  tex:'storm',        cost:40, cd:1.73, dmg:34, radius:245, chains:5, color:'#ffee4d', desc:'Вода + Разряд: ветвистая грозовая цепь на 5 врагов.' },
  fireblade:    { id:'fireblade',    name:'Пылающая глефа',    tier:2, type:'melee',  tex:'fireblade',    cost:40, cd:1.50, dmg:45, radius:128, color:'#ff771a', desc:'Огонь + Клинок: огненный вихрь в ближнем бою.' },
  reaper:       { id:'reaper',       name:'Жнец Бездны',       tier:2, type:'melee',  tex:'reaper',       cost:42, cd:1.88, dmg:57, radius:142, vamp:2, chaos:true, color:'#bd2eff', desc:'Коса + Хаос: жатва душ с высоким вампиризмом.' },
  singularity:  { id:'singularity',  name:'Сингулярность',     tier:2, type:'ranged', tex:'singularity',  cost:42, cd:2.40, dmg:50, radius:82, speed:310, pull:true, color:'#9c4dff', desc:'Камень + Хаос: черная дыра, стягивающая врагов.' },
  frostblade:   { id:'frostblade',   name:'Ледяной клеймор',   tier:2, type:'melee',  tex:'frostblade',   cost:38, cd:1.58, dmg:42, radius:128, slow:0.6, color:'#7af0ff', desc:'Лёд + Клинок: замораживающий круговой взмах.' },
  magmawave:    { id:'magmawave',    name:'Кровавый прилив',   tier:2, type:'nova',   tex:'magmawave',    cost:40, cd:2.03, dmg:43, radius:138, vamp:2, color:'#ff384c', desc:'Вода + Коса: алая волна, исцеляющая героя.' },
  plasmaflail:  { id:'plasmaflail',  name:'Плазменный цеп',    tier:2, type:'melee',  tex:'plasmaflail',  cost:40, cd:1.58, dmg:45, radius:125, color:'#ffee38', desc:'Разряд + Клинок: электрический удар ближнего боя.' },
  glacierspike: { id:'glacierspike', name:'Ледяной частокол',  tier:2, type:'ranged', tex:'glacierspike', cost:38, cd:1.95, dmg:46, radius:48, speed:440, pierce:4, slow:0.5, color:'#80e5ff', desc:'Камень + Лёд: пробивные крио-шипы.' },

  // ТИР 2 — 8 ГИБРИДОВ ЯДА (КД x1.5, урон снижен)
  acidcloud:    { id:'acidcloud',    name:'Кислотный туман',   tier:2, type:'nova',   tex:'acidcloud',    cost:38, cd:2.03, dmg:32, radius:150, poison:20, slow:0.35, color:'#7dff38', desc:'Яд + Вода: облако едкой кислоты вокруг мага, разъедающее врагов.' },
  plaguefire:   { id:'plaguefire',   name:'Чумное пламя',      tier:2, type:'ranged', tex:'plaguefire',   cost:40, cd:1.95, dmg:40, radius:58,  speed:420, poison:22, puddle:true, color:'#b8ff29', desc:'Яд + Огонь: взрыв некро-пламени, оставляющий токсичный очаг.' },
  venomblade:   { id:'venomblade',   name:'Отравленный клинок',tier:2, type:'melee',  tex:'venomblade',   cost:38, cd:1.43, dmg:39, radius:125, poison:21, color:'#42f57b', desc:'Яд + Клинок: быстрый круговой порез нейротоксином.' },
  rotscythe:    { id:'rotscythe',    name:'Коса Гниения',      tier:2, type:'melee',  tex:'rotscythe',    cost:42, cd:1.88, dmg:48, radius:140, poison:24, vamp:2, color:'#99e62e', desc:'Яд + Коса: жатва чумы, исцеляющая мага и заражающая толпу.' },
  toxicboulder: { id:'toxicboulder', name:'Чумной метеорит',   tier:2, type:'ranged', tex:'toxicboulder', cost:40, cd:2.18, dmg:44, radius:52,  speed:360, pierce:3, poison:21, puddle:true, color:'#7acc29', desc:'Яд + Камень: пробивной чумной валун с болотной трясиной.' },
  frostvenom:   { id:'frostvenom',   name:'Крио-токсин',       tier:2, type:'ranged', tex:'frostvenom',   cost:38, cd:1.65, dmg:36, radius:40,  speed:480, pierce:2, poison:18, slow:0.65, color:'#52ffd1', desc:'Яд + Лёд: парализующий ледяной токсин.' },
  biohazard:    { id:'biohazard',    name:'Био-разряд',        tier:2, type:'chain',  tex:'biohazard',    cost:40, cd:1.73, dmg:31, radius:250, chains:6, poison:20, color:'#c8ff29', desc:'Яд + Разряд: био-молния, мгновенно заражающая 6 целей.' },
  mutagen:      { id:'mutagen',      name:'Мутаген Хаоса',     tier:2, type:'ranged', tex:'mutagen',      cost:42, cd:1.95, dmg:43, radius:68,  speed:380, chaos:true, pull:true, poison:26, color:'#b54dff', desc:'Яд + Хаос: нестабильный мутаген, стягивающий и отравляющий врагов.' },

  // ТИР 3 — ВЫСШИЕ СИНТЕЗЫ (КД x1.5, урон снижен)
  armageddon:   { id:'armageddon',   name:'Армагеддон',          tier:3, type:'ranged', tex:'armageddon',   cost:85, cd:2.10, dmg:108, radius:100, speed:410, pierce:3, puddle:true, color:'#ff2600', desc:'Лавовый метеор + Огненный шар: метеоритный шторм.' },
  zeus:         { id:'zeus',         name:'Гнев Зевса',          tier:3, type:'chain',  tex:'zeus',         cost:85, cd:1.50, dmg:88,  radius:300, chains:8, color:'#fff24d', desc:'Грозовой шторм + Рельсотрон: карающая молния на 8 целей.' },
  abyssgod:     { id:'abyssgod',     name:'Апокалипсис Бездны',  tier:3, type:'melee',  tex:'abyssgod',     cost:90, cd:1.65, dmg:122, radius:180, vamp:3, chaos:true, color:'#e23bff', desc:'Жнец Бездны + Сингулярность: жатва Бездны.' },
  abszero:      { id:'abszero',      name:'Абсолютный Ноль',     tier:3, type:'nova',   tex:'abszero',      cost:85, cd:1.80, dmg:94,  radius:210, slow:0.8, color:'#99f7ff', desc:'Вечная метель + Ледяной клеймор: ледяной катаклизм.' },
  bladestorm:   { id:'bladestorm',   name:'Танец Тысячи Клинков',tier:3, type:'melee',  tex:'bladestorm',   cost:88, cd:1.28, dmg:98,  radius:165, color:'#ffaa2b', desc:'Пылающая глефа + Плазменный цеп: шквал клинков.' },
  pandemic:     { id:'pandemic',     name:'Великая Чума',        tier:3, type:'nova',   tex:'pandemic',     cost:88, cd:1.65, dmg:90,  radius:205, poison:52, puddle:true, vamp:2, color:'#52ff29', desc:'Кислотный туман + Коса Гниения: тотальное заражение арены и вампиризм.' },

  // ТИР 4 — ПРОБУЖДЕННЫЕ ЭВОЛЮЦИИ (КД x1.5, урон снижен)
  vs_hellfire: {
    id: 'vs_hellfire', name: 'Пепел Мироздания (ЭВОЛЮЦИЯ)', tier: 4, type: 'ranged', tex: 'armageddon',
    cost: 160, cd: 0.98, dmg: 205, radius: 135, speed: 520, pierce: 8, puddle: true, pull: true, poison: 42, color: '#ff3800',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Сверхмощный залп комет, стягивающих врагов в озера магмы.'
  },
  vs_thunderlord: {
    id: 'vs_thunderlord', name: 'Буря Вечности (ЭВОЛЮЦИЯ)', tier: 4, type: 'chain', tex: 'zeus',
    cost: 160, cd: 0.83, dmg: 168, radius: 380, chains: 14, puddle: true, slow: 0.7, poison: 35, color: '#80f5ff',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Каскад молний на 14 целей с электрическими полями.'
  },
  vs_soulreaver: {
    id: 'vs_soulreaver', name: 'Пожиратель Богов (ЭВОЛЮЦИЯ)', tier: 4, type: 'melee', tex: 'abyssgod',
    cost: 170, cd: 0.90, dmg: 220, radius: 230, vamp: 4, chaos: true, puddle: true, poison: 48, color: '#ff299c',
    desc: 'ЭВОЛЮЦИЯ МАСТЕРСТВА: Разрез пространства вокруг мага с вампиризмом и разломами Хаоса.'
  }
};

export const RECIPES = [
  { a:'fireball',    b:'stone',       result:'lava' },
  { a:'fireball',    b:'water',       result:'steam' },
  { a:'stone',       b:'lightning',   result:'railgun' },
  { a:'water',       b:'frost',       result:'blizzard' },
  { a:'water',       b:'lightning',   result:'storm' },
  { a:'fireball',    b:'blade',       result:'fireblade' },
  { a:'scythe',      b:'chaos',       result:'reaper' },
  { a:'stone',       b:'chaos',       result:'singularity' },
  { a:'frost',       b:'blade',       result:'frostblade' },
  { a:'water',       b:'scythe',      result:'magmawave' },
  { a:'lightning',   b:'blade',       result:'plasmaflail' },
  { a:'stone',       b:'frost',       result:'glacierspike' },
  { a:'poison',      b:'water',       result:'acidcloud' },
  { a:'poison',      b:'fireball',    result:'plaguefire' },
  { a:'poison',      b:'blade',       result:'venomblade' },
  { a:'poison',      b:'scythe',      result:'rotscythe' },
  { a:'poison',      b:'stone',       result:'toxicboulder' },
  { a:'poison',      b:'frost',       result:'frostvenom' },
  { a:'poison',      b:'lightning',   result:'biohazard' },
  { a:'poison',      b:'chaos',       result:'mutagen' },
  { a:'lava',        b:'fireball',    result:'armageddon' },
  { a:'storm',       b:'railgun',     result:'zeus' },
  { a:'reaper',      b:'singularity', result:'abyssgod' },
  { a:'blizzard',    b:'frostblade',  result:'abszero' },
  { a:'fireblade',   b:'plasmaflail', result:'bladestorm' },
  { a:'acidcloud',   b:'rotscythe',   result:'pandemic' }
];