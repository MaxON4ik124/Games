// src/Game.js
import { HEROES } from './data/heroesData.js';
import { SPELLS } from './data/spellsData.js';
import { RELICS } from './data/metaData.js';
import { Player } from './entities/Player.js';
import { Projectile } from './entities/Projectile.js';
import { LootDrop } from './entities/LootDrop.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { SaveAndSdkSystem } from './systems/SaveAndSdkSystem.js';
import { InventorySystem } from './systems/InventorySystem.js';
import { WaveSpawner } from './systems/WaveSpawner.js';
import { AssetForge } from './view/AssetForge.js';
import { WorldRenderer } from './view/WorldRenderer.js';
import { UIManager } from './view/UIManager.js';

const MAX_PLAYER_SPEED = 380;
const MAX_MASTERY_LEVEL = 5;

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.assets = new AssetForge().buildAll();
    this.audio = new AudioSystem();
    this.saveSys = new SaveAndSdkSystem(this.audio, () => {
      if (this.ui) this.ui.renderStartModal();
    });
    this.inventory = new InventorySystem(5, false);
    this.spawner = new WaveSpawner();
    this.renderer = new WorldRenderer(this.canvas, this.assets);

    this.selectedHeroId = 'ignis';
    this.selectedStarterId = 'fireball';

    this.state = {
      phase: 'menu',
      wave: 1,
      waveTimer: 30,
      mana: 25,
      relicsCount: 0,
      runShards: 0,
      revivedThisRun: false,
      shardsDoubled: false,
      shopAdUsed: false,
      rerollCost: 10,
      autoAim: true,
      mouseX: window.innerWidth / 2,
      mouseY: window.innerHeight / 2,
      hero: HEROES[0],
      player: null,
      shopOffers: [],
      enemies: [],
      spawnWarnings: [],
      crates: [],
      lootDrops: [],
      enemyBolts: [],
      projectiles: [],
      puddles: [],
      slashes: [],
      lightnings: [],
      particles: [],
      floatTexts: []
    };

    this.keys = {};
    this.joy = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    this.prevTime = performance.now();
    this.ui = new UIManager(this, this.assets);
  }

  init() {
    this.bindControls();
    this.ui.bindGlobalEvents();
    this.ui.showStartModal();
    this.saveSys.initSdk();

    this.state.hero = HEROES[0];
    this.state.player = new Player(HEROES[0], this.saveSys.meta.levels);

    requestAnimationFrame(now => this.loop(now));
  }

  bindControls() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Escape') this.togglePause();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    window.addEventListener('mousemove', e => {
      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;
    });

    const joyZone = document.getElementById('joyZone');
    const joyStick = document.getElementById('joyStick');

    this.canvas.addEventListener('pointerdown', e => {
      if (this.state.phase !== 'wave') return;
      this.joy.active = true;
      this.joy.startX = e.clientX;
      this.joy.startY = e.clientY;
      this.joy.dx = 0;
      this.joy.dy = 0;
      if (joyZone && joyStick) {
        joyZone.style.display = 'block';
        joyZone.style.left = (e.clientX - 55) + 'px';
        joyZone.style.top = (e.clientY - 55) + 'px';
        joyStick.style.transform = 'translate(0px, 0px)';
      }
    });

    window.addEventListener('pointermove', e => {
      if (!this.joy.active) return;
      const rx = e.clientX - this.joy.startX;
      const ry = e.clientY - this.joy.startY;
      const dist = Math.hypot(rx, ry);
      const maxR = 40;
      const clamped = Math.min(maxR, dist);
      const ang = Math.atan2(ry, rx);
      const kx = Math.cos(ang) * clamped;
      const ky = Math.sin(ang) * clamped;
      if (joyStick) joyStick.style.transform = `translate(${kx}px, ${ky}px)`;
      this.joy.dx = dist > 6 ? kx / maxR : 0;
      this.joy.dy = dist > 6 ? ky / maxR : 0;
    });

    window.addEventListener('pointerup', () => {
      this.joy.active = false;
      this.joy.dx = 0;
      this.joy.dy = 0;
      if (joyZone) joyZone.style.display = 'none';
    });

    document.addEventListener('visibilitychange', () => {
      this.audio.setAdMute(document.hidden);
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  togglePause() {
    if (this.state.phase === 'wave') {
      this.state.phase = 'paused';
      this.saveSys.gameplayStop();
      this.ui.showPauseModal(true);
    } else if (this.state.phase === 'paused') {
      this.state.phase = 'wave';
      this.saveSys.gameplayStart();
      this.ui.showPauseModal(false);
    }
  }

  startRun() {
    const hero = HEROES.find(h => h.id === this.selectedHeroId) || HEROES[0];
    const lv = this.saveSys.meta.levels;
    this.state.hero = hero;
    this.state.player = new Player(hero, lv);
    this.inventory.reset(hero.maxSlots, hero.tier1Only, this.selectedStarterId);

    this.state.mana = 25 + (lv.wealth || 0) * 15;
    this.state.relicsCount = 0;
    this.state.runShards = 0;
    this.state.revivedThisRun = false;
    this.state.shardsDoubled = false;
    this.state.shopOffers = [];
    this.state.wave = 1;
    this.renderer.decals = [];

    this.startWave();
  }

  startWave() {
    this.state.phase = 'wave';
    this.saveSys.gameplayStart();
    const waveDuration = Math.min(55, 25 + this.state.wave * 3);
    this.state.waveTimer = waveDuration;
    this.state.player.x = 0;
    this.state.player.y = 0;

    this.state.enemies = [];
    this.state.spawnWarnings = [];
    this.state.crates = [];
    this.state.lootDrops = [];
    this.state.enemyBolts = [];
    this.state.projectiles = [];
    this.state.puddles = [];
    this.state.slashes = [];
    this.state.lightnings = [];

    this.inventory.activeSpells.forEach(s => { s.cdTimer = 0.25; });

    const totalCrates = Math.max(1, this.state.player.cratesPerWave || 1);
    this.spawner.reset(waveDuration, totalCrates);

    // Сразу размещаем первую группу меток появления врагов в начале раунда
    this.spawner.queueGroupSpawn(this.state.wave, this.state.player, this.state.spawnWarnings);

    if (this.state.wave % 5 === 0) {
      this.state.enemies.push(this.spawner.spawnEnemy(this.state.wave, this.state.player, 'boss'));
    }

    this.ui.buildSpellHud();
  }

  openMasteryPromptIfNeeded() {
    const p = this.state.player;
    if (!p || p.pendingMasteryPicks <= 0) return;

    const uniqueIds = [...new Set(this.inventory.activeSpells.map(s => s.id))]
      .filter(id => p.getMasteryLevel(id) < MAX_MASTERY_LEVEL);

    if (uniqueIds.length === 0) {
      p.pendingMasteryPicks = 0;
      return;
    }

    this.state.phase = 'mastery';
    this.saveSys.gameplayStop();
    this.ui.renderMasteryModal(uniqueIds, p, chosenId => {
      p.upgradeSpellMastery(chosenId);
      p.pendingMasteryPicks = Math.max(0, p.pendingMasteryPicks - 1);
      this.audio.craft();
      this.ui.buildSpellHud();

      if (p.pendingMasteryPicks > 0) {
        this.openMasteryPromptIfNeeded();
      } else {
        this.state.phase = 'wave';
        this.saveSys.gameplayStart();
      }
    });
  }

  rollShopOffers(keepLocked = true) {
    const p = this.state.player;
    const luck = p ? (p.luck || 0) : 0;
    const tier1Spells = Object.keys(SPELLS).filter(k => SPELLS[k].tier === 1);
    const tier2Spells = Object.keys(SPELLS).filter(k => SPELLS[k].tier === 2);

    const rollSpellOffer = () => {
      const tier2Chance = this.inventory.tier1Only ? 0 : Math.min(0.35, 0.03 + luck * 0.012);
      const lvl2Chance = Math.min(0.40, 0.04 + luck * 0.015);
      const isT2 = Math.random() < tier2Chance && tier2Spells.length > 0;
      const pool = isT2 ? tier2Spells : tier1Spells;
      const id = pool[Math.floor(Math.random() * pool.length)];
      const level = (!isT2 && Math.random() < lvl2Chance) ? 2 : 1;
      return { kind: 'spell', id, level, bought: false, locked: false };
    };

    const rollItemOffer = () => {
      const w1 = 62;
      const w2 = 26 + luck * 1.4;
      const w3 = 9 + luck * 0.9;
      const w4 = 2 + luck * 0.45;
      const total = w1 + w2 + w3 + w4;
      let roll = Math.random() * total;

      let chosenTier = 1;
      if (roll < w4) chosenTier = 4;
      else if (roll < w4 + w3) chosenTier = 3;
      else if (roll < w4 + w3 + w2) chosenTier = 2;

      const tierPool = RELICS.filter(r => r.tier === chosenTier);
      const picked = tierPool[Math.floor(Math.random() * tierPool.length)] || RELICS[0];
      return { kind: 'relic', id: picked.id, bought: false, locked: false };
    };

    const next = [];
    for (let i = 0; i < 4; i++) {
      const prev = this.state.shopOffers[i];
      if (keepLocked && prev && prev.locked && !prev.bought) {
        next.push(prev);
        continue;
      }
      if (i === 0 || Math.random() < 0.45) {
        next.push(rollSpellOffer());
      } else {
        next.push(rollItemOffer());
      }
    }
    this.state.shopOffers = next;
  }

  openShop() {
    this.state.phase = 'shop';
    this.saveSys.gameplayStop();
    this.state.shopAdUsed = false;
    const baseReroll = this.state.hero.id === 'valeria' ? 6 : 8;
    this.state.rerollCost = Math.round(baseReroll + (this.state.wave - 1) * 1.8);
    this.rollShopOffers(true);

    const show = () => this.ui.openShop();
    if (this.state.wave % 3 === 0) this.saveSys.showInterstitial(show);
    else show();
  }

  castSpell(inst) {
    const allTargets = [...this.state.enemies, ...this.state.crates];
    if (allTargets.length === 0) return false;

    const stats = this.inventory.computeStats(inst, this.state.player);
    const p = this.state.player;

    let target = null, bestDist = Infinity;
    const pool = this.state.enemies.length > 0 ? this.state.enemies : this.state.crates;
    for (const t of pool) {
      const d = Math.hypot(t.x - p.x, t.y - p.y);
      if (d < bestDist) { bestDist = d; target = t; }
    }
    for (const cr of this.state.crates) {
      const d = Math.hypot(cr.x - p.x, cr.y - p.y);
      if (d < bestDist && d <= stats.radius + 45) { bestDist = d; target = cr; }
    }
    if (!target) return false;

    const angle = this.state.autoAim
      ? Math.atan2(target.y - p.y, target.x - p.x)
      : Math.atan2(this.state.mouseY - window.innerHeight / 2, this.state.mouseX - window.innerWidth / 2);

    if (stats.type === 'melee' || stats.type === 'nova') {
      if (this.state.autoAim && bestDist > stats.radius + 50) return false;
      p.castSwing = 0.28;
      this.audio.melee();
      this.state.slashes.push({
        x: p.x, y: p.y, radius: stats.radius, angle,
        full: stats.type === 'nova' || stats.id === 'blade' || stats.id === 'frostblade' || stats.id === 'venomblade' || stats.id === 'bladestorm',
        color: stats.color, life: 0.25, maxLife: 0.25
      });

      if (stats.puddle) {
        this.state.puddles.push({
          x: p.x, y: p.y, radius: stats.radius * 0.65,
          dmg: Math.round(stats.dmg * 0.35),
          isPoison: Boolean(stats.poison),
          life: 3.0, tick: 0.25
        });
      }

      for (const e of this.state.enemies) {
        if (Math.hypot(e.x - p.x, e.y - p.y) <= stats.radius + e.radius) this.damageEnemy(e, stats);
      }
      for (let i = this.state.crates.length - 1; i >= 0; i--) {
        const cr = this.state.crates[i];
        if (Math.hypot(cr.x - p.x, cr.y - p.y) <= stats.radius + cr.radius) this.damageCrate(cr, stats.dmg, i);
      }
      if (stats.vamp) p.hp = Math.min(p.maxHp, p.hp + stats.vamp);
      return true;
    }

    if (stats.type === 'chain') {
      if (bestDist > stats.radius + 70) return false;
      p.castSwing = 0.22;
      this.audio.zap();
      let curr = target;
      const visited = new Set([curr]);
      let lx = p.x, ly = p.y;

      for (let j = 0; j < (stats.chains || 3); j++) {
        const cIdx = this.state.crates.indexOf(curr);
        if (cIdx !== -1) this.damageCrate(curr, stats.dmg, cIdx);
        else {
          this.damageEnemy(curr, stats);
          if (stats.puddle) {
            this.state.puddles.push({
              x: curr.x, y: curr.y, radius: 48,
              dmg: Math.round(stats.dmg * 0.35),
              isPoison: Boolean(stats.poison),
              life: 2.8, tick: 0.25
            });
          }
        }
        this.state.lightnings.push({ x1: lx, y1: ly, x2: curr.x, y2: curr.y, color: stats.color, life: 0.22 });
        lx = curr.x; ly = curr.y;

        let next = null, nd = 220;
        for (const cand of [...this.state.enemies, ...this.state.crates]) {
          if (visited.has(cand)) continue;
          const d = Math.hypot(cand.x - curr.x, cand.y - curr.y);
          if (d < nd) { nd = d; next = cand; }
        }
        if (!next) break;
        visited.add(next);
        curr = next;
      }
      return true;
    }

    p.castSwing = 0.22;
    this.audio.shoot();
    const count = stats.projectilesCount || 1;
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.15;
      const a = angle + spread;
      this.state.projectiles.push(
        new Projectile(p.x, p.y, Math.cos(a) * stats.speed, Math.sin(a) * stats.speed, stats)
      );
    }
    return true;
  }

  damageEnemy(enemy, stats) {
    let dmg = stats.dmg;
    if (stats.chaos) dmg = Math.round(dmg * (0.5 + Math.random() * 1.8));
    enemy.takeDamage(dmg);
    if (stats.slow) enemy.applySlow(stats.slow, 2.2);
    if (stats.poison && typeof enemy.applyPoison === 'function') {
      const scaledPoison = Math.round(stats.poison * (this.state.player ? this.state.player.dmgMult : 1));
      enemy.applyPoison(scaledPoison, 4.0);
    }
    this.state.floatTexts.push({
      x: enemy.x + (Math.random() - 0.5) * 18,
      y: enemy.y - enemy.radius,
      text: String(dmg),
      color: stats.color,
      life: 0.55
    });
  }

  damageCrate(crate, dmg, indexInArray) {
    crate.takeDamage(dmg);
    this.audio.crate();
    this.state.floatTexts.push({
      x: crate.x, y: crate.y - 24,
      text: String(dmg), color: '#ffd275', life: 0.45
    });

    if (crate.isDead) {
      const drop = crate.rollDrop();
      this.state.lootDrops.push(drop);
      if (indexInArray >= 0) this.state.crates.splice(indexInArray, 1);
    }
  }

  update(dt) {
    if (this.state.phase !== 'wave') return;
    const p = this.state.player;

    this.state.waveTimer -= dt;
    if (this.state.waveTimer <= 0) {
      const bonus = 8 + this.state.wave * 3;
      this.state.runShards += bonus;
      this.saveSys.meta.shards += bonus;
      if (this.state.wave > this.saveSys.meta.bestWave) this.saveSys.meta.bestWave = this.state.wave;
      this.saveSys.save();
      this.state.wave++;
      this.openShop();
      return;
    }

    let mx = this.joy.dx, my = this.joy.dy;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) my -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) my += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
    p.move(mx, my, dt);
    p.update(dt);

    this.spawner.update(
      dt,
      this.state.wave,
      this.state.waveTimer,
      p,
      this.state.enemies,
      this.state.spawnWarnings,
      e => {
        this.state.enemies.push(e);
        for (let k = 0; k < 5; k++) {
          this.state.particles.push({
            x: e.x, y: e.y,
            vx: (Math.random() - 0.5) * 110,
            vy: (Math.random() - 0.5) * 110,
            color: e.color, size: 3.5, life: 0.25
          });
        }
      },
      cr => {
        this.state.crates.push(cr);
        this.state.floatTexts.push({
          x: cr.x, y: cr.y - 28,
          text: 'ПОЯВИЛСЯ ЯЩИК!', color: '#ffd275', life: 1.1
        });
      }
    );

    this.state.crates.forEach(c => c.update(dt));

    this.inventory.activeSpells.forEach(inst => {
      const st = this.inventory.computeStats(inst, p);
      inst.cdTimer = Math.max(0, inst.cdTimer - dt);
      if (inst.cdTimer <= 0 && this.castSpell(inst)) inst.cdTimer = st.cd;
    });

    for (let i = this.state.puddles.length - 1; i >= 0; i--) {
      const pd = this.state.puddles[i];
      pd.life -= dt;
      pd.tick -= dt;
      if (pd.tick <= 0) {
        pd.tick = 0.45;
        for (const e of this.state.enemies) {
          if (Math.hypot(e.x - pd.x, e.y - pd.y) <= pd.radius) {
            e.takeDamage(pd.dmg);
            if (pd.isPoison && typeof e.applyPoison === 'function') {
              e.applyPoison(pd.dmg * 1.5, 3.0);
            }
          }
        }
      }
      if (pd.life <= 0) this.state.puddles.splice(i, 1);
    }

    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const pr = this.state.projectiles[i];
      pr.update(dt);
      if (pr.life <= 0) { this.state.projectiles.splice(i, 1); continue; }

      let gone = false;
      for (let cIdx = this.state.crates.length - 1; cIdx >= 0; cIdx--) {
        const cr = this.state.crates[cIdx];
        if (!pr.canHit(cr)) continue;
        if (Math.hypot(cr.x - pr.x, cr.y - pr.y) <= cr.radius + 12) {
          this.damageCrate(cr, pr.stats.dmg, cIdx);
          if (pr.registerHit(cr)) { this.state.projectiles.splice(i, 1); gone = true; break; }
        }
      }
      if (gone) continue;

      for (const e of this.state.enemies) {
        if (!pr.canHit(e)) continue;
        if (Math.hypot(e.x - pr.x, e.y - pr.y) <= e.radius + 13) {
          this.damageEnemy(e, pr.stats);
          if (pr.stats.puddle) {
            this.state.puddles.push({
              x: pr.x, y: pr.y, radius: 52,
              dmg: Math.round(pr.stats.dmg * 0.35),
              isPoison: Boolean(pr.stats.poison),
              life: 3.0, tick: 0.2
            });
          }
          if (pr.stats.radius >= 34) {
            this.renderer.addDecal(pr.x, pr.y, pr.stats.radius * 0.6, pr.stats.color, 'scorch');
            for (const other of this.state.enemies) {
              if (other !== e && Math.hypot(other.x - pr.x, other.y - pr.y) <= pr.stats.radius) {
                this.damageEnemy(other, pr.stats);
                if (pr.stats.pull) {
                  other.x += (pr.x - other.x) * 0.38;
                  other.y += (pr.y - other.y) * 0.38;
                }
              }
            }
          }
          if (pr.registerHit(e)) { this.state.projectiles.splice(i, 1); break; }
        }
      }
    }

    for (let i = this.state.enemyBolts.length - 1; i >= 0; i--) {
      const b = this.state.enemyBolts[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0) { this.state.enemyBolts.splice(i, 1); continue; }
      if (Math.hypot(b.x - p.x, b.y - p.y) <= 18) {
        p.takeDamage(b.dmg);
        this.renderer.triggerShake(4);
        this.audio.hit();
        this.state.enemyBolts.splice(i, 1);
        if (p.isDead) { this.triggerGameOver(); return; }
      }
    }

    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const e = this.state.enemies[i];
      if (e.isDead) {
        // Фиксированный дроп маны: 1 со всех обычных врагов, 2 с фиолетовых (acolyte) и больших серых (golem)
        const manaVal = e.mana || 1;
        this.state.lootDrops.push(new LootDrop(e.x, e.y, 'mana', manaVal));
        this.renderer.addDecal(e.x, e.y, e.radius * 0.9, e.color, 'blood');

        const xpVal = Math.round((e.xp || 7) * this.state.hero.manaMult);
        if (typeof p.gainXp === 'function' && p.gainXp(xpVal)) {
          this.state.floatTexts.push({ x: p.x, y: p.y - 34, text: `УРОВЕНЬ ${p.charLevel}!`, color: '#38b6ff', life: 1.0 });
          if (p.pendingMasteryPicks > 0) this.openMasteryPromptIfNeeded();
        }

        if (Math.random() < 0.35 || e.isBoss) {
          this.state.runShards += e.shards;
          this.saveSys.meta.shards += e.shards;
        }
        this.state.enemies.splice(i, 1);
        continue;
      }

      e.updateAI(
        dt, p,
        (shooter, ang) => {
          const shots = shooter.isBoss ? 5 : 1;
          for (let s = 0; s < shots; s++) {
            const sa = ang + (s - (shots - 1) / 2) * 0.25;
            this.state.enemyBolts.push({
              x: shooter.x, y: shooter.y,
              vx: Math.cos(sa) * 230, vy: Math.sin(sa) * 230,
              dmg: shooter.dmg, life: 3.0
            });
          }
        },
        (poisonedEnemy, tickDmg) => {
          this.state.floatTexts.push({
            x: poisonedEnemy.x + (Math.random() - 0.5) * 14,
            y: poisonedEnemy.y - poisonedEnemy.radius,
            text: `-${tickDmg}`,
            color: '#52ff29',
            life: 0.4
          });
        }
      );

      if (e.collidesWith(p)) {
        p.takeDamage(e.dmg);
        if (p.isDead) { this.triggerGameOver(); return; }
      }
    }

    for (let i = this.state.lootDrops.length - 1; i >= 0; i--) {
      const ld = this.state.lootDrops[i];
      const d = Math.hypot(p.x - ld.x, p.y - ld.y);
      if (d < 26 || !Number.isFinite(d)) {
        if (ld.kind === 'mana') {
          this.state.mana += ld.value;
          this.audio.gem();
        } else if (ld.kind === 'heal') {
          const baseHeal = Math.max(4, p.maxHp * 0.25);
          const healAmt = Math.max(1, Math.round(baseHeal * (p.healPotionMult || 1)));
          p.hp = Math.min(p.maxHp, p.hp + healAmt);
          p.luck = Math.round(((p.luck || 0) + 1) * 10) / 10;
          this.audio.heal();
          this.state.floatTexts.push({ x: p.x, y: p.y - 28, text: `+${healAmt} HP | +1 Удача`, color: '#52e69e', life: 1.0 });
        } else if (ld.kind === 'stat' && ld.relic) {
          ld.relic.apply(p);
          p.hp = Math.min(p.maxHp, p.hp + 2);
          p.speed = Math.min(MAX_PLAYER_SPEED, p.speed);
          this.audio.craft();
          this.state.floatTexts.push({
            x: p.x - 24, y: p.y - 32,
            text: `ЯЩИК: ${ld.relic.name}!`,
            color: ld.relic.color || '#ffd275',
            life: 1.2
          });
        }
        this.state.lootDrops.splice(i, 1);
        continue;
      }
      if (d < p.magnet && d > 0.001) {
        const pullStep = Math.min(d, 800 * dt);
        ld.x += ((p.x - ld.x) / d) * pullStep;
        ld.y += ((p.y - ld.y) / d) * pullStep;
      }
    }

    this.state.slashes = this.state.slashes.filter(s => (s.life -= dt) > 0);
    this.state.lightnings = this.state.lightnings.filter(l => (l.life -= dt) > 0);
    this.state.particles.forEach(pt => { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt; });
    this.state.particles = this.state.particles.filter(pt => pt.life > 0);
    this.state.floatTexts.forEach(ft => { ft.y -= 34 * dt; ft.life -= dt; });
    this.state.floatTexts = this.state.floatTexts.filter(ft => ft.life > 0);

    this.ui.updateCombatHud();
  }

  triggerGameOver() {
    this.state.phase = 'over';
    this.saveSys.gameplayStop();
    this.saveSys.meta.totalRuns++;
    if (this.state.wave > this.saveSys.meta.bestWave) this.saveSys.meta.bestWave = this.state.wave;
    this.saveSys.save();
    this.ui.showGameOver();
  }

  revivePlayer() {
    if (this.state.revivedThisRun) return;
    this.saveSys.showRewarded('Воскрешение Феникса', () => {
      this.state.revivedThisRun = true;
      const p = this.state.player;
      p.isDead = false;
      p.hp = p.maxHp;
      p.invulnTimer = 3.5;
      this.state.enemyBolts = [];
      this.renderer.triggerShake(10);

      for (const e of this.state.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < 320 && !e.isBoss) e.takeDamage(e.hp + 999);
        else if (e.isBoss) e.takeDamage(e.maxHp * 0.25);
      }

      this.audio.revive();
      document.getElementById('gameOverModal').classList.add('hidden');
      this.state.phase = 'wave';
      this.saveSys.gameplayStart();
    });
  }

  doubleRunShards() {
    if (this.state.shardsDoubled || this.state.runShards <= 0) return;
    this.saveSys.showRewarded(`+${this.state.runShards} Осколков Бездны`, () => {
      this.saveSys.meta.shards += this.state.runShards;
      this.state.runShards *= 2;
      this.state.shardsDoubled = true;
      this.audio.craft();
      this.saveSys.save();
      this.ui.showGameOver();
    });
  }

  returnToMenu() {
    this.state.phase = 'menu';
    this.ui.showStartModal();
  }

  loop(now) {
    requestAnimationFrame(t => this.loop(t));
    const dt = Math.min(0.05, Math.max(0.001, (now - this.prevTime) / 1000));
    this.prevTime = now;

    if (this.state.particles.length > 250) this.state.particles.splice(0, this.state.particles.length - 250);
    if (this.state.puddles.length > 25) this.state.puddles.splice(0, this.state.puddles.length - 25);
    if (this.state.floatTexts.length > 80) this.state.floatTexts.splice(0, this.state.floatTexts.length - 80);

    try {
      this.update(dt);
      this.renderer.render(this.state, now);
    } catch (err) {
      console.warn('Восстановление кадра:', err);
    }
  }
}