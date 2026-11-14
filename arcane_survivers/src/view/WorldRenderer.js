// src/view/WorldRenderer.js
const BRAZIERS = [
  { x: -380, y: -380 }, { x: 380, y: -380 },
  { x: -380, y: 380 },  { x: 380, y: 380 },
  { x: -780, y: 0 },    { x: 780, y: 0 },
  { x: 0, y: -780 },    { x: 0, y: 780 }
];

const FLOOR_LANDMARKS = (() => {
  const list = [];
  let s = 1337;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };

  [[-620, -620], [620, -620], [-620, 620], [620, 620]].forEach(([cx, cy]) => {
    list.push({ type: 'courtyard', x: cx, y: cy, radius: 170 });
  });

  [
    [-320, -640], [320, -640], [-320, 640], [320, 640],
    [-640, -320], [640, -320], [-640, 320], [640, 320]
  ].forEach(([gx, gy]) => {
    list.push({ type: 'grate', x: gx, y: gy, size: 68 });
  });

  for (let i = 0; i < 28; i++) {
    const rx = (rnd() - 0.5) * 1950;
    const ry = (rnd() - 0.5) * 1950;
    if (Math.hypot(rx, ry) < 250) continue;
    const kind = i % 3 === 0 ? 'runeSlab' : (i % 3 === 1 ? 'mossPatch' : 'mosaic');
    list.push({ type: kind, x: rx, y: ry, radius: 42 + rnd() * 34, angle: rnd() * Math.PI * 2 });
  }
  return list;
})();

