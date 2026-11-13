"""Browser verification using installed Chrome/Edge and aiohttp (development only)."""
import asyncio
import base64
import functools
import http.server
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import time
import aiohttp

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / '.test-artifacts'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError):
            pass  # Chrome can close a keep-alive connection when the test ends.

class Browser:
    def __init__(self, ws):
        self.ws = ws
        self.serial = 0
        self.errors = []
        self.network_errors = []

    async def send(self, method, params=None):
        self.serial += 1
        current = self.serial
        await self.ws.send_json({'id': current, 'method': method, 'params': params or {}})
        while True:
            message = await self.ws.receive_json(timeout=30)
            if message.get('method') == 'Runtime.exceptionThrown':
                self.errors.append(message['params']['exceptionDetails'])
            if message.get('method') == 'Network.responseReceived':
                response = message['params']['response']
                if response['status'] >= 400:
                    self.network_errors.append((response['status'], response['url']))
            if message.get('id') == current:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})

    async def evaluate(self, expression):
        result = await self.send('Runtime.evaluate', {'expression': expression, 'returnByValue': True, 'awaitPromise': True, 'userGesture': True})
        if 'exceptionDetails' in result:
            raise AssertionError(result['exceptionDetails'].get('exception', result['exceptionDetails']))
        return result.get('result', {}).get('value')

    async def wait(self, expression, timeout=15):
        start = time.monotonic()
        while time.monotonic() - start < timeout:
            if await self.evaluate(expression):
                return
            await asyncio.sleep(.05)
        raise AssertionError(f'Timed out: {expression}')

    async def navigate(self, url):
        await self.send('Page.navigate', {'url': url})
        await asyncio.sleep(.3)
        await self.wait('!!window.Fish?.ui && !!window.Fish?.scene?.context')
        await self.send('Page.bringToFront')
        await self.evaluate('Fish.focusLost=false;Fish.syncPause();true')

    async def click(self, selector):
        point = await self.evaluate(f'''(() => {{ const el = document.querySelector({json.dumps(selector)}); if(!el) throw new Error('Missing button'); el.scrollIntoView({{block:'center'}}); const r=el.getBoundingClientRect(); return {{x:r.x+r.width/2,y:r.y+r.height/2}}; }})()''')
        await self.send('Input.dispatchMouseEvent', {'type': 'mousePressed', 'button': 'left', 'clickCount': 1, **point})
        await self.send('Input.dispatchMouseEvent', {'type': 'mouseReleased', 'button': 'left', 'clickCount': 1, **point})
        await asyncio.sleep(.08)

    async def screenshot(self, name):
        await asyncio.sleep(.25)
        result = await self.send('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True})
        (ARTIFACTS / name).write_bytes(base64.b64decode(result['data']))

    async def checks(self, name, script):
        try:
            result = await self.evaluate('''(() => {const F=Fish;const results=[];const check=(condition,message)=>{if(!condition)throw new Error(message);results.push(message)};''' + script + ';return results;})()')
        except AssertionError:
            print(await self.evaluate('''(() => { const m=document.getElementById('modal'), r=m.getBoundingClientRect();return {viewport:innerWidth,modal:[m.clientWidth,m.scrollWidth,r.left,r.right],wide:[...m.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect();return b.right>r.right||b.left<r.left}).map(e=>({tag:e.tagName,cls:e.className,rect:[e.getBoundingClientRect().left,e.getBoundingClientRect().right],text:e.textContent.slice(0,70)})).slice(0,25)};})()'''),flush=True)
            await self.screenshot('failure.png')
            raise
        print(f'PASS {name}: {len(result)} assertions', flush=True)
        return len(result)

async def run(browser, base):
    count = 0
    await browser.send('Runtime.enable')
    await browser.send('Page.enable')
    await browser.send('Network.enable')
    await browser.send('Emulation.setDeviceMetricsOverride', {'width': 1440, 'height': 1080, 'deviceScaleFactor': 1, 'mobile': False})
    await browser.navigate(base)
    count += await browser.checks('clean start', '''
      check(F.state.coins===0,'zero starting balance');check(F.state.inventory.length===0,'empty inventory');check(F.capacity()===5,'five starting slots');check(F.state.rod===0&&F.state.bait===0,'starting equipment');check(F.state.boat===0&&F.state.location===0,'only first shore available');check(F.fishing.phase==='idle'&&!F.fishing.paused,'ready to fish');check(!document.getElementById('tutorial').hidden,'first-run tutorial');check(F.platform.sdk===null,'offline SDK fallback');check(!document.querySelector('#cast-button').disabled,'cast button enabled');
    ''')
    await browser.screenshot('desktop.png')
    # Full real-time cycle, without changing production durations.
    await browser.click('#cast-button')
    await browser.wait("Fish.fishing.phase==='waiting'")
    await browser.wait("Fish.fishing.phase==='bite'")
    await browser.click('#cast-button')
    await browser.wait("document.getElementById('modal').open && Fish.ui.current==='catch'")
    count += await browser.checks('real-time catch', '''
      check(F.state.inventory.length===1,'fish enters inventory');check(F.state.stats.caught===1,'catch stats');check(F.state.tutorial===3,'hook tutorial advanced');check(F.fishing.paused,'catch card pauses game');check(document.querySelector('.catch-fish svg')!==null,'fish artwork displayed');
    ''')
    await browser.screenshot('catch.png')
    await browser.click('#modal [data-action="close"]')
    await browser.click('.inventory-panel [data-action="inventory"]')
    count += await browser.checks('inventory and single sale', '''
      check(F.state.tutorial===4,'inventory tutorial advanced');const value=F.inventoryValue();const uid=F.state.inventory[0].uid;check(F.sell(uid),'single sale succeeds');check(F.state.coins===value,'single sale pays exact value');check(F.state.inventory.length===0,'sold fish removed');check(!F.sell(uid),'double sale rejected');check(F.state.tutorial===5,'sale tutorial advanced');
    ''')
    await browser.evaluate('Fish.ui.close();Fish.fishing.cancel();Fish.state=Fish.freshState();Fish.state.tutorial=6;Fish.changed();true')
    count += await browser.checks('probabilities and progression', '''
      const base=F.probabilities(0,0);check(JSON.stringify(base)==='[0.7,0.22,0.07,0.01]','base odds 70/22/7/1');
      for(let l=0;l<4;l++)for(let b=0;b<4;b++){const p=F.probabilities(l,b);check(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-10,`normalized ${l}/${b}`);check(p.every(v=>v>0),`all rarities accessible ${l}/${b}`)}
      check(F.probabilities(0,3)[3]>base[3],'best bait boosts legendary odds');check(F.probabilities(3,0)[3]>base[3],'later locations boost rarity');
      check(!F.purchase('rod',1)&&F.state.coins===0,'insufficient money rejected');check(!F.travel(1),'locked travel rejected');check(!F.repairBoat(),'unfunded repair rejected');
      F.state.coins=10000;check(F.purchase('rod',1)&&F.state.rod===1,'rod purchase and equip');check(F.state.coins===9900,'rod price deducted');check(F.purchase('rod',0)&&F.state.coins===9900,'owned rod equips free');
      check(F.purchase('bait',3)&&F.state.bait===3,'bait purchase and equip');check(F.purchase('bag',1)&&F.capacity()===8,'inventory upgrade');check(!F.purchase('bag',3),'cannot skip inventory tiers');
      check(F.repairBoat()&&F.state.boat===1,'first boat repair');check(F.travel(1)&&F.state.location===1,'forest travel');check(F.repairBoat()&&F.state.boat===2,'second boat upgrade');check(F.repairBoat()&&F.state.boat===3,'final boat upgrade');check(!F.repairBoat(),'max boat cannot charge again');check(F.travel(3),'final shore accessible');check(F.travel(0),'return to old shore');
      F.state=F.freshState();F.state.tutorial=6;F.changed();
    ''')
    count += await browser.checks('fishing states and exact rarity thresholds', '''
      const random=Math.random;Math.random=()=>0;
      F.fishing.cast();check(F.fishing.phase==='casting','casting phase');const casts=F.state.stats.casts;F.fishing.cast();check(F.state.stats.casts===casts,'repeat cast ignored');
      F.fishing.tick(650);check(F.fishing.phase==='waiting'&&F.fishing.duration===5000,'baseline wait');F.fishing.tick(5000);check(F.fishing.phase==='bite','bite phase');F.fishing.tick(2200);check(F.fishing.phase==='idle'&&F.state.inventory.length===0,'missed hook loses fish');
      F.state.rod=4;F.fishing.cast();F.fishing.tick(650);check(F.fishing.duration===2000,'best rod reduces wait by 60 percent');F.fishing.cancel();F.state.rod=0;
      for(const [roll,rarity] of [[.1,0],[.75,1],[.95,2],[.995,3]]){Math.random=()=>roll;F.fishing.cast();F.fishing.tick(650);F.fishing.tick(10000);F.fishing.cast();F.fishing.tick(650);check(F.state.inventory.at(-1).fishId===`0-${rarity}`,`rarity roll ${rarity}`);F.ui.close();}
      Math.random=random;check(F.state.inventory.length===4,'four catches stored');F.addCatch('0-0',1);check(!F.addCatch('0-0',1),'overflow catch refused');F.fishing.cast();check(F.fishing.phase==='idle'&&F.ui.current==='inventory','full bag prevents cast');F.ui.close();
      const value=F.inventoryValue();check(F.sell('all')&&F.state.coins===value,'sell all exact payment');check(F.state.inventory.length===0,'sell all empties bag');F.changed();
    ''')
    count += await browser.checks('pause, save validation, tutorial and atlas', '''
      F.fishing.cast();F.fishing.tick(650);const before=F.fishing.elapsed;F.ui.open('map');F.fishing.tick(99999);check(F.fishing.elapsed===before,'modal freezes fishing timer');F.ui.close();check(!F.fishing.paused,'closing modal resumes');
      F.focusLost=true;F.syncPause();F.fishing.tick(99999);check(F.fishing.elapsed===before,'focus loss freezes timer');F.focusLost=false;F.syncPause();F.fishing.cancel();
      F.addCatch('0-3',4.2);F.state.coins=321;F.state.sound=true;F.save();const loaded=F.load();check(loaded.coins===321&&loaded.inventory.length===1&&loaded.sound,'save reload round-trip');
      const dirty=F.sanitize({version:1,coins:-1,rods:[99,0,1],rod:99,boat:0,location:3,bag:99,inventory:[{fishId:'9-9',weight:1}],stats:{caught:-5},tutorial:999});check(dirty.coins===0&&dirty.rod===0&&dirty.location===0&&dirty.bag===0&&dirty.inventory.length===0&&dirty.tutorial===0,'corrupt fields sanitized');
      localStorage.setItem(F.config.saveKey,'broken json');check(F.load().coins===0&&F.storageStatus==='recovered','invalid JSON recovers');F.save();
      F.ui.open('atlas');check(document.querySelectorAll('.atlas-card').length===4,'four fish per location');check(document.querySelectorAll('.atlas-card.discovered').length===4,'atlas discovers catches');F.ui.close();
      F.state.tutorial=5;F.state.coins=100;F.purchase('rod',1);check(F.state.tutorial===6&&document.getElementById('tutorial').hidden,'tutorial completes on upgrade');F.state.sound=false;F.changed();
    ''')
    # Reload really reads localStorage, not a retained JS object.
    await browser.navigate(base)
    count += await browser.checks('persistent reload', "check(F.state.rod===1&&F.state.inventory.length===1&&F.state.tutorial===6,'progress survives document reload');")
    await browser.evaluate("Fish.state.coins=500;Fish.changed();Fish.ui.shopTab='rod';Fish.ui.open('shop');true")
    await browser.click('#modal [data-action="purchase"][data-type="rod"][data-id="2"]')
    count += await browser.checks('store button wiring', "check(F.state.rod===2&&F.state.coins===150,'purchase button charges and equips');check(!!document.querySelector('#modal-toasts .toast'),'purchase notice visible inside dialog');")
    await browser.click('#modal [data-action="shop-tab"][data-id="bait"]')
    await browser.click('#modal [data-action="purchase"][data-type="bait"][data-id="3"]')
    count += await browser.checks('shop insufficient funds notice', "check(F.state.bait===0&&F.state.coins===150,'unaffordable button does not spend');check(document.getElementById('modal-toasts').textContent.includes('750'),'insufficient funds notice in active modal');")
    await browser.screenshot('shop.png')
    await browser.evaluate('Fish.ui.close();true')
    # Mobile and tablet: no horizontal overflow, dialogs fit viewport.
    for width, height in [(390,844),(320,740),(768,1024),(1024,768)]:
        await browser.send('Emulation.setDeviceMetricsOverride', {'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<721})
        await browser.evaluate('scrollTo(0,0);true')
        await asyncio.sleep(.1)
        count += await browser.checks(f'layout {width}', '''
          check(document.documentElement.scrollWidth<=innerWidth+1,'page has no horizontal overflow');const r=document.getElementById('cast-button').getBoundingClientRect();check(r.width>100&&r.height>=44,'cast touch target');
        ''')
        if width == 390:
            await browser.screenshot('mobile.png')
        for panel in ['shop','inventory','map','boat','atlas','settings','help']:
            await browser.evaluate(f"Fish.ui.open('{panel}');true")
            count += await browser.checks(f'{panel} at {width}', '''
              const m=document.getElementById('modal');check(m.scrollWidth<=m.clientWidth+1,'dialog has no horizontal overflow');const r=m.getBoundingClientRect();check(r.left>=0&&r.right<=innerWidth+1,'dialog fits viewport');
            ''')
            if width==390 and panel=='map':await browser.screenshot('map-mobile.png')
            await browser.evaluate('Fish.ui.close();true')
    await browser.send('Emulation.setDeviceMetricsOverride', {'width':1440,'height':1080,'deviceScaleFactor':1,'mobile':False})
    await browser.evaluate("Fish.ui.open('map');true")
    await browser.screenshot('map.png')
    await browser.evaluate("Fish.ui.open('reset');true")
    await browser.click('#modal [data-action="confirm-reset"]')
    count += await browser.checks('confirmed reset', "check(F.state.coins===0&&F.state.rod===0&&F.state.inventory.length===0&&F.state.boat===0&&F.state.tutorial===0,'reset restores fresh state');check(!document.getElementById('modal').open,'reset returns to shore');")
    # file:// launch is intentionally supported by classic ordered script tags.
    await browser.navigate((ROOT/'index.html').as_uri())
    count += await browser.checks('direct file launch', "check(!!F.scene.context&&F.fishing.phase==='idle','index.html runs without server');")
    # Verify the bridge with a deterministic fake SDK; real platform services still require a hosted draft.
    await browser.evaluate("""(async()=>{window.__sdkCalls={ready:0,start:0,stop:0,events:{},data:null};const calls=__sdkCalls;window.YaGames={init:async()=>({features:{LoadingAPI:{ready:()=>calls.ready++},GameplayAPI:{start:()=>calls.start++,stop:()=>calls.stop++}},on:(name,cb)=>calls.events[name]=cb,getPlayer:async()=>({setData:async d=>calls.data=JSON.parse(JSON.stringify(d)),getData:async()=>calls.data||{}}),adv:{showRewardedVideo:({callbacks:c})=>{c.onOpen();c.onRewarded();c.onRewarded();c.onClose()},showFullscreenAdv:({callbacks:c})=>{c.onOpen();c.onClose()}}})};await Fish.platform.init();return true})()""")
    count += await browser.checks('SDK lifecycle and advertising adapter', """
      const calls=window.__sdkCalls;check(calls.ready===1&&calls.start===1,'SDK ready and gameplay start');F.platform.ready();check(calls.ready===1,'ready reported once');
      calls.events.game_api_pause();check(F.fishing.paused&&calls.stop===1,'platform pause');calls.events.game_api_resume();check(!F.fishing.paused&&calls.start===2,'platform resume');
      let rewards=0;F.platform.rewarded(()=>rewards++);check(rewards===1,'reward delivered exactly once');check(!F.platform.adOpen&&!F.fishing.paused,'rewarded close resumes');F.platform.interstitial();check(!F.platform.adOpen&&!F.fishing.paused,'interstitial close resumes');
    """)
    assert await browser.evaluate('(async()=>{Fish.state.coins=456;return await Fish.platform.cloudSave()})()')
    assert await browser.evaluate('(async()=>{const s=await Fish.platform.cloudLoad();return s.coins===456})()')
    count += 2
    print('PASS SDK cloud round-trip: 2 assertions',flush=True)
    await browser.evaluate('clearTimeout(Fish.platform.cloudTimer);true')
    await browser.evaluate('true')
    assert not browser.errors, f'Browser exceptions: {browser.errors}'
    assert not browser.network_errors, f'HTTP errors: {browser.network_errors}'
    print(f'ALL PASS: {count} assertions, no JavaScript exceptions, no HTTP errors.', flush=True)
    (ARTIFACTS/'results.json').write_text(json.dumps({'assertions':count,'errors':browser.errors,'http_errors':browser.network_errors},ensure_ascii=False,indent=2),encoding='utf-8')

async def main():
    ARTIFACTS.mkdir(exist_ok=True)
    browsers = [os.environ.get('FISH_BROWSER',''), r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']
    executable=next((p for p in browsers if p and Path(p).exists()),None)
    if not executable:raise RuntimeError('Install Chrome/Edge or set FISH_BROWSER.')
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix='fish-browser-') as profile:
            process=subprocess.Popen([executable,'--headless=new','--disable-gpu','--disable-extensions','--disable-background-networking','--disable-component-update','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',f'--user-data-dir={profile}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                active=Path(profile)/'DevToolsActivePort'
                for _ in range(150):
                    if active.exists():break
                    if process.poll() is not None:raise RuntimeError('Browser exited before starting DevTools.')
                    await asyncio.sleep(.1)
                if not active.exists():raise RuntimeError('Browser DevTools did not start.')
                port=active.read_text().splitlines()[0]
                async with aiohttp.ClientSession() as session:
                    async with session.get(f'http://127.0.0.1:{port}/json/list') as response:targets=await response.json()
                    target=next(t for t in targets if t['type']=='page')
                    async with session.ws_connect(target['webSocketDebuggerUrl']) as ws:
                        await run(Browser(ws),f'http://127.0.0.1:{server.server_port}/index.html')
            finally:
                process.terminate()
                try:process.wait(timeout=10)
                except subprocess.TimeoutExpired:process.kill();process.wait()
                await asyncio.sleep(.5)
    finally:server.shutdown()

if __name__=='__main__':asyncio.run(main())
