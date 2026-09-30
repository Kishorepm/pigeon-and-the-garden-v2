const {prepare,satchel}=require('./kingdom-browser-helpers.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const M=require('../kingdom-weather-model');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html';
const out=path.join(__dirname,'../.local-review');fs.mkdirSync(out,{recursive:true});
const raw=()=>({current:{time:Math.floor(Date.now()/1000),temperature_2m:16.2,weather_code:63,cloud_cover:94,precipitation:.8,wind_speed_10m:23,wind_direction_10m:250}});
async function enter(browser,{phone=false,fallback=false,offline=false,cached=false}={}){
  const p=await browser.newPage({viewport:phone?{width:390,height:844}:{width:1280,height:900},isMobile:phone,hasTouch:phone,deviceScaleFactor:phone?2:1,reducedMotion:'no-preference'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.setDefaultTimeout(20000);
  if(cached)await p.addInitScript(w=>localStorage.setItem('kingdom-weather-v2',JSON.stringify(w)),M.normalize(raw()));
  await p.route('**/api/kingdom-weather',r=>r.fulfill({status:offline||fallback?503:200,contentType:'application/json',body:JSON.stringify(M.normalize(raw()))}));
  await p.route('https://api.open-meteo.com/**',r=>offline?r.abort():r.fulfill({contentType:'application/json',body:JSON.stringify(raw())}));
  await p.route('**/kingdom-world.js',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await prepare(p);await p.goto(url);await p.locator('#loading').waitFor({state:'hidden',timeout:45000});
  await p.getByRole('button',{name:'Enter our kingdom'}).click();await p.getByRole('button',{name:'North · the knight',exact:true}).click();await p.waitForFunction(()=>!KingdomSky.busy);
  return {p,errors};
}
async function sky(p,mode){await p.getByRole('button',{name:'Weather and sky',exact:true}).click();await p.locator('.sky-preview summary').click();await p.getByLabel('Choose a sky',{exact:true}).selectOption(mode);await p.getByRole('button',{name:'Preview this sky'}).click();}
const shot=(p,name)=>p.screenshot({path:path.join(out,name+'.png')});

test('live regional weather, preview skies, zoom and a return from the map stay consistent',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b,{fallback:true});
    assert.equal(await p.evaluate(()=>KingdomSky.status()),'current');assert.match(await p.locator('#realm-weather').textContent(),/16° · Rain/);assert.equal(await p.evaluate(()=>testScene.wet),true);
    await satchel(p,'Zoom in world');assert.equal(await p.locator('#zoom-reset').textContent(),'110%');
    await p.mouse.move(620,450);await p.mouse.wheel(0,-100);await p.waitForFunction(()=>testScene.view.factor>1.2);
    await p.keyboard.press('0');assert.equal(await p.evaluate(()=>testScene.view.factor),1);await p.keyboard.press('-');assert.equal(await p.evaluate(()=>testScene.view.factor),.9);
    await satchel(p,'Show kingdom map');await p.getByRole('button',{name:/Our castle A home/}).click();await p.getByRole('button',{name:'Arrive now'}).click();await p.waitForFunction(()=>testScene.interiors.active);await p.getByRole('button',{name:'Leave room',exact:true}).click();
    assert.equal(await p.evaluate(()=>testScene.view.factor),.9);assert.ok(Math.abs(await p.evaluate(()=>testScene.cameras.main.zoom)-1.575)<.001);
    const before=await p.evaluate(()=>JSON.stringify(KingdomUI.store.state));await sky(p,'storm');assert.equal(await p.evaluate(()=>KingdomSky.status()),'preview');assert.match(await p.locator('#realm-weather').textContent(),/Preview · Storm/);
    await p.bringToFront();
    await p.waitForFunction(()=>testScene.atmosphere.level>.14);await shot(p,'weather-storm-desktop');
    await p.getByRole('button',{name:'Weather and sky',exact:true}).click();assert.equal(await p.locator('.sky-temperature').count(),0);await p.getByRole('button',{name:'Follow Auckland again'}).click();assert.equal(await p.evaluate(()=>KingdomSky.mode),'live');
    assert.equal(await p.evaluate(()=>JSON.stringify(KingdomUI.store.state)),before,'weather choices never change relationship data');
    await p.reload();await p.locator('#loading').waitFor({state:'hidden'});assert.equal(await p.evaluate(()=>testScene.view.factor),.9);assert.equal(await p.evaluate(()=>KingdomSky.mode),'live');
    await p.keyboard.press('0');await satchel(p,'Journal');await p.getByText('Letters & possibilities',{exact:false}).first().click();await p.getByRole('button',{name:/Time capsules A little/}).click();await p.getByRole('heading',{name:'For a later version of us.'}).waitFor();assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('phone pinch cannot select scenery; single taps still walk, and camera controls fit small screens',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b,{phone:true});
    await p.evaluate(()=>{testScene.active.setPosition(440,855);testScene.frameParty(true);});await p.waitForTimeout(200);
    const pt=await p.evaluate(()=>{const c=testScene.cameras.main;return {x:c.width/2+(480-c.midPoint.x)*c.zoom,y:c.height/2+(855-c.midPoint.y)*c.zoom};});
    await p.touchscreen.tap(pt.x,pt.y);await p.waitForFunction(()=>testScene.active.x>465);await p.waitForFunction(()=>!testScene.travel);
    const before=await p.evaluate(()=>[testScene.active.x,testScene.active.y]);
    // Pointer events exercise the browser gesture arbiter; the pending scenery
    // callback represents the Phaser touchstart that precedes the second finger.
    await p.evaluate(()=>{const c=testScene.game.canvas,fire=(type,id,x,y)=>c.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,bubbles:true,cancelable:true}));fire('pointerdown',101,130,370);testScene.worldAction(()=>testScene.visit('castle'));fire('pointerdown',102,240,370);fire('pointermove',102,295,370);fire('pointerup',101,130,370);fire('pointerup',102,295,370);});
    assert.equal(await p.evaluate(()=>testScene.view.factor),1.5);assert.equal(await p.evaluate(()=>testScene.travel),null);assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),before);assert.equal(await p.locator('#book').getAttribute('open'),null);
    await satchel(p,/Reset world zoom/);await sky(p,'fog');await p.waitForTimeout(300);await shot(p,'weather-mist-phone');
    await p.getByRole('button',{name:'Weather and sky',exact:true}).click();await shot(p,'weather-preview-phone');await p.getByRole('button',{name:'Close journal'}).click();
    for(const size of [{width:320,height:740},{width:844,height:390}]){await p.setViewportSize(size);await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.locator('#menu-open').click();const z=await p.locator('.camera-tools').boundingBox(),dock=await p.locator('.bottom-dock').boundingBox();assert.ok(z.y+z.height<dock.y,'zoom lives inside the satchel above navigation');assert.ok(z.x>=0&&z.x+z.width<=size.width);await shot(p,'weather-view-'+size.width);await p.locator('#explorer-close').click();}
    await p.setViewportSize({width:390,height:844});await p.locator('#menu-open').click();for(let i=0;i<15;i++)await p.getByRole('button',{name:'Zoom in world',exact:true}).evaluate(b=>b.click());assert.equal(await p.evaluate(()=>testScene.view.factor),1.9);assert.equal(await p.getByRole('button',{name:'Zoom in world',exact:true}).isDisabled(),true);
    await satchel(p,'Journal');await p.getByRole('button',{name:/Ruby’s meadow A ball/}).click();await p.getByRole('button',{name:'Let’s play fetch',exact:true}).click();await p.getByRole('button',{name:'Arrive now'}).click();await p.locator('#fetch-hud').waitFor({state:'visible'});
    assert.equal(await p.evaluate(()=>testScene.cameras.main.zoom),1.22);await p.getByRole('button',{name:'Leave playtime',exact:true}).click();assert.ok(Math.abs(await p.evaluate(()=>testScene.cameras.main.zoom)-1.22*1.9)<.001);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('an offline phone opens normally, labels its sky honestly and supports a visual preview',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b,{phone:true,offline:true});assert.equal(await p.evaluate(()=>KingdomSky.status()),'offline');assert.match(await p.locator('#realm-weather').textContent(),/weather offline/);
    await p.getByRole('button',{name:'Weather and sky',exact:true}).click();await p.getByText('Weather is unavailable for now.',{exact:false}).waitFor();await shot(p,'weather-offline-phone');await p.getByRole('button',{name:'Close journal'}).click();
    await sky(p,'rain');assert.equal(await p.evaluate(()=>testScene.wet),true);await satchel(p,'Reduce animation');const time=await p.evaluate(()=>testScene.atmosphere.time);await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>testScene.atmosphere.time),time);
    await p.getByRole('button',{name:'Weather and sky',exact:true}).click();await p.getByRole('button',{name:'Follow Auckland again'}).click();await p.waitForFunction(()=>!KingdomSky.busy);assert.equal(await p.evaluate(()=>testScene.wet),false);assert.deepEqual(errors,[]);
    const earlier=await enter(b,{offline:true,cached:true});assert.equal(await earlier.p.evaluate(()=>KingdomSky.status()),'earlier');assert.match(await earlier.p.locator('#realm-weather').textContent(),/earlier/);assert.deepEqual(earlier.errors,[]);
  }finally{await b.close();}
});
