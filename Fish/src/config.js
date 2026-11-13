/* Original artwork and game by Лови момент. No runtime dependencies. */
window.Fish = window.Fish || {};
(() => {
  'use strict';
  const F = window.Fish;
  F.config = {
    saveKey: 'lovi-moment-v1', version: 1,
    fishing: { waitMin: 5000, waitMax: 10000, biteWindow: 2200, castTime: 650, reelTime: 650 },
    rarities: [
      { id: 'common', name: 'Обычная', color: '#648174', label: 'ОБЫЧНАЯ' },
      { id: 'rare', name: 'Редкая', color: '#4387b4', label: 'РЕДКАЯ' },
      { id: 'epic', name: 'Эпическая', color: '#9470b5', label: 'ЭПИЧЕСКАЯ' },
      { id: 'legendary', name: 'Легендарная', color: '#ca9030', label: 'ЛЕГЕНДАРНАЯ' }
    ],
    rods: [
      { id: 0, name: 'Верная веточка', description: 'С неё начинаются большие истории.', price: 0, reduction: 0, color: '#a4754d' },
      { id: 1, name: 'Крепкая удочка', description: 'Лёгкая, надёжная и уже почти профессиональная.', price: 100, reduction: .15, color: '#65988b' },
      { id: 2, name: 'Серебряный спиннинг', description: 'Когда ждать — не твой стиль.', price: 350, reduction: .3, color: '#80a4c4' },
      { id: 3, name: 'Лунная удочка', description: 'Чувствует малейшее движение под водой.', price: 900, reduction: .45, color: '#9c80bd' },
      { id: 4, name: 'Повелитель вод', description: 'Лучший друг легендарного рыболова.', price: 2500, reduction: .6, color: '#d3a04d' }
    ],
    baits: [
      { id: 0, name: 'Любимый червячок', description: 'Классика. Даже легенде иногда нужен червяк.', price: 0, weights: [1, 1, 1, 1], color: '#c78a7a' },
      { id: 1, name: 'Медная блесна', description: 'Больше редких рыб. Приманка остаётся навсегда.', price: 80, weights: [.85, 1.5, 1.15, 1.1], color: '#bd875b' },
      { id: 2, name: 'Лунная наживка', description: 'Секрет эпического улова.', price: 300, weights: [.65, 1.6, 2.6, 1.8], color: '#9e8acb' },
      { id: 3, name: 'Золотая приманка', description: 'Легендарные рыбы тоже любят блеск.', price: 900, weights: [.45, 1.6, 3.2, 6], color: '#cba34c' }
    ],
    bags: [ { capacity: 5, price: 0 }, { capacity: 8, price: 120 }, { capacity: 12, price: 400 }, { capacity: 20, price: 1100 } ],
    boats: [
      { name: 'Старая лодка', description: 'Немного заботы — и снова на воду.', price: 500, next: 'Лесная лодка' },
      { name: 'Лесная лодка', description: 'Крепкий корпус для дальних путешествий.', price: 1500, next: 'Кристальный парус' },
      { name: 'Кристальный парус', description: 'С ней не страшны воды Драконьего залива.', price: 4000, next: 'Покоритель горизонта' },
      { name: 'Покоритель горизонта', description: 'Каждый берег теперь твой.', price: null, next: null }
    ],
    locations: [
      { id: 0, name: 'Тихая бухта', subtitle: 'Здесь начинается история', description: 'Тёплый берег, сосны и уютный домик. Самое время никуда не спешить.', weather: 'Тихо и солнечно', weights: [70, 22, 7, 1], multiplier: 1, colors: ['#e5eddb','#b8d3b9','#8eb6a5','#5c928a','#75b9b6','#397e85','#d7d59c','#7d9a65'] },
      { id: 1, name: 'Туманный лес', subtitle: 'Там, где вода хранит секреты', description: 'Вековые ели, мягкий туман и таинственные обитатели лесного озера.', weather: 'Лёгкий туман', weights: [58, 29, 11, 2], multiplier: 1.6, colors: ['#e1e7d5','#aec3b4','#719487','#466e66','#7eaaa2','#366c69','#b8bd8a','#668158'] },
      { id: 2, name: 'Кристальное озеро', subtitle: 'На высоте тишина звучит иначе', description: 'Ледяные вершины и прозрачная вода, в которой мерцают лунные плавники.', weather: 'Свежо и ясно', weights: [48, 32, 16, 4], multiplier: 2.5, colors: ['#e4e7f2','#b9c3dc','#8f9ebf','#667e9f','#8ebecf','#4c86a9','#d1d5c6','#8298a1'] },
      { id: 3, name: 'Драконий залив', subtitle: 'Место, где рождаются легенды', description: 'Последние лучи солнца, вулканический берег и рыбы из старинных сказок.', weather: 'Вечерний бриз', weights: [38, 34, 21, 7], multiplier: 4, colors: ['#ead4c4','#c3a9b9','#938b9e','#655e7e','#a1a6bc','#626682','#c7b19b','#81745d'] }
    ],
    fishNames: [
      ['Серебряный карась', 'Золотой окунь', 'Лунная форель', 'Драконья щука'],
      ['Лесная плотва', 'Изумрудный линь', 'Туманный хариус', 'Дух озера'],
      ['Снежный елец', 'Сапфировый сиг', 'Кристальный лосось', 'Лунный страж'],
      ['Пепельная кефаль', 'Огненный тунец', 'Звёздная мурена', 'Золотой дракон']
    ],
    prices: [10, 40, 150, 700],
    tips: ['Хорошая приманка — первый шаг к большой рыбе. Загляни в магазин!', 'Открывай новые берега: там рыба дороже, а легенды ближе.', 'Приманки не расходуются. Покупаешь однажды — рыбачишь всегда.', 'Удочка ускоряет поклёвку, а приманка повышает редкость улова.', 'Открой атлас: в каждом из четырёх водоёмов свои рыбы.']
  };
  F.fishById = id => { const [loc, rarity] = String(id).split('-').map(Number); if (!F.config.locations[loc] || !F.config.rarities[rarity]) return null; return { id: `${loc}-${rarity}`, location: loc, rarity, name: F.config.fishNames[loc][rarity], price: Math.round(F.config.prices[rarity] * F.config.locations[loc].multiplier), description: ['Скромный житель тихих вод. Маленькое начало большого приключения.', 'Красивый плавник, непростой характер. Хороший улов!', 'Такие рыбы снятся настоящим рыболовам.', 'Живая легенда. Некоторые уверены, что таких рыб не бывает.'][rarity] }; };
  F.probabilities = (location = F.state.location, bait = F.state.bait) => { const weights = F.config.locations[location].weights.map((w, i) => w * F.config.baits[bait].weights[i]); const sum = weights.reduce((a, b) => a + b, 0); return weights.map(w => w / sum); };
  F.format = n => new Intl.NumberFormat('ru-RU').format(n);
})();
