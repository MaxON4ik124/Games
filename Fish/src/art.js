(() => {
  'use strict';
  const F = window.Fish;
  const paths = {
    fish: '<path d="M7 12C10 4 18 4 22 12c-4 8-12 8-15 0L2 7v10z"/><circle cx="17" cy="10" r=".8" fill="currentColor"/><path d="m12 6 3-4 3 5"/>',
    rod: '<path d="m3 21 11-15 3 2L6 22M14 6l3-4h4v12a3 3 0 0 1-6 0v-2"/><circle cx="9" cy="15" r="2"/>',
    map: '<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2zM9 3v15M15 6v15"/>',
    shop: '<path d="m4 3-2 6c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0l-2-6zM4 12v9h16v-9M9 21v-7h6v7"/>',
    book: '<path d="M12 5C9 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-7-2-10 1v16M5 8h4M15 8h4M5 12h4M15 12h4"/>',
    settings: '<path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3z" transform="translate(0 -1) scale(1 .97)"/><circle cx="12" cy="12" r="3"/>',
    bag: '<path d="M6 7h12l3 14H3zM8 7V5a4 4 0 0 1 8 0v2M8 12v2M16 12v2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M8 8h8M12 8v9M9 12h6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    pin: '<path d="M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    volume: '<path d="m3 9 4 0 5-5v16l-5-5H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    muted: '<path d="m3 9 4 0 5-5v16l-5-5H3zM17 9l6 6m0-6-6 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
    sparkles: '<path d="m12 3 2 6 6 3-6 2-2 7-2-7-7-2 7-3zM20 1v4m-2-2h4M3 17v4m-2-2h4"/>',
    tools: '<path d="m3 21 9-9m1-8a6 6 0 0 0-2 7l-8 8 2 2 8-8a6 6 0 0 0 7-7l-4 4-3-3 4-4a6 6 0 0 0-4 1"/>',
    float: '<path d="M12 2v5m0 10v5"/><ellipse cx="12" cy="12" rx="4" ry="6"/><path d="M8 12h8M2 19h5m10 0h5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    boat: '<path d="m2 14 10 3 10-3-4 7H6zM12 2v13M12 3l7 9h-7M10 4l-6 8h6"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>',
    trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4M12 14v5m-5 2h10m-7-2h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v1"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>'
  };
  const svg = (content, box = '0 0 24 24', cls = 'icon') => `<svg class="${cls}" viewBox="${box}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  F.art = {
    icon: name => svg(paths[name] || paths.fish),
    fish(rarity = 0, variant = 0) {
      const colors = [['#8da59a','#c4d5be','#56766f'],['#d6b45e','#f2d993','#9a7d42'],['#a59acb','#ddd1ed','#776694'],['#df9761','#f7cc7b','#a05b3d']][rarity];
      return `<svg viewBox="0 0 170 105" class="fish-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="85" cy="89" rx="49" ry="5" fill="#273f38" opacity=".07"/><g transform="translate(5 0) rotate(${variant % 2 ? -5 : 2} 85 50)"><path d="M53 51 22 29q-8 23 1 44z" fill="${colors[2]}"/><path d="m77 32 13-20 21 25M79 68l18 17 13-19" fill="${colors[2]}"/><path d="M46 51C62 18 122 17 145 48q9 4 0 9C117 88 61 86 46 51Z" fill="${colors[0]}"/><path d="M51 55q48 31 92-1-21 33-60 21Z" fill="${colors[1]}"/><path d="M116 32q-10 20 1 37" stroke="${colors[2]}" stroke-width="2" fill="none"/><path d="m87 50 18-6-7 17z" fill="${colors[2]}"/><circle cx="130" cy="44" r="6" fill="#f9f5e8"/><circle cx="131" cy="44" r="3" fill="#304b43"/><circle cx="132" cy="43" r="1" fill="white"/><path d="M142 56h5" stroke="${colors[2]}" stroke-width="2" stroke-linecap="round"/><path d="m67 42 3-3m8 2 3-3m8 2 3-3m-20 13 3-3m8 2 3-3m-24 0 3-3" stroke="${colors[1]}" stroke-width="2" stroke-linecap="round" opacity=".7"/>${rarity === 3 ? '<path d="m110 26 4-13 8 9 8-12 4 20" fill="#e9ba53"/><path d="m18 12 2 5 5 2-5 2-2 5-2-5-5-2 5-2zM146 74l2 4 5 2-5 2-2 5-2-5-4-2 4-2z" fill="#dfb45e"/>' : ''}</g></svg>`;
    },
    rod(color = '#a4754d') { return `<svg viewBox="0 0 100 100" class="item-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 83 70 17q8-8 14-7v52q0 15-10 15c-7 0-9-6-7-11" fill="none" stroke="#4c6258" stroke-width="1.8"/><path d="m20 83 50-66" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="m18 85 11-15" stroke="#645343" stroke-width="9" stroke-linecap="round"/><circle cx="40" cy="62" r="8" fill="#d7bd83" stroke="#526e63" stroke-width="2"/><circle cx="40" cy="62" r="3" fill="#526e63"/><path d="m64 28 7 5m-16 8 7 5M46 54l7 5" stroke="#fff3d3" stroke-width="2"/></svg>`; },
    bait(level = 0) { return `<svg viewBox="0 0 100 100" class="item-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${level === 0 ? '<path d="M32 63c-20-18 1-39 19-24s-1 28 12 35c11 5 17-8 9-16" stroke="#c88b76" stroke-width="14" fill="none" stroke-linecap="round"/><path d="m28 49 9 3m1-15 1 10m14-4-6 6m9 7-10-2m10 13-7 4" stroke="#9e6c60" stroke-width="2"/><circle cx="72" cy="58" r="2" fill="#3d5148"/>' : `<path d="M52 10v15m0 40v13q0 13-11 11-8-1-7-9" fill="none" stroke="#64786c" stroke-width="3"/><path d="M51 23C17 47 21 69 48 72c27-4 30-24 3-49Z" fill="${F.config.baits[level].color}"/><path d="M51 28C34 47 31 61 47 66" fill="none" stroke="#fff3d2" stroke-width="5" opacity=".65"/><circle cx="52" cy="51" r="5" fill="#f9e5b9"/>`}</svg>`; },
    bag() { return `<svg viewBox="0 0 100 100" class="item-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M32 34V24q18-15 36 0v10" fill="none" stroke="#526d5b" stroke-width="6"/><rect x="21" y="31" width="58" height="53" rx="12" fill="#9ba681"/><path d="M21 41q28 13 58 0" stroke="#d9d6ae" stroke-width="4" fill="none"/><rect x="42" y="43" width="16" height="17" rx="3" fill="#e5d8ab"/><path d="M30 65v11m40-11v11" stroke="#748665" stroke-width="3"/></svg>`; },
    boat(level = 0) { return `<svg viewBox="0 0 220 150" class="boat-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="114" cy="127" rx="83" ry="9" fill="#87a9a0" opacity=".22"/><path d="M25 87 191 82l-24 38H63Z" fill="${level === 0 ? '#ae8d6c' : '#b8814e'}"/><path d="m25 87 166-5-20 13-130 8z" fill="#e5c28c"/><path d="m48 105 124-7M60 115l106-6" stroke="#795c42" stroke-width="2" opacity=".6"/><path d="m79 90 57-6M84 101l66-10" stroke="#725a43" stroke-width="8"/><path d="M110 89V20" stroke="#785f47" stroke-width="4"/>${level > 0 ? `<path d="M116 22v54l50-5Z" fill="${level === 3 ? '#c4ad71' : '#f5edcf'}"/><path d="m102 33-33 48 33-5z" fill="#e2d9b7"/>` : '<path d="m43 117 11-16-4-10m82 29-6-12 8-11" stroke="#745941" stroke-width="3" fill="none"/><path d="m79 57 67 59m-14-8 16 15" stroke="#806950" stroke-width="5" stroke-linecap="round"/>'}<path d="M25 133h41m11 5h74m14-7h30" stroke="#89aca4" stroke-width="3" stroke-linecap="round"/></svg>`; },
    empty() { return `<svg viewBox="0 0 120 95" class="empty-art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="60" cy="80" rx="39" ry="6" fill="#e8eadd"/><path d="M30 43h60L81 77H39Z" fill="#e1dfcc"/><path d="m37 52 47 0M41 63h38M48 45l3 28m10-28v28m10-28-3 28" stroke="#c0c3a9" stroke-width="2"/><path d="M43 45v-8a17 17 0 0 1 34 0v8" fill="none" stroke="#b6bda3" stroke-width="4"/><path d="m55 16 2-5m10 4 4-5M83 24l5-2" stroke="#d3ba7f" stroke-width="2" stroke-linecap="round"/></svg>`; }
  };
})();
