(() => {
  'use strict';
  const F = window.Fish, $ = id => document.getElementById(id);
  const rarityBadge = r => `<span class="rarity-label ${F.config.rarities[r].id}"><i></i>${F.config.rarities[r].name}</span>`;
  const price = n => `<span class="price">${F.format(n)} <span class="text-coin">Т</span></span>`;
  const tutorialSteps = [
    ['Твой первый заброс', 'Нажми «Забросить удочку» или пробел. Начнём с чего-нибудь хорошего.'],
    ['Всё приходит к тому, кто ждёт', 'Следи за поплавком. Скоро рыба клюнет, и кнопка изменится.'],
    ['Есть поклёвка!', 'Нажми «Подсечь!» или пробел, пока рыба не уплыла.'],
    ['Познакомься со своим уловом', 'Закрой карточку рыбы и открой инвентарь — там хранится твой улов.'],
    ['Первая прибыль', 'Продай рыбу в инвентаре. За неё ты получишь Тугрики.'],
    ['Время стать чуточку лучше', 'Накопи 80 Тугриков на блесну или 100 на удочку и купи улучшение в магазине.']
  ];
  const ui = F.ui = {
    current: null, shopTab: 'rod', atlasLoc: 0, catchData: null, returnFocus: null,
    icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = F.art.icon(el.dataset.icon); }); },
    init() { this.icons(); this.render(); this.tutorial(); },
    render() {
      const s = F.state, loc = F.config.locations[s.location];
      $('balance').textContent = F.format(s.coins); $('location-name').textContent = loc.name; $('location-subtitle').textContent = loc.subtitle; $('weather').textContent = loc.weather;
      $('capacity-label').textContent = `${s.inventory.length} / ${F.capacity()}`;
      $('inventory-value').textContent = F.format(F.inventoryValue());
      $('sell-preview').disabled = !s.inventory.length;
      const preview = s.inventory.slice(-3).reverse();
      $('inventory-preview').innerHTML = preview.length ? preview.map(item => { const fish = F.fishById(item.fishId); return `<button class="preview-fish ${F.config.rarities[fish.rarity].id}" data-action="inventory"><span class="preview-art">${F.art.fish(fish.rarity,fish.location)}</span><span><strong>${fish.name}</strong>${rarityBadge(fish.rarity)}</span>${price(fish.price)}</button>`; }).join('') + (s.inventory.length > 3 ? `<button class="more-catches" data-action="inventory">Ещё ${s.inventory.length - 3} в инвентаре ${F.art.icon('arrow')}</button>` : '') : `<div class="empty-preview">${F.art.empty()}<strong>Здесь будет твой улов</strong><p>Первая рыба уже где-то рядом.</p><div class="empty-slots">${Array.from({length:5},()=>`<span>${F.art.icon('fish')}</span>`).join('')}</div></div>`;
      const rod = F.config.rods[s.rod], bait = F.config.baits[s.bait];
      $('equipment-list').innerHTML = `<button class="equipment-item" data-action="shop" data-tab="rod"><span class="equipment-art rod-bg">${F.art.rod(rod.color)}</span><span><small>ТВОЯ УДОЧКА</small><strong>${rod.name}</strong><span class="equipment-effect">${s.rod ? `На ${Math.round(rod.reduction*100)}% быстрее` : 'Начало большой истории'}</span></span>${F.art.icon('chevron')}</button><button class="equipment-item" data-action="shop" data-tab="bait"><span class="equipment-art bait-bg">${F.art.bait(s.bait)}</span><span><small>ТВОЯ ПРИМАНКА</small><strong>${bait.name}</strong><span class="equipment-effect">${s.bait ? 'Повышенный шанс редкой рыбы' : 'Простая и проверенная'}</span></span>${F.art.icon('chevron')}</button>`;
      $('boat-illustration').innerHTML = F.art.boat(s.boat);
      $('journey-title').textContent = s.boat === 3 ? 'Весь мир — твой берег' : 'Новые берега ждут';
      $('journey-description').textContent = s.boat === 3 ? 'Все локации открыты. Найди каждую легенду!' : `Улучши лодку и открой ${F.config.locations[s.boat+1].name}.`;
      $('local-rarities').innerHTML = F.config.rarities.map((r,i)=>`<span class="local-rarity ${r.id}"><i></i>${r.name}<b>${(F.probabilities()[i]*100).toFixed(1)}%</b></span>`).join('');
      $('sound-toggle').innerHTML = F.art.icon(s.sound ? 'volume' : 'muted'); $('sound-toggle').setAttribute('aria-label', s.sound ? 'Выключить звук' : 'Включить звук');
      $('tip-text').textContent = F.config.tips[Math.min(4, Math.floor(s.stats.caught / 3))];
      $('scene-caption').textContent = ['Тихая вода. Большие возможности.','У лесной воды свои секреты.','Кристально чистое приключение.','Легенды ближе, чем кажется.'][s.location];
      this.renderFishing(); this.tutorial(); F.updateSaveIndicator();
      if ($('modal').open && ['inventory','shop','map','boat','atlas'].includes(this.current)) this.refreshModal();
    },
    renderFishing() {
      const f = F.fishing; if (!f) return;
      const full = F.state.inventory.length >= F.capacity();
      const states = {
        idle: [full ? 'Сумка полна историй' : 'Вода ждёт тебя', full ? 'Продай улов, чтобы освободить место' : 'Забрось удочку, чтобы поймать рыбу', full ? 'Открыть инвентарь' : 'Забросить удочку'],
        casting: ['Удочка заброшена', 'Поплавок уже летит к воде…', 'Забрасываем…'],
        waiting: ['Терпение — тоже талант', 'Ожидание поклёвки. Следи за поплавком!', 'Ждём поклёвку…'],
        bite: ['Есть поклёвка!', 'Самое время! Нажми кнопку или пробел.', 'Подсечь!'],
        reeling: ['Кажется, это что-то интересное!', 'Аккуратно вытаскиваем улов…', 'Вытаскиваем…']
      };
      const state = states[f.phase]; $('fishing-status').textContent = state[0]; $('fishing-hint').textContent = state[1]; $('cast-label').textContent = state[2];
      $('cast-button').disabled = !['idle','bite'].includes(f.phase) || f.paused;
      $('cast-button').classList.toggle('bite', f.phase === 'bite'); $('bite-callout').hidden = f.phase !== 'bite';
      $('status-orb').classList.toggle('is-biting', f.phase === 'bite');
      $('pause-shade').hidden = !f.paused || f.phase === 'idle';
      this.updateProgress();
    },
    updateProgress() { const f = F.fishing, el = $('fishing-progress'); const p = f.phase === 'bite' ? 1-f.progress : f.progress; el.classList.toggle('visible', f.phase !== 'idle'); el.classList.toggle('bite', f.phase === 'bite'); el.firstElementChild.style.transform = `scaleX(${Math.max(0,p)})`; el.setAttribute('aria-valuenow',Math.round(p*100)); },
    toast(text, type = 'info') { const el = document.createElement('div'); el.className = `toast ${type}`; el.innerHTML = F.art.icon(type === 'success' ? 'check' : 'info'); const span = document.createElement('span'); span.textContent=text;el.appendChild(span); const container=$('modal').open?$('modal-toasts'):$('toasts');container.appendChild(el);while(container.children.length>3)container.firstElementChild.remove();setTimeout(()=>el.remove(),4200); },
    tutorial() { const step = F.state.tutorial; $('tutorial').hidden = step >= 6 || $('modal').open;if(step<6){$('tutorial-counter').textContent=`ПЕРВЫЕ ШАГИ · ${step+1} / 6`;$('tutorial-title').textContent=tutorialSteps[step][0];$('tutorial-text').textContent=tutorialSteps[step][1];} },
    open(type) {
      if(type==='inventory') F.advanceTutorial(3);
      if(!$('modal').open)this.returnFocus = document.activeElement; this.current=type;
      const titles = {inventory:['СУМКА РЫБОЛОВА','Мой улов'],shop:['ХОРОШЕЕ СНАРЯЖЕНИЕ МЕНЯЕТ ВСЁ','Рыбацкая лавка'],map:['ТВОЁ СЛЕДУЮЩЕЕ ПРИКЛЮЧЕНИЕ','Карта мира'],boat:['НАВСТРЕЧУ НОВЫМ БЕРЕГАМ','Моя лодка'],atlas:['У КАЖДОЙ РЫБЫ СВОЯ ИСТОРИЯ','Атлас рыб'],settings:['УСТРОЙСЯ ПОУДОБНЕЕ','Настройки'],catch:['НЕПЛОХОЙ ДЕНЬ, ПРАВДА?','Вот это улов!'],reset:['НАЧАТЬ С ЧИСТОГО БЕРЕГА','Сбросить прогресс?'],help:['МАЛЕНЬКАЯ ПАМЯТКА','Как рыбачить']};
      const [eyebrow,title]=titles[type]||titles.settings;$('modal-eyebrow').textContent=eyebrow;$('modal-title').textContent=title;$('modal').className=`modal-${type}`;
      this.refreshModal();if(!$('modal').open)$('modal').showModal();F.syncPause();this.tutorial();
    },
    close() { if($('modal').open)$('modal').close();this.current=null;F.syncPause();this.tutorial();if(this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true}); },
    refreshModal() {
      const active=document.activeElement; const action=active?.dataset?.action; const id=active?.dataset?.id;
      const renderer=this[`view_${this.current}`];$('modal-body').innerHTML=renderer?renderer.call(this):'';
      if(action){const buttons=$('modal-body').querySelectorAll('[data-action]');const target=[...buttons].find(b=>b.dataset.action===action&&b.dataset.id===id);if(target&&!target.disabled)target.focus({preventScroll:true});}
    },
    openCatch(data) { this.catchData=data;this.open('catch'); },
    view_catch() {
      const item=this.catchData,fish=F.fishById(item.fishId),r=F.config.rarities[fish.rarity];
      return `<div class="catch-display ${r.id}"><div class="catch-rings"></div><div class="catch-fish">${F.art.fish(fish.rarity,fish.location)}</div>${rarityBadge(fish.rarity)}<h3>${fish.name}</h3><p>${fish.description}</p><div class="catch-facts"><span><small>ВЕС</small><b>${item.weight.toFixed(2)} кг</b></span><span><small>СТОИМОСТЬ</small><b>${price(fish.price)}</b></span></div><div class="catch-added">${F.art.icon('check')}В инвентаре · ${F.state.inventory.length} / ${F.capacity()}</div><button class="button primary wide" data-action="close">Отлично! Продолжить рыбалку${F.art.icon('arrow')}</button></div>`;
    },
    view_inventory() {
      const inventory=F.state.inventory;
      return `<div class="modal-summary"><span>Занято ${inventory.length} из ${F.capacity()} ячеек</span><strong>Улов на ${price(F.inventoryValue())}</strong></div><div class="bag-meter">${Array.from({length:F.capacity()},(_,i)=>`<span class="${i<inventory.length?'filled':''}"></span>`).join('')}</div>${inventory.length ? `<div class="inventory-list">${inventory.map(item=>{const fish=F.fishById(item.fishId);return `<article class="inventory-row"><span class="inventory-art ${F.config.rarities[fish.rarity].id}">${F.art.fish(fish.rarity,fish.location)}</span><div><h3>${fish.name}</h3>${rarityBadge(fish.rarity)}<small class="fish-weight">${item.weight.toFixed(2)} кг · ${F.config.locations[fish.location].name}</small></div><button class="button subtle" data-action="sell-one" data-id="${item.uid}">Продать ${price(fish.price)}</button></article>`;}).join('')}</div><div class="modal-sticky"><button class="button primary wide" data-action="sell-all">${F.art.icon('coin')}Продать весь улов за ${F.format(F.inventoryValue())} Т</button></div>` : `<div class="modal-empty">${F.art.empty()}<h3>Пока здесь только предвкушение</h3><p>Закинь удочку, чтобы заполнить сумку историями.</p><button class="button primary" data-action="close">На рыбалку${F.art.icon('arrow')}</button></div>`}<button class="text-button centered" data-action="shop" data-tab="bag">${F.art.icon('bag')}Увеличить вместимость сумки${F.art.icon('arrow')}</button>`;
    },
    view_shop() {
      const tab=this.shopTab;
      const tabs=`<div class="tabs" role="tablist" aria-label="Отдел магазина">${[['rod','Удочки','rod'],['bait','Приманки','float'],['bag','Сумки','bag']].map(([id,name,icon])=>`<button role="tab" aria-selected="${tab===id}" class="tab ${tab===id?'selected':''}" data-action="shop-tab" data-id="${id}">${F.art.icon(icon)}${name}</button>`).join('')}</div>`;
      const list=F.config[tab==='rod'?'rods':tab==='bait'?'baits':'bags'];
      return `<div class="modal-summary"><span>Маленькие улучшения. Большие открытия.</span><strong>У тебя ${price(F.state.coins)}</strong></div>${tabs}<p class="shop-explainer">${tab==='rod'?'Меньше ожидания — больше хорошего улова.':tab==='bait'?'Все редкости доступны с самого начала. Приманка увеличивает шансы и не расходуется.':'Одна рыба занимает одну ячейку, даже если ты уже поймал такую раньше.'}</p><div class="shop-list">${list.map((item,i)=>{
        const owned=tab==='bag'?i<=F.state.bag:F.state[`${tab}s`].includes(i),equipped=F.state[tab]===i,blocked=tab==='bag'&&i>F.state.bag+1;
        const art=tab==='rod'?F.art.rod(item.color):tab==='bait'?F.art.bait(i):F.art.bag();
        let effect=tab==='rod'?`Ожидание −${Math.round(item.reduction*100)}%`:tab==='bait'?`Легендарная: ${(F.probabilities(F.state.location,i)[3]*100).toFixed(1)}%`:`${item.capacity} ячеек для улова`;
        return `<article class="shop-item ${equipped?'equipped':''}"><span class="shop-art ${tab}-bg">${art}</span><div class="shop-item-info"><h3>${item.name||`Рыбацкая сумка · ${item.capacity}`}</h3><p>${item.description||'Ещё немного места для хороших воспоминаний.'}</p><span class="item-effect">${effect}</span></div><button class="button ${equipped?'equipped-button':owned?'subtle':'primary'}" data-action="purchase" data-type="${tab}" data-id="${i}" ${equipped||blocked||tab==='bag'&&owned?'disabled':''}>${equipped?`${F.art.icon('check')}Выбрано`:owned?(tab==='bag'?'Куплено':'Выбрать'):blocked?F.art.icon('lock'):`Купить ${price(item.price)}`}</button></article>`;
      }).join('')}</div>`;
    },
    view_map() {
      return `<p class="modal-description">Четыре берега. Четыре настроения. Одна любовь к рыбалке.<br>Восстанавливай лодку, чтобы отправиться дальше.</p><div class="location-grid">${F.config.locations.map(loc=>{const locked=loc.id>F.state.boat,current=loc.id===F.state.location;return `<article class="location-card ${locked?'locked':''}"><div class="location-picture"><img src="${F.scene.thumbnail(loc.id)}" alt="Пейзаж: ${loc.name}">${locked?`<span class="lock-badge">${F.art.icon('lock')}Лодка уровня ${loc.id}</span>`:`<span class="available-badge">${F.art.icon(current?'pin':'check')}${current?'Ты здесь':'Открыто'}</span>`}<span class="location-number">0${loc.id+1}</span></div><div class="location-info"><h3>${loc.name}</h3><p>${loc.description}</p><div class="location-meta"><span>Цена рыбы ×${loc.multiplier}</span><span>Легендарная ${(F.probabilities(loc.id)[3]*100).toFixed(1)}%</span></div><button class="button ${locked?'subtle':'primary'} wide" data-action="${locked?'boat':'travel'}" data-id="${loc.id}" ${current?'disabled':''}>${current?'Текущая локация':locked?'Улучшить лодку':'Отправиться'}${F.art.icon(locked?'tools':'arrow')}</button></div></article>`;}).join('')}</div>`;
    },
    view_boat() {
      const level=F.state.boat,boat=F.config.boats[level],next=F.config.locations[level+1];
      return `<div class="boat-view"><div class="boat-display">${F.art.boat(level)}</div><div class="boat-level">${[0,1,2,3].map((v)=>`<span class="${v<=level?'done':''}">${v+1}</span>${v<3?'<i></i>':''}`).join('')}</div><span class="eyebrow">УРОВЕНЬ ЛОДКИ ${level} / 3</span><h3>${boat.name}</h3><p>${boat.description}</p>${next?`<div class="next-boat-info"><span class="next-boat-icon">${F.art.icon('map')}</span><div><small>СЛЕДУЮЩАЯ ОСТАНОВКА</small><strong>${next.name}</strong><span>Новая рыба · цены ×${next.multiplier}</span></div></div><div class="repair-progress"><div><span>На ремонт собрано</span><b>${F.format(Math.min(F.state.coins,boat.price))} / ${F.format(boat.price)} Т</b></div><span><i style="width:${Math.min(100,F.state.coins/boat.price*100)}%"></i></span></div><button class="button primary wide" data-action="repair">${F.art.icon('tools')}${level===0?'Восстановить лодку':'Улучшить лодку'} ${price(boat.price)}</button><p class="fine-print">Покупка навсегда открывает новый берег. На старые можно вернуться.</p>`:`<div class="completed-world">${F.art.icon('trophy')}Все берега открыты! Собери 16 видов рыб.</div><button class="button primary wide" data-action="map">Выбрать берег${F.art.icon('arrow')}</button>`}</div>`;
    },
    view_atlas() {
      const loc=this.atlasLoc,discovered=Object.keys(F.state.discovered).length;
      return `<div class="modal-summary"><span>Маленькая коллекция больших историй.</span><strong>Открыто ${discovered} / 16</strong></div><div class="tabs scroll-tabs">${F.config.locations.map(l=>`<button class="tab ${l.id===loc?'selected':''}" data-action="atlas-tab" data-id="${l.id}">${l.name}</button>`).join('')}</div><div class="atlas-grid">${F.config.rarities.map((r,i)=>{const fish=F.fishById(`${loc}-${i}`),count=F.state.discovered[fish.id]||0;return `<article class="atlas-card ${r.id} ${count?'discovered':'undiscovered'}"><div class="atlas-art">${F.art.fish(i,loc)}${count?'':`<span class="unknown-mark">?</span>`}</div>${rarityBadge(i)}<h3>${count?fish.name:'Неизвестная рыба'}</h3><p>${count?fish.description:'Всё ещё ждёт своего рыболова. Возможно, им станешь ты.'}</p><div class="atlas-facts"><b>${price(fish.price)}</b><span>Шанс ${(F.probabilities(loc)[i]*100).toFixed(1)}%</span></div><div class="atlas-count">${count?`Поймано: ${count}`:'Ещё не поймана'}</div></article>`;}).join('')}</div><p class="fine-print">Шансы рассчитаны для выбранной приманки. Вес рыбы — для коллекции, цена зависит от вида и локации.</p>`;
    },
    view_settings() {
      return `<div class="settings-row"><div><h3>Звуки маленьких побед</h3><p>Поклёвка, улов и звон Тугриков.</p></div><button class="toggle ${F.state.sound?'on':''}" data-action="sound" role="switch" aria-checked="${F.state.sound}" aria-label="Звуковые эффекты"><span></span></button></div><div class="stats-grid"><div><b>${F.format(F.state.stats.caught)}</b><span>рыб поймано</span></div><div><b>${F.format(F.state.stats.earned)}</b><span>Тугриков заработано</span></div><div><b>${Object.keys(F.state.discovered).length} / 16</b><span>видов открыто</span></div></div><button class="settings-link" data-action="help">${F.art.icon('info')}Как играть${F.art.icon('arrow')}</button><button class="settings-link" data-action="restart-tutorial">${F.art.icon('book')}Повторить обучение${F.art.icon('arrow')}</button>${F.platform.sdk?'<div class="cloud-actions"><button class="button subtle" data-action="cloud-save">Сохранить в облако</button><button class="button subtle" data-action="cloud-load-confirm">Загрузить из облака</button></div>':''}<div class="save-explanation">${F.art.icon('check')}Прогресс сохраняется в этом браузере автоматически. Очистка данных браузера удалит локальное сохранение.</div><button class="settings-link danger" data-action="reset">${F.art.icon('reset')}Сбросить прогресс${F.art.icon('arrow')}</button><p class="fine-print">Лови момент · Версия 1.0 · Сделано с любовью к тихим берегам</p>`;
    },
    view_help() { return `<div class="help-list">${[['rod','Забрось удочку','Нажми большую оранжевую кнопку или пробел. Дождись поклёвки: обычно 5–10 секунд.'],['float','Подсекай вовремя','У тебя есть 2,2 секунды после сигнала. Нажми «Подсечь!» или пробел. Ранние нажатия не портят заброс.'],['bag','Продай улов','Одна рыба — одна ячейка. Открой инвентарь и продай улов за Тугрики.'],['shop','Улучшай снаряжение','Удочка сокращает ожидание, приманка повышает шанс редких рыб. Обе покупки постоянные.'],['boat','Исследуй новые берега','Вложи Тугрики в лодку. В новых водах рыба дороже и больше шансов на легенду.']].map(([icon,title,text])=>`<article>${F.art.icon(icon)}<div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div><p class="fine-print">Пока открыто меню или игра не в фокусе, рыбалка стоит на паузе. Ни одна поклёвка не пропадёт.</p><button class="button primary wide" data-action="close">Всё понятно. На берег!</button>`; },
    view_reset() { return `<div class="reset-view">${F.art.icon('reset')}<p>Улов, Тугрики, снаряжение, лодка и открытые локации будут сброшены. Это действие нельзя отменить.</p><div class="reset-buttons"><button class="button subtle" data-action="settings">Оставить мой берег</button><button class="button danger-button" data-action="confirm-reset">Да, начать заново</button></div></div>`; }
  };
  F.updateSaveIndicator = () => { const el=$('save-indicator');if(!el)return;el.innerHTML=F.storageStatus==='unavailable'?`${F.art.icon('info')}Не удалось сохранить: проверь доступ к хранилищу`:'<span class="online-dot"></span>Прогресс сохраняется автоматически'; };
})();
