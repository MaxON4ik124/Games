(() => {
  'use strict';
  const F = window.Fish;
  F.freshState = () => ({ version: 1, coins: 0, rod: 0, bait: 0, rods: [0], baits: [0], bag: 0, boat: 0, location: 0, inventory: [], discovered: {}, stats: { caught: 0, sold: 0, earned: 0, casts: 0 }, sound: false, tutorial: 0, savedAt: 0 });
  const integer = (v, min, max, fallback = min) => Number.isSafeInteger(v) && v >= min && v <= max ? v : fallback;
  F.sanitize = raw => {
    const s = F.freshState();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return s;
    s.coins = integer(raw.coins, 0, 1000000000);
    for (const key of ['rods', 'baits']) { const max = F.config[key].length - 1; s[key] = [...new Set([0, ...(Array.isArray(raw[key]) ? raw[key].filter(v => Number.isInteger(v) && v >= 0 && v <= max) : [])])]; }
    s.rod = s.rods.includes(raw.rod) ? raw.rod : 0;
    s.bait = s.baits.includes(raw.bait) ? raw.bait : 0;
    s.bag = integer(raw.bag, 0, 3); s.boat = integer(raw.boat, 0, 3); s.location = integer(raw.location, 0, s.boat);
    s.inventory = (Array.isArray(raw.inventory) ? raw.inventory : []).filter(x => x && F.fishById(x.fishId) && Number.isFinite(x.weight) && x.weight > 0 && x.weight < 100).slice(0, F.config.bags[s.bag].capacity).map((x, i) => ({ uid: `${Date.now()}-${i}`, fishId: F.fishById(x.fishId).id, weight: Math.round(x.weight * 100) / 100 }));
    for (let loc = 0; loc < 4; loc++) for (let r = 0; r < 4; r++) { const id = `${loc}-${r}`; if (raw.discovered && integer(raw.discovered[id], 0, 100000000) > 0) s.discovered[id] = raw.discovered[id]; }
    for (const item of s.inventory) s.discovered[item.fishId] = Math.max(1, s.discovered[item.fishId] || 0);
    for (const key of Object.keys(s.stats)) s.stats[key] = integer(raw.stats?.[key], 0, 1000000000);
    s.sound = raw.sound === true; s.tutorial = integer(raw.tutorial, 0, 6); s.savedAt = integer(raw.savedAt, 0, 9999999999999);
    return s;
  };
  F.storageStatus = 'ok';
  F.load = () => { let raw; try { raw = localStorage.getItem(F.config.saveKey); } catch { F.storageStatus = 'unavailable'; return F.freshState(); } if (!raw) return F.freshState(); try { const parsed = JSON.parse(raw); if (!parsed || parsed.version !== 1) { F.storageStatus = 'recovered'; return F.freshState(); } return F.sanitize(parsed); } catch { F.storageStatus = 'recovered'; return F.freshState(); } };
  F.save = () => { F.state.savedAt = Date.now(); try { localStorage.setItem(F.config.saveKey, JSON.stringify(F.state)); F.storageStatus = 'ok'; } catch { F.storageStatus = 'unavailable'; } F.platform?.queueSave(); F.updateSaveIndicator?.(); };
})();
