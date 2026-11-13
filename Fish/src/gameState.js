(() => {
  'use strict';
  const F = window.Fish;
  F.state = F.load();
  F.capacity = () => F.config.bags[F.state.bag].capacity;
  F.inventoryValue = () => F.state.inventory.reduce((sum, item) => sum + F.fishById(item.fishId).price, 0);
  F.changed = () => { F.save(); F.ui?.render(); };
  F.advanceTutorial = target => { if (F.state.tutorial === target) { F.state.tutorial++; F.save(); F.ui?.tutorial(); } };
  F.addCatch = (fishId, weight) => {
    if (F.state.inventory.length >= F.capacity()) return false;
    const fish = F.fishById(fishId); if (!fish) return false;
    F.state.inventory.push({ uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, fishId, weight });
    F.state.discovered[fishId] = (F.state.discovered[fishId] || 0) + 1; F.state.stats.caught++;
    F.changed(); return true;
  };
  F.sell = uid => {
    const items = uid === 'all' ? [...F.state.inventory] : F.state.inventory.filter(x => x.uid === uid);
    if (!items.length) { F.ui.toast('Сначала поймай хотя бы одну рыбу.', 'info'); return false; }
    const value = items.reduce((sum, item) => sum + F.fishById(item.fishId).price, 0);
    const ids = new Set(items.map(x => x.uid)); F.state.inventory = F.state.inventory.filter(x => !ids.has(x.uid));
    F.state.coins += value; F.state.stats.sold += items.length; F.state.stats.earned += value;
    F.advanceTutorial(4); F.changed(); F.audio.play('coin'); F.ui.toast(`Улов продан! +${F.format(value)} тугриков`, 'success'); F.platform?.track('sell', { value, count: items.length }); return true;
  };
  F.purchase = (type, id) => {
    if (!['rod','bait','bag'].includes(type) || !Number.isInteger(id)) return false;
    const list = F.config[type === 'rod' ? 'rods' : type === 'bait' ? 'baits' : 'bags']; const item = list[id]; if (!item) return false;
    const owned = type === 'bag' ? id <= F.state.bag : F.state[`${type}s`].includes(id);
    if (owned) { if (type !== 'bag') { F.state[type] = id; F.changed(); F.ui.toast('Снаряжение выбрано', 'success'); } return true; }
    if (type === 'bag' && id !== F.state.bag + 1) return false;
    if (F.state.coins < item.price) { F.ui.toast(`Не хватает ${F.format(item.price - F.state.coins)} тугриков. Пора на рыбалку!`, 'info'); return false; }
    F.state.coins -= item.price;
    if (type === 'bag') F.state.bag = id; else { F.state[`${type}s`].push(id); F.state[type] = id; }
    F.advanceTutorial(5); F.changed(); F.audio.play('buy'); F.ui.toast(type === 'bag' ? 'Теперь в сумке больше места!' : `${item.name} — теперь твоё!`, 'success'); return true;
  };
  F.repairBoat = () => { const level = F.state.boat; const boat = F.config.boats[level]; if (level >= 3) return false; if (F.state.coins < boat.price) { F.ui.toast(`Для ремонта нужно ещё ${F.format(boat.price - F.state.coins)} тугриков.`, 'info'); return false; } F.state.coins -= boat.price; F.state.boat++; F.changed(); F.audio.play('legendary'); F.ui.toast(`Открыта локация «${F.config.locations[level + 1].name}»!`, 'success'); return true; };
  F.travel = id => { if (!Number.isInteger(id) || !F.config.locations[id]) return false; if (id > F.state.boat) { F.ui.toast('Сначала восстанови лодку, чтобы добраться до этого берега.', 'info'); return false; } F.fishing.cancel(); F.state.location = id; F.changed(); F.ui.close(); F.audio.play('cast'); F.ui.toast(`Добро пожаловать: ${F.config.locations[id].name}`, 'success'); return true; };
})();
