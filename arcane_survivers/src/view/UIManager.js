// src/view/UIManager.js
import { HEROES } from '../data/heroesData.js';
import { SPELLS, RECIPES } from '../data/spellsData.js';
import { META_UPGRADES, RELICS } from '../data/metaData.js';

const MAX_SPELL_LEVEL = 4;
const MAX_MASTERY_LEVEL = 5;
const MASTERY_DESCRIPTIONS = {
  1: 'Ур. Мастерства 1: +1 снаряд (или +20% радиус удара/новы).',
  2: 'Ур. Мастерства 2: Еще +1 снаряд и +25% к базовому урону.',
  3: 'Ур. Мастерства 3: -18% время перезарядки и +2 к пробиванию.',
  4: 'Ур. Мастерства 4: Еще +1 снаряд и +35% к урону и радиусу.',
  5: 'Ур. Мастерства 5 (МАКС): Оставляет стихийное поле на земле и открывает Эволюцию!'
};

export class UIManager {
  constructor(game, assets) {
    this.game = game;
    this.assets = assets;
  }

  setImg(id, assetObj) {
    const el = document.getElementById(id);
    if (el && assetObj && assetObj.url) el.src = assetObj.url;
  }

  onClick(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  }

  // Масштабирование цен с волной: в начале почти незаметно, на 10-й волне базовые заклинания стоят ~40 маны
  getDiscountedCost(baseCost) {
    const wave = (this.game.state && this.game.state.wave) || 1;
    const w = Math.max(0, wave - 1);
    const waveMult = 1 + w * 0.12 + w * w * 0.006; // Волна 1: x1.0, Волна 2: x1.13, Волна 10: x2.57 (~40 маны)
    const lv = (this.game.saveSys.meta.levels && this.game.saveSys.meta.levels.discount) || 0;
    const discountMult = 1 - lv * 0.07;
    return Math.max(4, Math.round(baseCost * waveMult * discountMult));
  }

  bindGlobalEvents() {
    this.setImg('hudManaImg', this.assets.mana);
    this.setImg('shopManaImg', this.assets.mana);
    this.setImg('hudShardImg', this.assets.shard);
    this.setImg('hudRelicImg', this.assets.relicDrop);
    this.setImg('menuShardImg', this.assets.shard);
    this.setImg('menuAdIcon', this.assets.adIcon);
    this.setImg('shopAdIcon', this.assets.adIcon);
    this.setImg('reviveIconImg', this.assets.revive);
    this.setImg('doubleAdIconImg', this.assets.adIcon);

    this.onClick('tabRunBtn', () => {
      document.getElementById('tabRunBtn').classList.add('active');
      document.getElementById('tabMetaBtn').classList.remove('active');
      document.getElementById('runTabContent').classList.remove('hidden');
      document.getElementById('metaTabContent').classList.add('hidden');
    });

    this.onClick('tabMetaBtn', () => {
      document.getElementById('tabMetaBtn').classList.add('active');
      document.getElementById('tabRunBtn').classList.remove('active');
      document.getElementById('metaTabContent').classList.remove('hidden');
      document.getElementById('runTabContent').classList.add('hidden');
      this.renderMetaCitadel();
    });

    this.onClick('beginGameBtn', () => {
      document.getElementById('startModal').classList.add('hidden');
      document.getElementById('topHud').classList.remove('hidden');
      document.getElementById('bottomSpellBar').classList.remove('hidden');
      this.game.startRun();
    });

    this.onClick('menuRewardShardBtn', () => {
      this.game.saveSys.showRewarded('+40 Осколков Бездны', () => {
        this.game.saveSys.meta.shards += 40;
        this.game.audio.craft();
        this.game.saveSys.save();
        this.renderStartModal();
        this.renderMetaCitadel();
      });
    });

    this.onClick('resetMetaBtn', () => {
      const m = this.game.saveSys.meta;
      let refund = 0;
      META_UPGRADES.forEach(up => {
        const l = m.levels[up.id] || 0;
        for (let i = 0; i < l; i++) refund += up.baseCost + i * up.costStep;
        m.levels[up.id] = 0;
      });
      if (refund > 0) {
        m.shards += refund;
        this.game.audio.gem();
        this.game.saveSys.save();
        this.renderMetaCitadel();
      }
    });

    this.onClick('aimModeBtn', e => {
      this.game.state.autoAim = !this.game.state.autoAim;
      e.target.textContent = `Прицел: ${this.game.state.autoAim ? 'Авто' : 'Курсор'}`;
    });

    this.onClick('soundToggleBtn', e => {
      const on = this.game.audio.toggle();
      e.target.textContent = `Звук: ${on ? 'Вкл' : 'Выкл'}`;
    });

    this.onClick('pauseBtn', () => this.game.togglePause());
    this.onClick('resumeGameBtn', () => this.game.togglePause());
    this.onClick('quitToMenuBtn', () => {
      const pm = document.getElementById('pauseModal');
      if (pm) pm.classList.add('hidden');
      this.game.returnToMenu();
    });

    this.onClick('adManaShopBtn', () => {
      if (this.game.state.shopAdUsed) return;
      this.game.saveSys.showRewarded('+45 Маны', () => {
        this.game.state.mana += 45;
        this.game.state.shopAdUsed = true;
        this.game.audio.craft();
        this.renderShopModal();
      });
    });

    this.onClick('rerollShopBtn', () => {
      if (this.game.state.mana >= this.game.state.rerollCost) {
        this.game.state.mana -= this.game.state.rerollCost;
        const waveStep = Math.max(3, Math.round(3 + this.game.state.wave * 0.5));
        this.game.state.rerollCost += waveStep;
        this.game.rollShopOffers(true);
        this.renderShopModal();
      }
    });

    this.onClick('startNextWaveBtn', () => {
      document.getElementById('shopModal').classList.add('hidden');
      this.game.startWave();
    });

    this.onClick('reviveAdBtn', () => this.game.revivePlayer());
    this.onClick('doubleShardsAdBtn', () => this.game.doubleRunShards());
    this.onClick('returnToMenuBtn', () => {
      document.getElementById('gameOverModal').classList.add('hidden');
      this.game.returnToMenu();
    });
  }

