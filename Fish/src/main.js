(() => {
  'use strict';
  const F = window.Fish;
  F.focusLost = false;
  F.syncPause = () => F.fishing.setPaused(document.hidden || F.focusLost || document.getElementById('modal').open || F.platform.adOpen);
  F.ui.init(); F.scene.init();
  const modal=document.getElementById('modal');
  document.addEventListener('click', async event => {
    const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
    if(button.tagName==='A')event.preventDefault();
    F.audio.unlock();const action=button.dataset.action,id=button.dataset.id;
    switch(action){
      case 'home': F.ui.close();break;
      case 'cast': F.fishing.cast();break;
      case 'close': F.ui.close();break;
      case 'inventory':case 'map':case 'boat':case 'settings':case 'help':case 'reset': F.ui.open(action);break;
      case 'atlas': F.ui.atlasLoc=F.state.location;F.ui.open('atlas');break;
      case 'shop': if(button.dataset.tab)F.ui.shopTab=button.dataset.tab;F.ui.open('shop');break;
      case 'shop-tab': F.ui.shopTab=id;F.ui.refreshModal();break;
      case 'atlas-tab': F.ui.atlasLoc=Number(id);F.ui.refreshModal();break;
      case 'sell-one': F.sell(id);break;
      case 'sell-all': F.sell('all');break;
      case 'purchase': F.purchase(button.dataset.type,Number(id));break;
      case 'repair': F.repairBoat();break;
      case 'travel': F.travel(Number(id));break;
      case 'sound': F.state.sound=!F.state.sound;F.audio.unlock();F.audio.suspend(F.fishing.paused);F.changed();if(F.ui.current==='settings')F.ui.refreshModal();F.audio.play('buy');break;
      case 'skip-tutorial': F.state.tutorial=6;F.changed();break;
      case 'restart-tutorial': F.state.tutorial=0;F.changed();F.ui.close();break;
      case 'confirm-reset': F.fishing.cancel();F.state=F.freshState();F.changed();F.ui.close();F.scene.render(0);F.ui.toast('Новая история начинается на тихом берегу.', 'success');break;
      case 'cloud-save': button.disabled=true;F.ui.toast(await F.platform.cloudSave()?'Прогресс сохранён в облаке.':'Не удалось сохранить в облаке. Локальное сохранение на месте.');if(button.isConnected)button.disabled=false;break;
      case 'cloud-load-confirm': if(!confirm('Заменить текущий прогресс облачным сохранением?'))break;button.disabled=true;{const state=await F.platform.cloudLoad();if(state){F.fishing.cancel();F.state=state;F.changed();F.ui.close();F.ui.toast('Облачное сохранение загружено.','success');}else F.ui.toast('Облачное сохранение недоступно.');if(button.isConnected)button.disabled=false;}break;
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.code!=='Space'||event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
    if(modal.open||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    // Buttons other than the cast button retain their native keyboard behavior.
    if(event.target.closest('button')&&event.target.closest('button').id!=='cast-button')return;
    event.preventDefault();F.audio.unlock();F.fishing.cast();
  });
  modal.addEventListener('cancel',event=>{event.preventDefault();F.ui.close();});
  modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)F.ui.close();}});
  modal.addEventListener('close',()=>{if(!modal.open)F.ui.current=null;F.syncPause();F.ui.tutorial();});
  window.addEventListener('blur',()=>{F.focusLost=true;F.syncPause();F.save();});
  window.addEventListener('focus',()=>{F.focusLost=false;F.syncPause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)F.save();F.syncPause();});
  window.addEventListener('pagehide',()=>{F.save();F.platform.gameplay(false);});
  document.addEventListener('contextmenu',event=>{if(event.target.closest('#scene'))event.preventDefault();});
  let last=performance.now();
  function frame(now){const delta=Math.min(100,Math.max(0,now-last));last=now;if(!F.fishing.paused){F.fishing.tick(delta);F.scene.render(delta);}requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  F.platform.init();F.syncPause();
  if(F.storageStatus==='recovered')F.ui.toast('Сохранение не удалось прочитать. Начинаем новую историю.');
  if(F.storageStatus==='unavailable')F.ui.toast('Хранилище недоступно: прогресс сохранится только до закрытия страницы.');
})();