export class WorldRenderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assets;
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.floorPattern = null;
    this.decals = [];
    this.shake = 0;

    window.addEventListener('resize', () => {
      this.W = this.canvas.width = window.innerWidth;
      this.H = this.canvas.height = window.innerHeight;
    });
  }

  triggerShake(amount) {
    this.shake = Math.min(12, this.shake + amount);
  }

  addDecal(x, y, radius, color, type = 'scorch') {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const safeR = Math.max(4, Number.isFinite(radius) ? radius : 24);
    this.decals.push({ x, y, radius: safeR, color, type });
    if (this.decals.length > 85) this.decals.shift();
  }

  drawFloorArchitecture(g, now, lim) {
    const runnerWidth = 104;
    const runnerLen = lim;

    [
      { x: -runnerLen, y: -runnerWidth / 2, w: runnerLen * 2, h: runnerWidth, horiz: true },
      { x: -runnerWidth / 2, y: -runnerLen, w: runnerWidth, h: runnerLen * 2, horiz: false }
    ].forEach(r => {
      g.save();
      const cGrd = r.horiz
        ? g.createLinearGradient(0, r.y, 0, r.y + r.h)
        : g.createLinearGradient(r.x, 0, r.x + r.w, 0);
      cGrd.addColorStop(0, '#2b0810');
      cGrd.addColorStop(0.12, '#631322');
      cGrd.addColorStop(0.5, '#7a182b');
      cGrd.addColorStop(0.88, '#631322');
      cGrd.addColorStop(1, '#2b0810');

      g.fillStyle = cGrd;
      g.fillRect(r.x, r.y, r.w, r.h);

      g.strokeStyle = 'rgba(232, 170, 53, 0.55)';
      g.lineWidth = 3;
      if (r.horiz) {
        g.beginPath();
        g.moveTo(r.x, r.y + 8); g.lineTo(r.x + r.w, r.y + 8);
        g.moveTo(r.x, r.y + r.h - 8); g.lineTo(r.x + r.w, r.y + r.h - 8);
        g.stroke();
      } else {
        g.beginPath();
        g.moveTo(r.x + 8, r.y); g.lineTo(r.x + 8, r.y + r.h);
        g.moveTo(r.x + r.w - 8, r.y); g.lineTo(r.x + r.w - 8, r.y + r.h);
        g.stroke();
      }
      g.restore();
    });

    for (const lm of FLOOR_LANDMARKS) {
      if (Math.abs(lm.x) > lim - 80 || Math.abs(lm.y) > lim - 80) continue;
      g.save();
      g.translate(lm.x, lm.y);

      if (lm.type === 'courtyard') {
        const cyGrd = g.createRadialGradient(0, 0, 12, 0, 0, lm.radius);
        cyGrd.addColorStop(0, 'rgba(34, 45, 72, 0.72)');
        cyGrd.addColorStop(0.8, 'rgba(18, 24, 38, 0.65)');
        cyGrd.addColorStop(1, 'rgba(10, 14, 22, 0)');
        g.fillStyle = cyGrd;
        g.beginPath(); g.arc(0, 0, lm.radius, 0, Math.PI * 2); g.fill();

        g.strokeStyle = 'rgba(232, 170, 53, 0.28)';
        g.lineWidth = 2.5;
        g.beginPath(); g.arc(0, 0, lm.radius * 0.78, 0, Math.PI * 2); g.stroke();
      } else if (lm.type === 'grate') {
        const hs = lm.size / 2;
        g.fillStyle = '#04060a';
        g.fillRect(-hs, -hs, lm.size, lm.size);
        g.strokeStyle = '#2d374d';
        g.lineWidth = 3;
        for (let p = -hs + 10; p < hs; p += 12) {
          g.beginPath();
          g.moveTo(p, -hs); g.lineTo(p, hs);
          g.moveTo(-hs, p); g.lineTo(hs, p);
          g.stroke();
        }
        g.strokeStyle = '#4f5f80';
        g.lineWidth = 4;
        g.strokeRect(-hs, -hs, lm.size, lm.size);
      } else if (lm.type === 'runeSlab') {
        g.rotate(lm.angle);
        g.fillStyle = 'rgba(22, 30, 48, 0.75)';
        g.strokeStyle = 'rgba(82, 195, 255, 0.25)';
        g.lineWidth = 2;
        g.beginPath();
        g.roundRect(-lm.radius, -lm.radius * 0.65, lm.radius * 2, lm.radius * 1.3, 8);
        g.fill(); g.stroke();
      } else if (lm.type === 'mossPatch') {
        g.fillStyle = 'rgba(32, 92, 60, 0.26)';
        g.beginPath();
        g.arc(0, 0, lm.radius * 0.7, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    g.save();
    const centerGrd = g.createRadialGradient(0, 0, 10, 0, 0, 255);
    centerGrd.addColorStop(0, 'rgba(38, 28, 56, 0.82)');
    centerGrd.addColorStop(0.65, 'rgba(18, 23, 38, 0.78)');
    centerGrd.addColorStop(1, 'rgba(12, 16, 26, 0)');
    g.fillStyle = centerGrd;
    g.beginPath(); g.arc(0, 0, 255, 0, Math.PI * 2); g.fill();

    g.rotate(now * 0.00025);
    g.strokeStyle = 'rgba(232, 170, 53, 0.32)';
    g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 235, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(0, 0, 180, 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  // Подсветка точки появления врагов на земле в стиле Brotato (пульсирующий круг + крест ✕)
  drawSpawnWarnings(g, warnings, now) {
    if (!Array.isArray(warnings) || warnings.length === 0) return;

    for (const sw of warnings) {
      if (!Number.isFinite(sw.x) || !Number.isFinite(sw.y)) continue;
      const progress = 1 - Math.max(0, sw.timer / (sw.maxTimer || 1.15));
      const pulse = 1 + Math.sin(now * 0.025) * 0.14;
      const r = (sw.radius || 22) * pulse;

      g.save();
      g.translate(sw.x, sw.y);

      // Внешнее багровое свечение
      const glow = g.createRadialGradient(0, 0, 2, 0, 0, r * 1.45);
      glow.addColorStop(0, 'rgba(255, 45, 75, 0.55)');
      glow.addColorStop(1, 'rgba(255, 20, 45, 0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(0, 0, r * 1.45, 0, Math.PI * 2);
      g.fill();

      // Заполняющийся внутренний круг по мере приближения спавна
      g.fillStyle = 'rgba(255, 38, 68, 0.32)';
      g.beginPath();
      g.arc(0, 0, r * progress, 0, Math.PI * 2);
      g.fill();

      // Контурное кольцо
      g.strokeStyle = '#ff2e4c';
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.stroke();

      // Яркая метка «✕» в центре (как в Brotato)
      const crossSize = r * 0.48;
      g.strokeStyle = '#ffd6de';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(-crossSize, -crossSize);
      g.lineTo(crossSize, crossSize);
      g.moveTo(crossSize, -crossSize);
      g.lineTo(-crossSize, crossSize);
      g.stroke();

      g.restore();
    }
  }

  drawDetailedWizard(g, cx, cy, pal, walkPhase, castSwing) {
    g.save();
    g.translate(cx, cy);

    const sway = Math.sin(walkPhase) * 2.5;
    const stepL = Math.sin(walkPhase) * 4;
    const stepR = -Math.sin(walkPhase) * 4;

    if (pal.halo) {
      g.save();
      g.translate(0, -14);
      g.rotate(performance.now() * 0.0015);
      g.strokeStyle = pal.trim;
      g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, 17, 0, Math.PI * 2); g.stroke();
      g.restore();
    }

    if (pal.multiArms) {
      for (const dir of [-1, 1]) {
        for (const row of [0, 1]) {
          const wave = Math.sin(walkPhase * 0.7 + row * 1.5 + dir) * 4;
          const ax = dir * (19 + row * 5);
          const ay = -12 + row * 9 + wave;
          g.strokeStyle = 'rgba(92, 225, 255, 0.65)';
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(dir * 7, -3);
          g.quadraticCurveTo(dir * 15, ay - 5, ax, ay);
          g.stroke();
          g.fillStyle = pal.glow;
          g.beginPath(); g.arc(ax, ay, 4, 0, Math.PI * 2); g.fill();
        }
      }
    }

    const cloakGrd = g.createLinearGradient(0, -12, 0, 19);
    cloakGrd.addColorStop(0, pal.robe);
    cloakGrd.addColorStop(1, pal.robeDark || '#0d101a');
    g.fillStyle = cloakGrd;
    g.beginPath();
    g.moveTo(-10, -10);
    g.quadraticCurveTo(-17 - sway * 0.6, 4, -15 - sway, 17);
    g.lineTo(-8, 14);
    g.lineTo(-3, 18);
    g.lineTo(3, 15);
    g.lineTo(9, 18);
    g.lineTo(15 - sway * 0.5, 16);
    g.quadraticCurveTo(16, 4, 10, -10);
    g.closePath();
    g.fill();
    g.strokeStyle = pal.trim;
    g.lineWidth = 1.6;
    g.stroke();

    g.fillStyle = '#1b2030';
    g.strokeStyle = pal.trim;
    g.lineWidth = 1.2;
    g.beginPath(); g.roundRect(-8, 12 + stepL * 0.5, 6, 6, 2); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(2, 12 + stepR * 0.5, 6, 6, 2); g.fill(); g.stroke();

    g.fillStyle = '#161b29';
    g.beginPath();
    g.moveTo(-9, -8); g.lineTo(9, -8); g.lineTo(11, 13); g.lineTo(-11, 13);
    g.closePath(); g.fill();

    g.fillStyle = pal.robe;
    g.fillRect(-4.5, -6, 9, 19);
    g.strokeStyle = pal.trim;
    g.lineWidth = 1.2;
    g.strokeRect(-4.5, -6, 9, 19);

    for (const dir of [-1, 1]) {
      g.save();
      g.translate(dir * 10, -7);
      g.fillStyle = pal.trim;
      g.beginPath();
      g.arc(0, 0, 5.5, Math.PI * 0.8, Math.PI * 2.2);
      g.closePath();
      g.fill();
      g.restore();
    }

    g.fillStyle = pal.robe;
    g.beginPath(); g.arc(0, -12, 10, 0, Math.PI * 2); g.fill();
    g.strokeStyle = pal.trim; g.lineWidth = 1.6; g.stroke();

    g.fillStyle = '#06080f';
    g.beginPath(); g.arc(0, -11.5, 7.2, 0, Math.PI * 2); g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.ellipse(-3.2, -12, 2.2, 1.3, 0.2, 0, Math.PI * 2);
    g.ellipse(3.2, -12, 2.2, 1.3, -0.2, 0, Math.PI * 2);
    g.fill();

    if (pal.hat) {
      g.fillStyle = pal.robe;
      g.beginPath(); g.ellipse(0, -17, 15, 4.5, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath();
      g.moveTo(-10, -18);
      g.quadraticCurveTo(-2, -33, 6, -34);
      g.lineTo(10, -18);
      g.closePath();
      g.fill(); g.stroke();
    }

    g.save();
    g.translate(13, 1);
    g.rotate(castSwing > 0 ? 0.85 : 0.18 + Math.sin(walkPhase * 0.5) * 0.06);

    if (pal.sword) {
      g.fillStyle = '#8cf5ff';
      g.beginPath();
      g.moveTo(0, -30); g.lineTo(4.5, -20); g.lineTo(3.5, 4); g.lineTo(-3.5, 4); g.lineTo(-4.5, -20);
      g.closePath(); g.fill();
      g.fillStyle = pal.trim;
      g.fillRect(-9, 3, 18, 3.5);
    } else {
      g.strokeStyle = '#6e4726';
      g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(0, 15); g.lineTo(0, -16); g.stroke();
      g.fillStyle = pal.glow;
      g.beginPath();
      g.moveTo(0, -26); g.lineTo(4.5, -20); g.lineTo(0, -14); g.lineTo(-4.5, -20);
      g.closePath(); g.fill();
    }
    g.restore();
    g.restore();
  }

  drawDetailedEnemy(g, e, now, playerX) {
    if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
    g.save();
    g.translate(e.x, e.y);

    const anim = now * 0.008 + (e.seed || 0);
    const r = Math.max(8, e.radius || 16);

    g.fillStyle = 'rgba(0,0,0,0.58)';
    g.beginPath();
    g.ellipse(0, r * 0.85, r * 1.05, r * 0.45, 0, 0, Math.PI * 2);
    g.fill();

    if (playerX < e.x) g.scale(-1, 1);

    const isFrozen = e.slowTimer > 0;
    const isPoisoned = e.poisonTimer > 0;
    const hitWhite = e.flash > 0;

    if (e.type === 'imp') {
      const wingFlap = Math.sin(anim * 2.2) * 0.45;
      for (const dir of [-1, 1]) {
        g.save();
        g.scale(dir, 1);
        g.rotate(wingFlap);
        g.fillStyle = hitWhite ? '#ffffff' : '#6e1122';
        g.beginPath();
        g.moveTo(4, -4);
        g.quadraticCurveTo(r * 1.4, -r * 1.3, r * 1.65, -r * 0.2);
        g.lineTo(r * 0.7, r * 0.5);
        g.closePath();
        g.fill();
        g.restore();
      }

      g.fillStyle = hitWhite ? '#ffffff' : '#e63950';
      g.strokeStyle = '#1f0409'; g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, r * 0.88, 0, Math.PI * 2); g.fill(); g.stroke();

      g.fillStyle = '#e8c374';
      for (const dir of [-1, 1]) {
        g.beginPath();
        g.moveTo(dir * 5, -r * 0.65);
        g.lineTo(dir * r * 1.2, -r * 1.3);
        g.lineTo(dir * 2, -r * 0.5);
        g.closePath();
        g.fill();
      }
    } else if (e.type === 'scarab') {
      g.strokeStyle = '#1e2e08'; g.lineWidth = 2.2;
      for (let leg = -1; leg <= 1; leg++) {
        const legMove = Math.sin(anim * 2.5 + leg * 1.2) * 3.5;
        for (const side of [-1, 1]) {
          g.beginPath();
          g.moveTo(side * 6, leg * 5);
          g.lineTo(side * (r * 1.35), leg * 7 + legMove);
          g.stroke();
        }
      }
      const pulse = 1 + Math.sin(anim * 3) * 0.12;
      g.fillStyle = hitWhite ? '#ffffff' : '#8CE622';
      g.beginPath();
      g.ellipse(0, r * 0.2, r * 0.78 * pulse, r * 0.65 * pulse, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = hitWhite ? '#ffffff' : '#2b3d16';
      g.beginPath();
      g.arc(0, -r * 0.25, r * 0.62, Math.PI * 0.85, Math.PI * 2.15);
      g.closePath(); g.fill();
    } else if (e.type === 'acolyte') {
      g.fillStyle = hitWhite ? '#ffffff' : '#6c24b5';
      g.beginPath();
      g.moveTo(-r * 0.85, r);
      g.lineTo(-r * 0.55, -r * 0.5);
      g.arc(0, -r * 0.5, r * 0.55, Math.PI, 0);
      g.lineTo(r * 0.85, r);
      g.closePath();
      g.fill();
      g.strokeStyle = '#d98cff'; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = '#e6dec8';
      g.beginPath(); g.arc(0, -r * 0.45, r * 0.38, 0, Math.PI * 2); g.fill();
    } else if (e.type === 'stalker') {
      g.fillStyle = hitWhite ? '#ffffff' : '#38e8d6';
      g.beginPath();
      g.moveTo(0, -r); g.lineTo(r * 0.85, 0); g.lineTo(r * 0.45, r);
      g.lineTo(0, r * 0.65); g.lineTo(-r * 0.45, r); g.lineTo(-r * 0.85, 0);
      g.closePath(); g.fill();
    } else if (e.type === 'golem') {
      g.fillStyle = hitWhite ? '#ffffff' : '#485466';
      g.strokeStyle = '#12161f'; g.lineWidth = 2;
      g.beginPath();
      g.moveTo(-r * 0.65, -r); g.lineTo(r * 0.65, -r); g.lineTo(r, -r * 0.25);
      g.lineTo(r * 0.8, r * 0.9); g.lineTo(-r * 0.8, r * 0.9); g.lineTo(-r, -r * 0.25);
      g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#ff6b24'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(-8, -8); g.lineTo(0, 2); g.lineTo(9, -6); g.stroke();
    } else {
      g.fillStyle = hitWhite ? '#ffffff' : '#ff3856';
      g.strokeStyle = '#ff994d'; g.lineWidth = 3;
      g.beginPath(); g.arc(0, 0, r * 0.92, 0, Math.PI * 2); g.fill(); g.stroke();
    }

    g.fillStyle = '#fff566';
    g.fillRect(-5, -4, 3, 3);
    g.fillRect(2, -4, 3, 3);

    if (isPoisoned) {
      g.strokeStyle = '#52ff29';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(Math.sin(anim * 3) * (r * 0.45), -r * 0.65, 3.5, 0, Math.PI * 2);
      g.arc(-Math.cos(anim * 2.5) * (r * 0.45), -r * 0.35, 2.5, 0, Math.PI * 2);
      g.stroke();
    }

    if (isFrozen) {
      g.fillStyle = 'rgba(130, 240, 255, 0.38)';
      g.beginPath();
      g.moveTo(0, -r * 0.9); g.lineTo(r * 0.7, 0); g.lineTo(0, r * 0.9); g.lineTo(-r * 0.7, 0);
      g.closePath(); g.fill();
    }

    if (!e.isBoss && e.hp < e.maxHp) {
      const bw = r * 1.6;
      g.fillStyle = 'rgba(0,0,0,0.75)';
      g.fillRect(-bw / 2, -r - 10, bw, 4);
      g.fillStyle = isPoisoned ? '#52f246' : '#ff3856';
      g.fillRect(-bw / 2, -r - 10, bw * Math.max(0, e.hp / e.maxHp), 4);
    }

    g.restore();
  }

  drawDetailedProjectile(g, pr, now) {
    if (!Number.isFinite(pr.x) || !Number.isFinite(pr.y)) return;
    g.save();
    g.translate(pr.x, pr.y);
    const ang = Math.atan2(pr.vy, pr.vx);
    const col = pr.stats.color || '#ff7b24';

    g.rotate(ang);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(13, 0);
    g.quadraticCurveTo(2, -9, -15, -2);
    g.lineTo(-15, 2);
    g.quadraticCurveTo(2, 9, 13, 0);
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(4, 0, 4.5, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  drawOffscreenIndicators(ctx, state) {
    const p = state.player;
    if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;

    const targets = [
      ...state.crates.map(c => ({ x: c.x, y: c.y, color: '#e8aa35', label: 'ЯЩИК', r: 14 })),
      ...state.enemies.filter(e => e.isBoss).map(b => ({ x: b.x, y: b.y, color: '#ff2442', label: 'БОСС', r: 18 }))
    ];

    const margin = 48;
    const halfW = this.W / 2 - margin;
    const halfH = this.H / 2 - margin;

    for (const t of targets) {
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) continue;

      const ang = Math.atan2(dy, dx);
      const scale = Math.min(halfW / Math.max(1, Math.abs(dx)), halfH / Math.max(1, Math.abs(dy)));
      const ix = this.W / 2 + dx * scale;
      const iy = this.H / 2 + dy * scale;

      ctx.save();
      ctx.translate(ix, iy);
      ctx.save();
      ctx.rotate(ang);
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#05070c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(t.r, 0);
      ctx.lineTo(-t.r * 0.7, -t.r * 0.65);
      ctx.lineTo(-t.r * 0.4, 0);
      ctx.lineTo(-t.r * 0.7, t.r * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const meters = Math.round(Math.hypot(dx, dy) / 25);
      ctx.font = '800 10px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${t.label} ${meters}м`, 0, t.r + 12);
      ctx.restore();
    }
  }

  render(state, now) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    if (!state.player) return;
    const p = state.player;

    if (!Number.isFinite(p.x)) p.x = 0;
    if (!Number.isFinite(p.y)) p.y = 0;

    if (this.shake > 0) this.shake = Math.max(0, this.shake - 0.35);
    const sx = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 2 : 0;
    const sy = this.shake > 0 ? (Math.random() - 0.5) * this.shake * 2 : 0;

    ctx.save();
    try {
      ctx.translate(this.W / 2 - p.x + sx, this.H / 2 - p.y + sy);

      const lim = Number.isFinite(p.arenaLimit) && p.arenaLimit >= 300 ? p.arenaLimit : 1120;
      if (!this.floorPattern && this.assets.floor) {
        this.floorPattern = ctx.createPattern(this.assets.floor.canvas, 'repeat');
      }
      if (this.floorPattern) {
        ctx.fillStyle = this.floorPattern;
        ctx.fillRect(-lim - 160, -lim - 160, (lim + 160) * 2, (lim + 160) * 2);
      }

      this.drawFloorArchitecture(ctx, now, lim);

      for (const dc of this.decals) {
        ctx.fillStyle = dc.type === 'scorch' ? 'rgba(15, 10, 8, 0.45)' : 'rgba(95, 12, 28, 0.35)';
        ctx.beginPath(); ctx.arc(dc.x, dc.y, dc.radius, 0, Math.PI * 2); ctx.fill();
      }

      for (const pd of state.puddles) {
        if (!Number.isFinite(pd.x) || !Number.isFinite(pd.y)) continue;
        const r = Math.max(10, pd.radius || 48);
        const grd = ctx.createRadialGradient(pd.x, pd.y, 4, pd.x, pd.y, r);
        if (pd.isPoison) {
          grd.addColorStop(0, 'rgba(110, 255, 60, 0.72)');
          grd.addColorStop(1, 'rgba(20, 110, 10, 0)');
        } else {
          grd.addColorStop(0, 'rgba(255, 220, 80, 0.75)');
          grd.addColorStop(1, 'rgba(140, 15, 0, 0)');
        }
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(pd.x, pd.y, r, 0, Math.PI * 2); ctx.fill();
      }

      // Отрисовка подсветки точек появления пачек врагов на полу (как в Brotato)
      this.drawSpawnWarnings(ctx, state.spawnWarnings, now);

      ctx.strokeStyle = '#e8aa35';
      ctx.lineWidth = 5;
      ctx.strokeRect(-lim, -lim, lim * 2, lim * 2);

      for (const br of BRAZIERS) {
        if (Math.abs(br.x) > lim - 40 || Math.abs(br.y) > lim - 40) continue;
        ctx.save();
        ctx.translate(br.x, br.y);
        ctx.fillStyle = '#1f2536';
        ctx.strokeStyle = '#e8aa35'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff7b1a';
        ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      for (const ld of state.lootDrops) {
        if (!Number.isFinite(ld.x) || !Number.isFinite(ld.y)) continue;
        const hover = Math.sin(now * 0.007 + ld.x) * 3.5;
        if (ld.kind === 'mana') {
          ctx.drawImage(this.assets.mana.canvas, ld.x - 14, ld.y - 14 + hover, 28, 28);
        } else if (ld.kind === 'heal') {
          ctx.drawImage(this.assets.healOrb.canvas, ld.x - 20, ld.y - 20 + hover, 40, 40);
        } else {
          ctx.drawImage(this.assets.relicDrop.canvas, ld.x - 20, ld.y - 20 + hover, 40, 40);
        }
      }

      for (const sl of state.slashes) {
        ctx.save();
        ctx.translate(sl.x, sl.y);
        const ratio = Math.max(0.05, sl.life / sl.maxLife);
        ctx.strokeStyle = sl.color;
        ctx.lineWidth = 13 * ratio;
        ctx.beginPath();
        if (sl.full) ctx.arc(0, 0, sl.radius, 0, Math.PI * 2);
        else ctx.arc(0, 0, sl.radius, sl.angle - 0.95, sl.angle + 0.95);
        ctx.stroke();
        ctx.restore();
      }

      const renderList = [
        { kind: 'player', y: p.y },
        ...state.crates.map(c => ({ kind: 'crate', y: c.y, crate: c })),
        ...state.enemies.map(e => ({ kind: 'enemy', y: e.y, enemy: e }))
      ];
      renderList.sort((a, b) => a.y - b.y);

      for (const item of renderList) {
        if (item.kind === 'player') {
          ctx.save();
          ctx.translate(p.x, p.y);
          const pal = state.hero.palette || { robe:'#b82d23', robeDark:'#4d0d08', trim:'#f5b342', glow:'#ff8533', hat:true };

          if (p.invulnTimer > 0) {
            ctx.strokeStyle = 'rgba(82, 230, 158, 0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
          }

          ctx.fillStyle = 'rgba(0,0,0,0.58)';
          ctx.beginPath(); ctx.ellipse(0, 17, 17, 7, 0, 0, Math.PI * 2); ctx.fill();

          const bob = Math.sin(p.walkAnim) * 2.5;
          ctx.scale(p.facing, 1);
          this.drawDetailedWizard(ctx, 0, bob, pal, p.walkAnim, p.castSwing);
          ctx.restore();
        } else if (item.kind === 'crate') {
          const cr = item.crate;
          ctx.save();
          ctx.translate(cr.x, cr.y);
          ctx.drawImage(this.assets.crate.canvas, -26, -26, 52, 52);
          if (cr.hp < cr.maxHp) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(-18, -32, 36, 4);
            ctx.fillStyle = '#e8aa35';
            ctx.fillRect(-18, -32, 36 * Math.max(0, cr.hp / cr.maxHp), 4);
          }
          ctx.restore();
        } else {
          this.drawDetailedEnemy(ctx, item.enemy, now, p.x);
        }
      }

      for (const pr of state.projectiles) {
        this.drawDetailedProjectile(ctx, pr, now);
      }

      for (const b of state.enemyBolts) {
        ctx.fillStyle = '#ff2970';
        ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
      }

      for (const l of state.lightnings) {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo((l.x1 + l.x2) / 2 + (Math.random() - 0.5) * 18, (l.y1 + l.y2) / 2 + (Math.random() - 0.5) * 18);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      }

      for (const pt of state.particles) {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size || 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '800 14px Rubik, sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#05070c';
      for (const ft of state.floatTexts) {
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
    } finally {
      ctx.restore();
    }

    this.drawOffscreenIndicators(ctx, state);
  }
}