  showStartModal() {
    document.getElementById('topHud').classList.add('hidden');
    document.getElementById('bottomSpellBar').classList.add('hidden');
    document.getElementById('bossHud').style.display = 'none';
    document.getElementById('startModal').classList.remove('hidden');
    this.renderStartModal();
  }

  renderStartModal() {
    const m = this.game.saveSys.meta;
    const lv = m.levels;
    const shardEl = document.getElementById('menuShardVal');
    if (shardEl) shardEl.textContent = m.shards;

    const sumEl = document.getElementById('metaSummaryLine');
    if (sumEl) {
      sumEl.textContent = `Бонусы Цитадели: +${lv.hp * 3} HP | +${lv.dmg * 10}% Урон | +${lv.haste * 6}% КД | Рекорд волны: ${m.bestWave}`;
    }

    const hGrid = document.getElementById('heroesGrid');
    if (hGrid) {
      hGrid.innerHTML = '';
      HEROES.forEach(h => {
        const card = document.createElement('div');
        card.className = 'hero-select-card' + (h.id === this.game.selectedHeroId ? ' active' : '');
        card.innerHTML = `
          <div class="hero-card-header">
            <img src="${this.assets[h.tex].url}" alt="${h.name}">
            <div>
              <div style="font-size:15px;font-weight:800;color:#fff;">${h.name}</div>
              <div class="muted-text">${h.role}</div>
            </div>
          </div>
          <div>
            ${h.pros.map(t => `<div class="trait-pos">+ ${t}</div>`).join('')}
            ${h.cons.map(t => `<div class="trait-neg">- ${t}</div>`).join('')}
          </div>
        `;
        card.onclick = () => {
          this.game.selectedHeroId = h.id;
          this.renderStartModal();
        };
        hGrid.appendChild(card);
      });
    }

    const sGrid = document.getElementById('starterSpellsGrid');
    if (sGrid) {
      sGrid.innerHTML = '';
      Object.values(SPELLS).filter(s => s.tier === 1).forEach(sp => {
        const card = document.createElement('div');
        card.className = 'item-card' + (sp.id === this.game.selectedStarterId ? ' tier-2' : '');
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div class="item-head">
            <img src="${this.assets[sp.tex].url}" alt="${sp.name}">
            <div>
              <div class="item-title">${sp.name}</div>
              <div class="item-sub">Урон ${sp.dmg} • КД ${sp.cd}с</div>
            </div>
          </div>
          <div class="item-desc">${sp.desc}</div>
        `;
        card.onclick = () => {
          this.game.selectedStarterId = sp.id;
          this.renderStartModal();
        };
        sGrid.appendChild(card);
      });
    }
  }

  renderMetaCitadel() {
    const m = this.game.saveSys.meta;
    const shardEl = document.getElementById('menuShardVal');
    if (shardEl) shardEl.textContent = m.shards;

    const grid = document.getElementById('metaUpgradesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    META_UPGRADES.forEach(up => {
      const cur = m.levels[up.id] || 0;
      const cost = up.baseCost + cur * up.costStep;
      const isMax = cur >= up.maxLvl;

      let pips = '<div class="meta-pips">';
      for (let i = 0; i < up.maxLvl; i++) pips += `<div class="meta-pip ${i < cur ? 'filled' : ''}"></div>`;
      pips += '</div>';

      const card = document.createElement('div');
      card.className = 'meta-card';
      card.innerHTML = `
        <div class="item-head">
          <img src="${this.assets[up.tex].url}" alt="${up.name}">
          <div style="flex:1;">
            <div class="item-title">${up.name}</div>
            <div class="item-sub">Уровень ${cur} / ${up.maxLvl}</div>
            ${pips}
          </div>
        </div>
        <div class="item-desc">${up.desc}</div>
        <button class="btn ${isMax ? '' : 'btn-purple'}" ${isMax || m.shards < cost ? 'disabled' : ''}>
          ${isMax ? 'МАКСИМУМ' : `Улучшить (${cost} Осколков)`}
        </button>
      `;
      card.querySelector('button').onclick = () => {
        if (!isMax && m.shards >= cost) {
          m.shards -= cost;
          m.levels[up.id] = cur + 1;
          this.game.audio.craft();
          this.game.saveSys.save();
          this.renderMetaCitadel();
        }
      };
      grid.appendChild(card);
    });
  }

  buildSpellHud() {
    const bar = document.getElementById('bottomSpellBar');
    if (!bar) return;
    bar.innerHTML = '';
    const inv = this.game.inventory;
    const p = this.game.state.player;

    for (let i = 0; i < inv.maxSlots; i++) {
      const inst = inv.activeSpells[i];
      const div = document.createElement('div');
      if (!inst) {
        div.className = 'spell-slot-hud empty';
        div.innerHTML = `<span class="slot-title">Пусто</span>`;
      } else {
        const sp = SPELLS[inst.id] || SPELLS.fireball;
        const mast = p && typeof p.getMasteryLevel === 'function' ? p.getMasteryLevel(inst.id) : 0;
        div.className = `spell-slot-hud tier-${sp.tier}`;
        div.innerHTML = `
          <div class="slot-cd-overlay" id="slotOverlay_${i}"></div>
          ${mast > 0 ? `<span class="slot-mastery-badge">М:${mast}/${MAX_MASTERY_LEVEL}</span>` : ''}
          <span class="slot-lvl-badge">Ур.${inst.level}/${MAX_SPELL_LEVEL}</span>
          <img src="${this.assets[sp.tex].url}" alt="${sp.name}">
          <span class="slot-title">${sp.name}</span>
          <span class="slot-cd-num" id="slotTimer_${i}">ГОТОВО</span>
        `;
      }
      bar.appendChild(div);
    }
  }

  updateCombatHud() {
    const st = this.game.state;
    const p = st.player;
    if (!p) return;

    document.getElementById('hudHpBar').style.width = Math.max(0, (p.hp / p.maxHp) * 100) + '%';
    document.getElementById('hudHpLabel').textContent = `${Math.ceil(p.hp)} / ${p.maxHp} HP`;

    const xpBar = document.getElementById('hudXpBar');
    const lvlLbl = document.getElementById('hudLvlLabel');
    if (xpBar && lvlLbl) {
      xpBar.style.width = Math.min(100, ((p.xp || 0) / (p.xpToNext || 20)) * 100) + '%';
      lvlLbl.textContent = `УР. ${p.charLevel || 1} (${p.xp || 0}/${p.xpToNext || 20} XP)`;
    }

    document.getElementById('hudManaVal').textContent = st.mana;
    document.getElementById('hudShardVal').textContent = this.game.saveSys.meta.shards;
    const relVal = document.getElementById('hudRelicVal');
    if (relVal) relVal.textContent = `Удача: ${Math.floor(p.luck || 0)}`;
    document.getElementById('waveBanner').textContent = `ВОЛНА ${st.wave} — ${st.waveTimer.toFixed(1)}с`;

    this.game.inventory.activeSpells.forEach((inst, idx) => {
      const stats = this.game.inventory.computeStats(inst, p);
      const tEl = document.getElementById(`slotTimer_${idx}`);
      const oEl = document.getElementById(`slotOverlay_${idx}`);
      if (tEl && oEl) {
        if (inst.cdTimer <= 0.04) {
          tEl.textContent = 'ГОТОВО';
          oEl.style.height = '0%';
        } else {
          tEl.textContent = inst.cdTimer.toFixed(1) + 'с';
          oEl.style.height = Math.min(100, (inst.cdTimer / stats.cd) * 100) + '%';
        }
      }
    });

    const boss = st.enemies.find(e => e.isBoss);
    const bossHud = document.getElementById('bossHud');
    if (boss) {
      bossHud.style.display = 'block';
      document.getElementById('bossFill').style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
    } else {
      bossHud.style.display = 'none';
    }
  }

  openShop() {
    document.getElementById('shopModal').classList.remove('hidden');
    this.renderShopModal();
  }

  renderShopModal() {
    const st = this.game.state;
    const inv = this.game.inventory;
    const p = st.player;

    document.getElementById('shopHeaderTitle').textContent = `КУЗНИЦА И ГРИМУАР — ПЕРЕД ВОЛНОЙ ${st.wave}`;
    document.getElementById('shopManaVal').textContent = st.mana;

    const luckBadge = document.getElementById('shopLuckBadge');
    if (luckBadge) luckBadge.textContent = `Удача: ${Math.floor(p.luck || 0)}`;

    document.getElementById('adManaShopBtn').disabled = st.shopAdUsed;
    const rerollBtn = document.getElementById('rerollShopBtn');
    rerollBtn.textContent = `Обновить (${st.rerollCost})`;
    rerollBtn.disabled = st.mana < st.rerollCost;

    document.getElementById('activeCapText').textContent = `${inv.activeSpells.length} / ${inv.maxSlots}`;
    document.getElementById('bagCapText').textContent = `${inv.bagSpells.length} / ${inv.maxBagSlots}`;

    const offersGrid = document.getElementById('shopOffersGrid');
    offersGrid.innerHTML = '';

    st.shopOffers.forEach(offer => {
      if (offer.kind === 'spell') {
        const sp = SPELLS[offer.id] || SPELLS.fireball;
        const lvl = offer.level || 1;
        const rawCost = sp.cost * (lvl > 1 ? 1.7 : 1);
        const cost = this.getDiscountedCost(rawCost);
        const card = document.createElement('div');
        card.className = `item-card tier-${sp.tier}` + (offer.locked ? ' locked' : '');
        card.innerHTML = `
          <div class="item-head">
            <img src="${this.assets[sp.tex].url}" alt="${sp.name}">
            <div>
              <div class="item-title">${sp.name}</div>
              <div class="item-sub tier-${sp.tier}">Заклинание Т${sp.tier} • Ур.${lvl} • Урон ${sp.dmg}</div>
            </div>
          </div>
          <div class="item-desc">${sp.desc}</div>
          <div class="item-btns">
            <button class="btn btn-gold btn-xs" data-act="buy" ${offer.bought || st.mana < cost || inv.isFull() ? 'disabled' : ''}>
              ${offer.bought ? 'Куплено' : `Купить (${cost})`}
            </button>
            <button class="btn btn-xs" data-act="lock" ${offer.bought ? 'disabled' : ''}>
              ${offer.locked ? 'В замке' : 'Замок'}
            </button>
          </div>
        `;
        card.querySelector('[data-act="buy"]').onclick = () => {
          if (st.mana >= cost && !offer.bought && !inv.isFull()) {
            st.mana -= cost;
            offer.bought = true;
            offer.locked = false;
            inv.addSpell(inv.createSpell(sp.id, lvl));
            this.game.audio.gem();
            this.renderShopModal();
          }
        };
        card.querySelector('[data-act="lock"]').onclick = () => {
          offer.locked = !offer.locked;
          this.renderShopModal();
        };
        offersGrid.appendChild(card);
      } else {
        const rel = RELICS.find(r => r.id === offer.id) || RELICS[0];
        const cost = this.getDiscountedCost(rel.cost);
        const texObj = this.assets[rel.tex] || this.assets.relicDrop;
        const card = document.createElement('div');
        card.className = `item-card tier-${rel.tier}` + (offer.locked ? ' locked' : '');
        card.innerHTML = `
          <div class="item-head">
            <img src="${texObj.url}" alt="${rel.name}">
            <div>
              <div class="item-title">${rel.name}</div>
              <div class="item-sub tier-${rel.tier}">${rel.rarityLabel} (Тир ${rel.tier})</div>
            </div>
          </div>
          <div class="item-desc">${rel.desc}</div>
          <div class="item-btns">
            <button class="btn btn-gold btn-xs" data-act="buy" ${offer.bought || st.mana < cost ? 'disabled' : ''}>
              ${offer.bought ? 'Куплено' : `Купить (${cost})`}
            </button>
            <button class="btn btn-xs" data-act="lock" ${offer.bought ? 'disabled' : ''}>
              ${offer.locked ? 'В замке' : 'Замок'}
            </button>
          </div>
        `;
        card.querySelector('[data-act="buy"]').onclick = () => {
          if (st.mana >= cost && !offer.bought) {
            st.mana -= cost;
            offer.bought = true;
            offer.locked = false;
            rel.apply(p);
            st.relicsCount++;
            this.game.audio.gem();
            this.renderShopModal();
          }
        };
        card.querySelector('[data-act="lock"]').onclick = () => {
          offer.locked = !offer.locked;
          this.renderShopModal();
        };
        offersGrid.appendChild(card);
      }
    });

    const statsBox = document.getElementById('shopStatsBox');
    if (statsBox && p) {
      const dmgPct = Math.round((p.dmgMult - 1) * 100);
      const hastePct = Math.round((1 / p.cdrMult - 1) * 100);
      const enemyCntPct = Math.round((p.enemyCountMult - 1) * 100);
      const enemySpdPct = Math.round((p.enemySpeedMult - 1) * 100);

      statsBox.innerHTML = `
        <div class="stat-row"><span>Макс. HP:</span><b>${Math.ceil(p.hp)} / ${p.maxHp}</b></div>
        <div class="stat-row"><span>Удача:</span><b class="gold">${Math.floor(p.luck || 0)}</b></div>
        <div class="stat-row"><span>Бонус урона:</span><b class="pos">${dmgPct >= 0 ? '+' + dmgPct : dmgPct}%</b></div>
        <div class="stat-row"><span>Перезарядка:</span><b class="pos">${hastePct >= 0 ? '+' + hastePct : hastePct}%</b></div>
        <div class="stat-row"><span>Скорость бега:</span><b>${Math.round(p.speed)}</b></div>
        <div class="stat-row"><span>Ящиков / раунд:</span><b class="gold">${p.cratesPerWave || 1} шт.</b></div>
        <div class="stat-row"><span>Кол-во врагов:</span><b>${enemyCntPct <= 0 ? enemyCntPct : '+' + enemyCntPct}%</b></div>
        <div class="stat-row"><span>Скорость врагов:</span><b>${enemySpdPct <= 0 ? enemySpdPct : '+' + enemySpdPct}%</b></div>
      `;
    }

    this.renderInventorySection('activeInventoryGrid', inv.activeSpells, true);
    this.renderInventorySection('bagInventoryGrid', inv.bagSpells, false);
    this.renderGrimoireSection();
  }

  renderInventorySection(gridId, list, isActive) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    const inv = this.game.inventory;
    const p = this.game.state.player;
    const all = inv.getAllOwned();

    list.forEach(inst => {
      const stats = inv.computeStats(inst, p);
      const sellPrice = Math.max(5, Math.round(stats.cost * 0.65 * inst.level));
      const dup = all.find(o => o.uid !== inst.uid && o.id === inst.id && o.level === inst.level && inst.level < MAX_SPELL_LEVEL);
      const mast = p && typeof p.getMasteryLevel === 'function' ? p.getMasteryLevel(inst.id) : 0;

      const card = document.createElement('div');
      card.className = `item-card tier-${stats.tier}`;
      card.innerHTML = `
        <div class="item-head">
          <img src="${this.assets[stats.tex].url}" alt="${stats.name}">
          <div>
            <div class="item-title">${stats.name}</div>
            <div class="item-sub">Ур.${inst.level}/${MAX_SPELL_LEVEL} • Маст.${mast}/${MAX_MASTERY_LEVEL} • Урон ${stats.dmg}</div>
          </div>
        </div>
        <div class="item-btns">
          ${dup ? `<button class="btn btn-emerald btn-xs" data-act="merge">Слить до Ур.${inst.level + 1}</button>` : ''}
          <button class="btn btn-xs" data-act="swap">${isActive ? 'В сумку' : 'В бой'}</button>
          <button class="btn btn-crimson btn-xs" data-act="sell" ${isActive && inv.activeSpells.length <= 1 ? 'disabled' : ''}>Продать (+${sellPrice})</button>
        </div>
      `;

      const mBtn = card.querySelector('[data-act="merge"]');
      if (mBtn) {
        mBtn.onclick = () => {
          inv.removeByUid(dup.uid);
          inst.level = Math.min(MAX_SPELL_LEVEL, inst.level + 1);
          this.game.audio.craft();
          this.renderShopModal();
        };
      }

      card.querySelector('[data-act="swap"]').onclick = () => {
        if (isActive) {
          if (inv.bagSpells.length < inv.maxBagSlots && inv.activeSpells.length > 1) {
            inv.removeByUid(inst.uid);
            inv.bagSpells.push(inst);
          }
        } else if (inv.activeSpells.length < inv.maxSlots) {
          inv.removeByUid(inst.uid);
          inv.activeSpells.push(inst);
        }
        this.renderShopModal();
      };

      card.querySelector('[data-act="sell"]').onclick = () => {
        if (isActive && inv.activeSpells.length <= 1) return;
        inv.removeByUid(inst.uid);
        this.game.state.mana += sellPrice;
        this.renderShopModal();
      };

      grid.appendChild(card);
    });
  }

  renderGrimoireSection() {
    const listEl = document.getElementById('grimoireList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const inv = this.game.inventory;
    const p = this.game.state.player;
    const all = inv.getAllOwned();
    let readyCount = 0;

    const maxMasteredSpells = all.filter(
      o => o.level >= MAX_SPELL_LEVEL && p && p.getMasteryLevel(o.id) >= MAX_MASTERY_LEVEL && SPELLS[o.id].tier < 4
    );

    if (maxMasteredSpells.length >= 2) {
      readyCount++;
      const sA = maxMasteredSpells[0];
      const sB = maxMasteredSpells[1];
      const spA = SPELLS[sA.id];
      const spB = SPELLS[sB.id];
      let evoId = 'vs_hellfire';
      if (spA.type === 'chain') evoId = 'vs_thunderlord';
      else if (spA.type === 'melee' || spA.type === 'nova') evoId = 'vs_soulreaver';
      const spEvo = SPELLS[evoId];

      const evoRow = document.createElement('div');
      evoRow.className = 'grimoire-row evo-ready';
      evoRow.innerHTML = `
        <div class="grimoire-formula">
          <img src="${this.assets[spA.tex].url}">
          <span>+</span>
          <img src="${this.assets[spB.tex].url}">
          <span>=</span>
          <img src="${this.assets[spEvo.tex].url}">
          <div class="grimoire-Formula-info">
            <div class="grimoire-Formula-title" style="color:#ffae42;">${spEvo.name}</div>
            <div class="grimoire-Formula-sub">ЭВОЛЮЦИЯ: ${spA.name} + ${spB.name}</div>
          </div>
        </div>
        <button class="btn btn-gold btn-xs" style="flex:0 0 auto;">ПРОБУДИТЬ</button>
      `;
      evoRow.querySelector('button').onclick = () => {
        inv.removeByUid(sA.uid);
        inv.removeByUid(sB.uid);
        inv.addSpell(inv.createSpell(evoId, MAX_SPELL_LEVEL));
        this.game.audio.craft();
        this.renderShopModal();
      };
      listEl.appendChild(evoRow);
    }

    const evaluatedRecipes = RECIPES.map(r => {
      const spA = SPELLS[r.a], spB = SPELLS[r.b], spRes = SPELLS[r.result];
      const ownA = all.find(o => o.id === r.a);
      const ownB = all.find(o => o.id === r.b && (!ownA || o.uid !== ownA.uid));
      const canCraft = Boolean(ownA && ownB && !inv.tier1Only);
      const hasOne = Boolean(ownA || ownB);
      return { r, spA, spB, spRes, ownA, ownB, canCraft, hasOne };
    });

    evaluatedRecipes.sort((x, y) => {
      if (x.canCraft !== y.canCraft) return x.canCraft ? -1 : 1;
      if (x.hasOne !== y.hasOne) return x.hasOne ? -1 : 1;
      return x.spRes.tier - y.spRes.tier;
    });

    evaluatedRecipes.forEach(item => {
      const { r, spA, spB, spRes, ownA, ownB, canCraft } = item;
      if (canCraft) readyCount++;

      const row = document.createElement('div');
      row.className = 'grimoire-row' + (canCraft ? ' ready' : '');
      row.innerHTML = `
        <div class="grimoire-formula">
          <img src="${this.assets[spA.tex].url}" class="${ownA ? '' : 'missing'}" title="${spA.name}">
          <span>+</span>
          <img src="${this.assets[spB.tex].url}" class="${ownB ? '' : 'missing'}" title="${spB.name}">
          <span>=</span>
          <img src="${this.assets[spRes.tex].url}" title="${spRes.name}">
          <div class="grimoire-Formula-info">
            <div class="grimoire-Formula-title">${spRes.name} <span style="color:var(--gold);font-size:10px;">T${spRes.tier}</span></div>
            <div class="grimoire-Formula-sub">${spA.name} + ${spB.name}</div>
          </div>
        </div>
        <button class="btn ${canCraft ? 'btn-emerald' : ''} btn-xs" style="flex:0 0 auto;" ${canCraft ? '' : 'disabled'}>
          ${canCraft ? 'Скрафтить' : 'Нужны части'}
        </button>
      `;
      row.querySelector('button').onclick = () => {
        if (!canCraft) return;
        const lvl = Math.min(ownA.level, ownB.level);
        inv.removeByUid(ownA.uid);
        inv.removeByUid(ownB.uid);
        inv.addSpell(inv.createSpell(r.result, lvl));
        this.game.audio.craft();
        this.renderShopModal();
      };
      listEl.appendChild(row);
    });

    const badge = document.getElementById('craftableCountBadge');
    if (badge) badge.textContent = `Готово: ${readyCount}`;
  }

  renderMasteryModal(spellIds, player, onSelect) {
    const modal = document.getElementById('masteryModal');
    const grid = document.getElementById('masteryChoicesGrid');
    if (!modal || !grid) {
      onSelect(spellIds[0]);
      return;
    }
    grid.innerHTML = '';
    modal.classList.remove('hidden');

    spellIds.forEach(id => {
      const sp = SPELLS[id] || SPELLS.fireball;
      const nextLvl = player.getMasteryLevel(id) + 1;
      const desc = MASTERY_DESCRIPTIONS[nextLvl] || '';

      const card = document.createElement('div');
      card.className = 'meta-card';
      card.innerHTML = `
        <div class="item-head">
          <img src="${this.assets[sp.tex].url}" alt="${sp.name}">
          <div>
            <div class="item-title">Уровень мастерства «${sp.name}»</div>
            <div class="item-sub">Ступень ${nextLvl} / ${MAX_MASTERY_LEVEL}</div>
          </div>
        </div>
        <div class="item-desc" style="color:#e0d4ff;">${desc}</div>
        <button class="btn btn-purple">Выбрать усиление</button>
      `;
      card.querySelector('button').onclick = () => {
        modal.classList.add('hidden');
        onSelect(id);
      };
      grid.appendChild(card);
    });
  }

  showPauseModal(visible) {
    const pm = document.getElementById('pauseModal');
    if (pm) pm.classList.toggle('hidden', !visible);
  }

  showGameOver() {
    const st = this.game.state;
    document.getElementById('gameOverSummary').textContent =
      `Вы сражались до Волны ${st.wave} (Уровень мага: ${st.player.charLevel || 1}) за героя «${st.hero.name}».`;
    document.getElementById('earnedShardsBanner').textContent =
      `Добыто Осколков Бездны за забег: +${st.runShards}`;

    document.getElementById('reviveAdBtn').disabled = st.revivedThisRun;
    document.getElementById('doubleShardsAdBtn').disabled = st.shardsDoubled || st.runShards <= 0;
    document.getElementById('gameOverModal').classList.remove('hidden');
  }
}