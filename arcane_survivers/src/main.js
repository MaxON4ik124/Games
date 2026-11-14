// src/main.js
async function bootGame() {
  try {
    const { Game } = await import('./Game.js');
    const game = new Game();
    game.init();
  } catch (err) {
    console.error('Ошибка запуска модулей:', err);
    const badge = document.getElementById('sdkStatusBadge');
    if (badge) {
      badge.style.color = '#ff4d6a';
      badge.style.fontSize = '13px';
      badge.textContent = 'Ошибка в файле: ' + (err.message || err);
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGame);
} else {
  bootGame();
}