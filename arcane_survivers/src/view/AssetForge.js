// src/view/AssetForge.js
export class AssetForge {
  createTex(w, h, drawFn) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    drawFn(g, w, h);
    return { canvas: c, url: c.toDataURL() };
  }

  drawHDFrame(g, s, borderCol, c1, c2, tier = 1) {
    const grad = g.createRadialGradient(s * 0.5, s * 0.38, 4, s * 0.5, s * 0.5, s * 0.72);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.65, c2);
    grad.addColorStop(1, '#05070c');
    g.fillStyle = grad;
    g.fillRect(4, 4, s - 8, s - 8);

    g.save();
    g.translate(s / 2, s / 2);
    g.strokeStyle = 'rgba(255,255,255,0.14)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(0, 0, s * 0.39, 0, Math.PI * 2);
    g.stroke();
    if (tier >= 2) {
      for (let i = 0; i < 8; i++) {
        g.rotate(Math.PI / 4);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(-1.5, -s * 0.41, 3, 4);
      }
    }
    g.restore();

    const frameGrd = g.createLinearGradient(0, 0, s, s);
    frameGrd.addColorStop(0, '#ffffff');
    frameGrd.addColorStop(0.3, borderCol);
    frameGrd.addColorStop(0.8, borderCol);
    frameGrd.addColorStop(1, '#1a1e2e');

    g.strokeStyle = frameGrd;
    g.lineWidth = tier >= 3 ? 4.5 : 3.5;
    g.strokeRect(3, 3, s - 6, s - 6);

    g.strokeStyle = 'rgba(0,0,0,0.65)';
    g.lineWidth = 1.5;
    g.strokeRect(6, 6, s - 12, s - 12);

    const cr = 11;
    [[2, 2], [s - cr - 2, 2], [2, s - cr - 2], [s - cr - 2, s - cr - 2]].forEach(([cx, cy]) => {
      g.fillStyle = borderCol;
      g.fillRect(cx, cy, cr, cr);
      g.strokeStyle = '#090c14';
      g.lineWidth = 1.2;
      g.strokeRect(cx, cy, cr, cr);
      g.fillStyle = '#fff9d6';
      g.beginPath();
      g.arc(cx + cr / 2, cy + cr / 2, 2.2, 0, Math.PI * 2);
      g.fill();
    });
  }

  buildAll() {
    const assets = {};

    assets.mana = this.createTex(64, 64, (g, w, h) => {
      g.translate(w / 2, h / 2);
      const aura = g.createRadialGradient(0, 0, 2, 0, 0, 28);
      aura.addColorStop(0, 'rgba(56, 195, 255, 0.75)');
      aura.addColorStop(1, 'rgba(56, 195, 255, 0)');
      g.fillStyle = aura;
      g.beginPath(); g.arc(0, 0, 28, 0, Math.PI * 2); g.fill();

      const bodyGrd = g.createLinearGradient(-14, -22, 16, 22);
      bodyGrd.addColorStop(0, '#c4f9ff');
      bodyGrd.addColorStop(0.4, '#33a8ff');
      bodyGrd.addColorStop(1, '#092b6e');
      g.fillStyle = bodyGrd;
      g.beginPath();
      g.moveTo(0, -24); g.lineTo(16, -6); g.lineTo(11, 20); g.lineTo(0, 25); g.lineTo(-11, 20); g.lineTo(-16, -6);
      g.closePath(); g.fill();
      g.strokeStyle = '#e6fcff'; g.lineWidth = 2; g.stroke();
    });

    assets.shard = this.createTex(64, 64, (g, w, h) => {
      g.translate(w / 2, h / 2);
      const aura = g.createRadialGradient(0, 0, 2, 0, 0, 28);
      aura.addColorStop(0, 'rgba(212, 77, 255, 0.8)');
      aura.addColorStop(1, 'rgba(212, 77, 255, 0)');
      g.fillStyle = aura;
      g.beginPath(); g.arc(0, 0, 28, 0, Math.PI * 2); g.fill();

      const grd = g.createLinearGradient(-15, -22, 15, 22);
      grd.addColorStop(0, '#ffe0ff'); grd.addColorStop(0.45, '#c83bff'); grd.addColorStop(1, '#2d054f');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(0, -25); g.lineTo(16, -8); g.lineTo(19, 9); g.lineTo(0, 25); g.lineTo(-19, 9); g.lineTo(-16, -8);
      g.closePath(); g.fill();
      g.strokeStyle = '#f8d9ff'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#ffffff';
      g.beginPath(); g.arc(0, -2, 5, 0, Math.PI * 2); g.fill();
    });

    assets.healOrb = this.createTex(64, 64, (g, w, h) => {
      g.translate(w / 2, h / 2);
      const aura = g.createRadialGradient(0, 2, 2, 0, 2, 28);
      aura.addColorStop(0, 'rgba(46, 230, 140, 0.85)');
      aura.addColorStop(1, 'rgba(46, 230, 140, 0)');
      g.fillStyle = aura;
      g.beginPath(); g.arc(0, 2, 28, 0, Math.PI * 2); g.fill();

      const flaskGrd = g.createRadialGradient(-4, 0, 2, 0, 4, 16);
      flaskGrd.addColorStop(0, '#a6ffcf');
      flaskGrd.addColorStop(0.45, '#1fd17b');
      flaskGrd.addColorStop(1, '#084729');
      g.fillStyle = flaskGrd;
      g.beginPath(); g.arc(0, 5, 14, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#e0fff0'; g.lineWidth = 2; g.stroke();

      g.fillStyle = '#d9ecf2';
      g.fillRect(-5, -15, 10, 8);
      g.strokeRect(-5, -15, 10, 8);
      g.fillStyle = '#e8aa35';
      g.fillRect(-6, -19, 12, 5);

      g.fillStyle = '#ffffff';
      g.fillRect(-2.5, -1, 5, 12);
      g.fillRect(-6, 2.5, 12, 5);
    });

    assets.relicDrop = this.createTex(64, 64, (g, w, h) => {
      g.translate(w / 2, h / 2);
      const aura = g.createRadialGradient(0, 0, 2, 0, 0, 30);
      aura.addColorStop(0, 'rgba(255, 200, 60, 0.9)');
      aura.addColorStop(1, 'rgba(255, 160, 20, 0)');
      g.fillStyle = aura;
      g.beginPath(); g.arc(0, 0, 30, 0, Math.PI * 2); g.fill();

      const boxGrd = g.createLinearGradient(-16, -14, 16, 16);
      boxGrd.addColorStop(0, '#7a28b5');
      boxGrd.addColorStop(1, '#260842');
      g.fillStyle = boxGrd;
      g.beginPath(); g.roundRect(-16, -10, 32, 24, 4); g.fill();

      g.strokeStyle = '#ffd466'; g.lineWidth = 2.5;
      g.strokeRect(-16, -10, 32, 24);
      g.beginPath(); g.moveTo(-16, -1); g.lineTo(16, -1); g.stroke();

      g.fillStyle = '#ff3860';
      g.beginPath(); g.arc(0, -1, 5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.stroke();
    });

    assets.crate = this.createTex(72, 72, (g, w, h) => {
      g.translate(w / 2, h / 2);
      g.fillStyle = 'rgba(0,0,0,0.55)';
      g.beginPath(); g.ellipse(0, 22, 24, 9, 0, 0, Math.PI * 2); g.fill();

      const woodGrd = g.createLinearGradient(-22, -22, 22, 22);
      woodGrd.addColorStop(0, '#8c582b');
      woodGrd.addColorStop(0.5, '#663c18');
      woodGrd.addColorStop(1, '#3b200a');
      g.fillStyle = woodGrd;
      g.beginPath(); g.roundRect(-21, -21, 42, 42, 4); g.fill();

      g.strokeStyle = '#241204'; g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(-20, -7); g.lineTo(20, -7);
      g.moveTo(-20, 7);  g.lineTo(20, 7);
      g.stroke();

      g.strokeStyle = '#784820'; g.lineWidth = 4;
      g.beginPath();
      g.moveTo(-17, -17); g.lineTo(17, 17);
      g.moveTo(17, -17);  g.lineTo(-17, 17);
      g.stroke();

      g.strokeStyle = '#5c6b82'; g.lineWidth = 4;
      g.strokeRect(-20, -20, 40, 40);
      g.strokeStyle = '#141821'; g.lineWidth = 1.5;
      g.strokeRect(-22, -22, 44, 44);

      g.fillStyle = '#e8aa35';
      g.beginPath(); g.arc(0, 0, 6.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#fff5b8'; g.lineWidth = 1.5; g.stroke();
    });

    assets.adIcon = this.createTex(48, 48, (g, w) => {
      this.drawHDFrame(g, w, '#ffd275', '#9c36e8', '#2a0845', 2);
      g.fillStyle = '#ffd275';
      g.beginPath(); g.moveTo(18, 13); g.lineTo(34, 24); g.lineTo(18, 35); g.closePath(); g.fill();
    });

    assets.revive = this.createTex(48, 48, (g, w) => {
      this.drawHDFrame(g, w, '#52e69e', '#1c7a52', '#09261a', 2);
      g.translate(w / 2, w / 2);
      g.fillStyle = '#b5ffd9';
      g.fillRect(-3.5, -14, 7, 28);
      g.fillRect(-14, -3.5, 28, 7);
    });

    assets.floor = this.createTex(512, 512, (g, w, h) => {
      g.fillStyle = '#07090f';
      g.fillRect(0, 0, w, h);

      const N = 8, cell = 64;
      const used = Array.from({ length: N }, () => Array(N).fill(false));
      let seed = 42;
      const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

      const palette = [
        ['#182136', '#0f1522'],
        ['#151d2e', '#0d121d'],
        ['#1a2438', '#101624'],
        ['#131a2b', '#0b0f19'],
        ['#1c2233', '#111521']
      ];

      for (let gy = 0; gy < N; gy++) {
        for (let gx = 0; gx < N; gx++) {
          if (used[gy][gx]) continue;
          let bw = 1, bh = 1;
          const r = rand();
          if (r < 0.25 && gx + 1 < N && gy + 1 < N && !used[gy][gx + 1] && !used[gy + 1][gx] && !used[gy + 1][gx + 1]) {
            bw = 2; bh = 2;
          } else if (r < 0.55 && gx + 1 < N && !used[gy][gx + 1]) {
            bw = 2; bh = 1;
          } else if (r < 0.80 && gy + 1 < N && !used[gy + 1][gx]) {
            bw = 1; bh = 2;
          }

          for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) used[gy + dy][gx + dx] = true;
          }

          const px = gx * cell, py = gy * cell, pw = bw * cell, ph = bh * cell, pad = 3;
          const [cLight, cDark] = palette[Math.floor(rand() * palette.length)];
          const stGrd = g.createLinearGradient(px, py, px + pw, py + ph);
          stGrd.addColorStop(0, cLight);
          stGrd.addColorStop(1, cDark);

          g.fillStyle = stGrd;
          g.beginPath();
          g.roundRect(px + pad, py + pad, pw - pad * 2, ph - pad * 2, 6);
          g.fill();

          g.strokeStyle = 'rgba(155, 185, 240, 0.11)';
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(px + pad + 2, py + ph - pad - 2);
          g.lineTo(px + pad + 2, py + pad + 2);
          g.lineTo(px + pw - pad - 2, py + pad + 2);
          g.stroke();

          g.strokeStyle = 'rgba(0, 0, 0, 0.68)';
          g.beginPath();
          g.moveTo(px + pad + 2, py + ph - pad);
          g.lineTo(px + pw - pad, py + ph - pad);
          g.lineTo(px + pw - pad, py + pad + 2);
          g.stroke();

          if (bw === 2 && bh === 2) {
            g.strokeStyle = 'rgba(232, 170, 53, 0.09)';
            g.lineWidth = 1.5;
            g.strokeRect(px + 14, py + 14, pw - 28, ph - 28);
            g.beginPath();
            g.arc(px + pw / 2, py + ph / 2, 22, 0, Math.PI * 2);
            g.stroke();
          }

          if (rand() < 0.36) {
            g.strokeStyle = 'rgba(5, 7, 12, 0.78)';
            g.lineWidth = 1.2;
            const cx = px + pw * (0.3 + rand() * 0.4);
            const cy = py + ph * (0.3 + rand() * 0.4);
            g.beginPath();
            g.moveTo(cx - 11, cy - 6);
            g.lineTo(cx, cy);
            g.lineTo(cx + 9, cy + 10);
            g.stroke();
          }

          if (rand() < 0.30) {
            g.fillStyle = 'rgba(36, 102, 70, 0.26)';
            g.beginPath();
            g.arc(px + pad + 4, py + pad + 4, 6 + rand() * 5, 0, Math.PI * 2);
            g.fill();
          }
        }
      }

      for (let i = 0; i < 600; i++) {
        const nx = rand() * w, ny = rand() * h;
        g.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.022)' : 'rgba(0,0,0,0.16)';
        g.fillRect(nx, ny, 2, 2);
      }
    });

    const iconSpecs = {
      meta_hp:       { c1:'#e63950', c2:'#3b0812', b:'#ff8fa0', t:2, motif:'flame' },
      meta_dmg:      { c1:'#ff8533', c2:'#3d1405', b:'#ffd275', t:2, motif:'sword' },
      meta_haste:    { c1:'#38b6ff', c2:'#092542', b:'#a6e9ff', t:2, motif:'crystal' },
      meta_wealth:   { c1:'#e6a832', c2:'#382405', b:'#ffe899', t:2, motif:'rock' },
      meta_mobility: { c1:'#29cc84', c2:'#062b1b', b:'#8cffc7', t:2, motif:'bolt' },
      meta_discount: { c1:'#c24dff', c2:'#290640', b:'#f0b3ff', t:2, motif:'vortex' },
      // Базовые Тир 1
      fireball:      { c1:'#ff9e2c', c2:'#4d1006', b:'#ffbd59', t:1, motif:'flame' },
      stone:         { c1:'#bfa588', c2:'#2e241b', b:'#d9c3a9', t:1, motif:'rock' },
      water:         { c1:'#2eb5ff', c2:'#082a52', b:'#80d4ff', t:1, motif:'wave' },
      lightning:     { c1:'#ffea38', c2:'#3b3004', b:'#fff58c', t:1, motif:'bolt' },
      frost:         { c1:'#94f4ff', c2:'#0d3847', b:'#d6fbff', t:1, motif:'crystal' },
      blade:         { c1:'#dce6f5', c2:'#212a3b', b:'#b0c4de', t:1, motif:'sword' },
      scythe:        { c1:'#e6395c', c2:'#360713', b:'#ff7592', t:1, motif:'scythe' },
      chaos:         { c1:'#d44dff', c2:'#2a063d', b:'#ea99ff', t:1, motif:'vortex' },
      poison:        { c1:'#52f246', c2:'#0c3b09', b:'#a8ff8c', t:1, motif:'poison' },
      // Гибриды Тир 2
      lava:          { c1:'#ff551a', c2:'#3d1204', b:'#ff944d', t:2, motif:'meteor' },
      steam:         { c1:'#c4e8f7', c2:'#283a4a', b:'#ffffff', t:2, motif:'cloud' },
      railgun:       { c1:'#52d1ff', c2:'#18203d', b:'#ffe047', t:2, motif:'spear' },
      blizzard:      { c1:'#6be5ff', c2:'#0b2840', b:'#bff5ff', t:2, motif:'crystal' },
      storm:         { c1:'#4d9aff', c2:'#121a3d', b:'#fff059', t:2, motif:'bolt' },
      fireblade:     { c1:'#ff771a', c2:'#401106', b:'#ffc266', t:2, motif:'sword' },
      reaper:        { c1:'#bd2eff', c2:'#240436', b:'#ff4d7a', t:2, motif:'scythe' },
      singularity:   { c1:'#8c3bff', c2:'#070212', b:'#df99ff', t:2, motif:'blackhole' },
      frostblade:    { c1:'#7af0ff', c2:'#0d2a3d', b:'#d9fcff', t:2, motif:'sword' },
      magmawave:     { c1:'#ff384c', c2:'#360810', b:'#ff94a2', t:2, motif:'wave' },
      plasmaflail:   { c1:'#ffee38', c2:'#1c2b4d', b:'#75f0ff', t:2, motif:'mace' },
      glacierspike:  { c1:'#80e5ff', c2:'#242b38', b:'#e0faff', t:2, motif:'rock' },
      // 8 Гибридов Яда (Тир 2)
      acidcloud:     { c1:'#7dff38', c2:'#113818', b:'#d2ff99', t:2, motif:'cloud' },
      plaguefire:    { c1:'#b8ff29', c2:'#3b2206', b:'#ffee66', t:2, motif:'flame' },
      venomblade:    { c1:'#42f57b', c2:'#0b3321', b:'#b3ffd0', t:2, motif:'sword' },
      rotscythe:     { c1:'#99e62e', c2:'#280926', b:'#d9ff75', t:2, motif:'scythe' },
      toxicboulder:  { c1:'#7acc29', c2:'#242910', b:'#c4ff75', t:2, motif:'meteor' },
      frostvenom:    { c1:'#52ffd1', c2:'#093338', b:'#b8fff0', t:2, motif:'crystal' },
      biohazard:     { c1:'#c8ff29', c2:'#1b3306', b:'#ffff80', t:2, motif:'bolt' },
      mutagen:       { c1:'#b54dff', c2:'#123809', b:'#99ff66', t:2, motif:'poison' },
      // Высшие Тир 3
      armageddon:    { c1:'#ff2600', c2:'#290300', b:'#ffbb00', t:3, motif:'meteor' },
      zeus:          { c1:'#fff24d', c2:'#0d2242', b:'#8ce8ff', t:3, motif:'bolt' },
      abyssgod:      { c1:'#e23bff', c2:'#080012', b:'#ff3366', t:3, motif:'blackhole' },
      abszero:       { c1:'#99f7ff', c2:'#051b2e', b:'#ffffff', t:3, motif:'crystal' },
      bladestorm:    { c1:'#ffaa2b', c2:'#2b1238', b:'#fff099', t:3, motif:'sword' },
      pandemic:      { c1:'#52ff29', c2:'#142e04', b:'#e6ff80', t:3, motif:'poison' }
    };

    Object.keys(iconSpecs).forEach(k => {
      const sp = iconSpecs[k];
      assets[k] = this.createTex(96, 96, (g, s) => {
        this.drawHDFrame(g, s, sp.b, sp.c1, sp.c2, sp.t || 2);
        g.save();
        g.translate(s / 2, s / 2);
        g.scale(1.38, 1.38);

        const glow = g.createRadialGradient(0, 0, 2, 0, 0, 24);
        glow.addColorStop(0, sp.c1);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = glow;
        g.beginPath(); g.arc(0, 0, 24, 0, Math.PI * 2); g.fill();

        g.fillStyle = sp.b;
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;

        switch (sp.motif) {
          case 'poison':
            // Капля яда с черепом/пузырями токсина
            g.fillStyle = sp.c1;
            g.beginPath();
            g.moveTo(0, -22);
            g.bezierCurveTo(16, -4, 18, 15, 0, 20);
            g.bezierCurveTo(-18, 15, -16, -4, 0, -22);
            g.fill(); g.stroke();
            g.fillStyle = '#071a04';
            g.beginPath();
            g.arc(-4.5, 4, 3, 0, Math.PI * 2);
            g.arc(4.5, 4, 3, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#e6ff99';
            g.beginPath();
            g.arc(-11, -10, 3.5, 0, Math.PI * 2);
            g.arc(12, -6, 2.5, 0, Math.PI * 2);
            g.fill();
            break;
          case 'flame':
            g.fillStyle = sp.c1;
            g.beginPath();
            g.moveTo(0, -22);
            g.bezierCurveTo(19, -8, 20, 14, 0, 21);
            g.bezierCurveTo(-20, 14, -19, -8, 0, -22);
            g.fill(); g.stroke();
            g.fillStyle = '#ffd966';
            g.beginPath();
            g.moveTo(0, -11);
            g.bezierCurveTo(10, -2, 11, 12, 0, 17);
            g.bezierCurveTo(-11, 12, -10, -2, 0, -11);
            g.fill();
            g.fillStyle = '#ffffff';
            g.beginPath(); g.arc(0, 8, 5, 0, Math.PI * 2); g.fill();
            break;
          case 'rock':
            g.beginPath();
            g.moveTo(-12, -17); g.lineTo(10, -19); g.lineTo(20, -3);
            g.lineTo(13, 17); g.lineTo(-14, 16); g.lineTo(-20, -4);
            g.closePath(); g.fill(); g.stroke();
            break;
          case 'wave':
            g.lineWidth = 3;
            for (let i = -1; i <= 1; i++) {
              g.beginPath();
              g.arc(0, i * 4, 15 - Math.abs(i) * 3, 0.15, Math.PI * 1.5);
              g.stroke();
            }
            break;
          case 'bolt':
            g.beginPath();
            g.moveTo(6, -23); g.lineTo(-13, 2); g.lineTo(2, 2);
            g.lineTo(-7, 23); g.lineTo(15, -4); g.lineTo(0, -4);
            g.closePath(); g.fill(); g.stroke();
            break;
          case 'crystal':
            for (let i = 0; i < 6; i++) {
              g.rotate(Math.PI / 3);
              g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -20); g.stroke();
              g.beginPath(); g.moveTo(-5, -13); g.lineTo(0, -19); g.lineTo(5, -13); g.stroke();
            }
            g.fillStyle = '#ffffff';
            g.beginPath(); g.arc(0, 0, 4.5, 0, Math.PI * 2); g.fill();
            break;
          case 'sword':
            g.rotate(-Math.PI / 4);
            const bladeGrd = g.createLinearGradient(-4, -22, 4, 6);
            bladeGrd.addColorStop(0, '#ffffff');
            bladeGrd.addColorStop(0.5, sp.b);
            bladeGrd.addColorStop(1, '#5c6b8a');
            g.fillStyle = bladeGrd;
            g.beginPath();
            g.moveTo(0, -24); g.lineTo(5, -15); g.lineTo(4, 6); g.lineTo(-4, 6); g.lineTo(-5, -15);
            g.closePath(); g.fill(); g.stroke();
            g.fillStyle = '#e8aa35';
            g.fillRect(-13, 5, 26, 4.5);
            g.fillStyle = '#4a2511';
            g.fillRect(-2.5, 9.5, 5, 9);
            break;
          case 'scythe':
            g.beginPath();
            g.arc(3, -4, 17, Math.PI * 0.85, Math.PI * 1.98);
            g.lineWidth = 6; g.stroke();
            g.lineWidth = 3;
            g.strokeStyle = '#d9b382';
            g.beginPath(); g.moveTo(-10, 20); g.lineTo(10, -17); g.stroke();
            break;
          case 'vortex':
          case 'blackhole':
            g.fillStyle = '#040108';
            g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill();
            g.strokeStyle = sp.b; g.lineWidth = 2.6;
            for (let i = 0; i < 4; i++) {
              g.rotate(Math.PI / 2);
              g.beginPath(); g.arc(6, 6, 13, 0, Math.PI * 0.85); g.stroke();
            }
            break;
          case 'meteor':
            g.beginPath(); g.arc(-4, 6, 11, 0, Math.PI * 2); g.fill(); g.stroke();
            g.beginPath(); g.moveTo(-13, -2); g.lineTo(18, -21); g.lineTo(9, 13); g.stroke();
            break;
          case 'cloud':
            g.beginPath();
            g.arc(-7, 2, 9, 0, Math.PI * 2);
            g.arc(6, 2, 10, 0, Math.PI * 2);
            g.arc(0, -6, 10, 0, Math.PI * 2);
            g.fill(); g.stroke();
            break;
          case 'spear':
            g.rotate(Math.PI / 4);
            g.beginPath(); g.moveTo(0, -23); g.lineTo(7, -6); g.lineTo(-7, -6); g.closePath(); g.fill(); g.stroke();
            g.beginPath(); g.moveTo(0, -6); g.lineTo(0, 21); g.stroke();
            break;
          case 'mace':
            g.beginPath(); g.arc(0, -6, 11, 0, Math.PI * 2); g.fill(); g.stroke();
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2;
              g.beginPath();
              g.moveTo(Math.cos(a) * 11, -6 + Math.sin(a) * 11);
              g.lineTo(Math.cos(a) * 17, -6 + Math.sin(a) * 17);
              g.stroke();
            }
            g.beginPath(); g.moveTo(0, 5); g.lineTo(0, 21); g.stroke();
            break;
        }
        g.restore();
      });
    });

    const heroPalettes = {
      ignis:   { robe:'#b82d23', trim:'#f5b342', glow:'#ff8533', hat:true },
      malkor:  { robe:'#1f529c', trim:'#5ce1ff', glow:'#38f8c2', multiArms:true },
      valeria: { robe:'#6e1f8f', trim:'#ffd84d', glow:'#e575ff', halo:true },
      cassian: { robe:'#225c43', trim:'#cfdbe8', glow:'#38e89b', sword:true }
    };

    Object.keys(heroPalettes).forEach(id => {
      const p = heroPalettes[id];
      assets['hero_' + id] = this.createTex(96, 96, (g, s) => {
        this.drawHDFrame(g, s, p.trim, p.robe, '#070a12', 3);
        g.save();
        g.translate(s / 2, s / 2 + 12);
        g.scale(1.4, 1.4);

        if (p.halo) {
          g.strokeStyle = p.trim; g.lineWidth = 2;
          g.beginPath(); g.arc(0, -14, 16, 0, Math.PI * 2); g.stroke();
        }
        g.fillStyle = p.robe;
        g.beginPath(); g.moveTo(-14, 16); g.lineTo(-9, -8); g.lineTo(9, -8); g.lineTo(14, 16); g.closePath(); g.fill();
        g.strokeStyle = p.trim; g.lineWidth = 1.8; g.stroke();

        g.fillStyle = '#06080f';
        g.beginPath(); g.arc(0, -12, 9, 0, Math.PI * 2); g.fill(); g.stroke();

        if (p.hat) {
          g.fillStyle = p.robe;
          g.beginPath(); g.ellipse(0, -17, 14, 4, 0, 0, Math.PI * 2); g.fill(); g.stroke();
          g.beginPath(); g.moveTo(-9, -18); g.lineTo(5, -32); g.lineTo(9, -18); g.closePath(); g.fill(); g.stroke();
        }
        g.fillStyle = p.glow;
        g.fillRect(-4.5, -13, 3, 2.5); g.fillRect(1.5, -13, 3, 2.5);
        g.restore();
      });
    });

    return assets;
  }
}