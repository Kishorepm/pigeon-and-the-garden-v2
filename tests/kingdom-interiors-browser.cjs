const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {prepare,satchel}=require('./kingdom-browser-helpers.cjs');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html',out=path.join(__dirname,'../.local-review');
async function enter(b,{phone=false,who='north',motion='reduce'}={}){
  const p=await b.newPage({viewport:phone?{width:390,height:844}:{width:1280,height:900},isMobile:phone,hasTouch:true,reducedMotion:motion}),errors=[];p.on('pageerror',e=>errors.push(e.message));await prepare(p);
  await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){if(this.width*this.height>16777216)throw Error('Canvas exceeds iPhone pixel budget');return get.apply(this,args);};});
  await p.route('**/kingdom-world.js',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await p.goto(url);await p.locator('#loading').waitFor({state:'hidden',timeout:45000});await p.locator('#enter').click();await p.getByRole('button',{name:who==='north'?'North · the knight':'South · the princess',exact:true}).click();await p.waitForFunction(who=>testScene.canWalk()&&testScene.controls.nearbyId===who,who);return {p,errors};
}
async function guide(p,name){await p.getByRole('button',{name:'Things to do in this room'}).click();await p.locator('#book-content').getByRole('button',{name,exact:false}).click();}
async function tapObject(p,id){const pt=await p.evaluate(id=>{const s=testScene,r=s.interiors,st=r.room.stations.find(st=>st.id===id),[x,y]=r.hit(st),c=s.cameras.main;return {x:c.width/2+(x-c.midPoint.x)*c.zoom,y:c.height/2+(y-c.midPoint.y)*c.zoom};},id);await p.touchscreen.tap(pt.x,pt.y);}

test('North enters a walkable room, writes a real letter, and restores outdoor state on exit',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b,{motion:'no-preference'});await p.keyboard.press('e');await p.waitForFunction(()=>testScene.interiors.active);await p.locator('#room-hud').waitFor({state:'visible'});
    assert.equal(await p.evaluate(()=>testScene.interiors.id),'north');assert.equal(await p.locator('#book').getAttribute('open'),null);
    await p.keyboard.down('d');await p.waitForFunction(()=>testScene.active.x>20);await p.keyboard.up('d');const stop=await p.evaluate(()=>[testScene.active.x,testScene.active.y]);await p.waitForTimeout(150);assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),stop);
    await p.evaluate(()=>{testScene.active.setPosition(104,-7);testScene.frameParty(true);});await p.keyboard.down('w');await p.waitForTimeout(650);await p.keyboard.up('w');assert.ok(await p.evaluate(()=>testScene.active.y>=-19));
    await guide(p,'The writing desk');await p.getByRole('heading',{name:'A note for your person.'}).waitFor();await p.getByLabel('On the envelope').fill('A word from the cottage');await p.getByLabel('Your letter').fill('I made you a cosy corner.');
    const atDesk=await p.evaluate(()=>[testScene.active.x,testScene.active.y]);await p.getByLabel('Your letter').press('End');await p.keyboard.type(' wasd');assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),atDesk);
    await p.getByRole('button',{name:'Send with the pigeon'}).click();await p.getByRole('heading',{name:'A familiar pair of wings.'}).waitFor();await p.locator('#book-close').click();
    assert.equal(await p.evaluate(()=>testScene.homeDetails.south.flag.visible),false,'exterior flags stay hidden while inside');assert.equal(await p.evaluate(()=>testScene.life.sprites.garden.visible),false);
    await p.getByRole('button',{name:'Leave room',exact:true}).click();await p.waitForFunction(()=>!testScene.interiors.active);
    assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),[350,-35]);assert.equal(await p.evaluate(()=>testScene.homeDetails.south.flag.visible),true);assert.equal(await p.evaluate(()=>testScene.life.sprites.garden.visible),false);
    assert.ok(await p.evaluate(()=>testScene.navigation.walkable(624,552)));assert.ok(Math.abs(await p.evaluate(()=>testScene.cameras.main.zoom)-1.75)<.001);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('South has her household, a usable mirror, touch walking, pinch and small-screen room controls',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b,{phone:true,who:'south'});await p.keyboard.press('e');await p.waitForFunction(()=>testScene.interiors.active);assert.equal(await p.evaluate(()=>testScene.interiors.petSprites.length),3);
    await tapObject(p,'mirror');await p.getByRole('heading',{name:'Us, today.'}).waitFor();await p.getByRole('radio',{name:'Loved',exact:true}).check();await p.getByRole('button',{name:'Share my mood'}).click();await p.getByText('Your check-in is here.',{exact:true}).waitFor();await p.locator('#book-close').click();
    await p.evaluate(()=>{testScene.active.setPosition(0,80);testScene.frameParty(true);});const before=await p.evaluate(()=>testScene.active.x);
    await p.evaluate(()=>{const c=testScene.game.canvas,fire=(type,x)=>c.dispatchEvent(new PointerEvent(type,{pointerId:42,pointerType:'touch',clientX:x,clientY:550,bubbles:true,cancelable:true}));fire('pointerdown',120);fire('pointermove',150);});await p.waitForFunction(x=>testScene.active.x>x+12,before);await p.evaluate(()=>testScene.game.canvas.dispatchEvent(new PointerEvent('pointerup',{pointerId:42,pointerType:'touch',clientX:150,clientY:550,bubbles:true})));
    const stopped=await p.evaluate(()=>[testScene.active.x,testScene.active.y]);await p.waitForTimeout(180);assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),stopped);
    const lit=await p.evaluate(()=>testScene.interiors.fireLit);await p.evaluate(()=>{const c=testScene.game.canvas,fire=(type,id,x)=>c.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:x,clientY:420,bubbles:true,cancelable:true}));fire('pointerdown',51,130);testScene.worldAction(()=>testScene.interiors.use(testScene.interiors.room.stations[0]));fire('pointerdown',52,240);fire('pointermove',52,295);fire('pointerup',51,130);fire('pointerup',52,295);});assert.equal(await p.evaluate(()=>testScene.interiors.fireLit),lit);assert.equal(await p.evaluate(()=>testScene.view.factor),1.5);
    await satchel(p,/Reset world zoom/);await p.waitForTimeout(350);await p.screenshot({path:path.join(out,'interior-south-playable.png')});
    for(const size of [{width:320,height:740},{width:320,height:568},{width:844,height:390},{width:390,height:844}]){await p.setViewportSize(size);await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.getByRole('button',{name:'Leave room',exact:true}).isVisible(),true);assert.ok(await p.evaluate(()=>testScene.cameras.main.zoom>0));const dock=await p.locator('.bottom-dock').boundingBox();assert.ok(dock.y+dock.height<=size.height,'navigation remains inside the viewport');await p.screenshot({path:path.join(out,`interior-room-${size.width}-${size.height}.png`)});}
    await p.getByRole('button',{name:'Leave room',exact:true}).click();assert.equal(await p.evaluate(()=>testScene.interiors.active),false);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('the cottage drink and fireside seat are playable without altering relationship progress',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b,{phone:true});await p.keyboard.press('e');const state=await p.evaluate(()=>JSON.stringify(KingdomUI.store.state));
    await guide(p,'The fireside seat');await p.waitForFunction(()=>testScene.interiors.seated);assert.equal(await p.evaluate(()=>testScene.active.shadow.visible),false);assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),[-86,66]);await p.waitForTimeout(180);await p.screenshot({path:path.join(out,'interior-fireside-seat.png')});
    await p.keyboard.down('s');await p.waitForFunction(()=>!testScene.interiors.seated);await p.keyboard.up('s');assert.equal(await p.evaluate(()=>testScene.active.shadow.visible),true);
    await guide(p,'The little drinks corner');await p.locator('#brew-hud').waitFor({state:'visible'});const pour=p.getByRole('button',{name:'Hold to pour',exact:true}),box=await pour.boundingBox();
    await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForFunction(()=>testScene.interiors.pourTime>2.05);await p.mouse.up();await p.getByRole('heading',{name:'Just right',exact:true}).waitFor();assert.equal(await p.locator('#brew-again').isVisible(),true);await p.screenshot({path:path.join(out,'interior-mocha-game.png')});
    await p.getByRole('button',{name:'Make another',exact:true}).click();await p.mouse.down();await p.waitForTimeout(180);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));const level=await p.evaluate(()=>testScene.interiors.pourTime);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>testScene.interiors.pourTime),level);await p.mouse.up();
    await p.getByRole('button',{name:'Back to the room'}).click();assert.equal(await p.evaluate(()=>JSON.stringify(KingdomUI.store.state)),state);
    await guide(p,'The hearth');assert.equal(await p.evaluate(()=>testScene.interiors.fireLit),false);await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>testScene.interiors.active),false);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('guild stations open the right journals, castle placements stay accurate and pet play returns outside',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b,{phone:true});await satchel(p,'Show kingdom map');await p.getByRole('button',{name:/The guild hall Missions/}).click();await p.waitForFunction(()=>testScene.interiors.id==='inn'&&testScene.interiors.active);
    await tapObject(p,'board');await p.getByRole('button',{name:'Create a mission',exact:true}).waitFor();await p.locator('#book-close').click();await guide(p,'The tasting counter');await p.getByRole('heading',{name:'Our tasting book.'}).waitFor();await p.getByRole('heading',{name:'Starbucks · Sylvia Park',exact:true}).waitFor();await p.locator('#book-close').click();
    await satchel(p,'Show kingdom map');await p.getByRole('button',{name:/Our castle A home/}).click();await p.waitForFunction(()=>testScene.interiors.id==='castle'&&testScene.interiors.active);
    await guide(p,'The crown & lantern');const crown=p.locator('form[data-id="crown"]');await crown.getByLabel('Display it at').selectOption('north');await crown.getByRole('button',{name:'Place keepsake'}).click();await p.locator('#book-close').click();assert.equal(await p.evaluate(()=>testScene.interiors.keepsakeDisplay.crown.visible),false);assert.equal(await p.evaluate(()=>testScene.interiors.keepsakeDisplay.lantern.visible),true);
    await p.getByRole('button',{name:'Weather and sky',exact:true}).click();await p.locator('.sky-preview summary').click();await p.getByLabel('Choose a sky',{exact:true}).selectOption('rain');await p.getByRole('button',{name:'Preview this sky'}).click();assert.equal(await p.evaluate(()=>testScene.atmosphere.air.visible),false);await p.screenshot({path:path.join(out,'interior-great-hall.png')});
    await satchel(p,'Journal');await p.getByRole('button',{name:/Ruby’s meadow A ball/}).click();await p.getByRole('button',{name:'Let’s play fetch',exact:true}).click();await p.locator('#fetch-hud').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>testScene.interiors.active),false);await p.getByRole('button',{name:'Leave playtime',exact:true}).click();
    await satchel(p,'My home');await p.waitForFunction(()=>testScene.interiors.id==='north'&&testScene.interiors.active);assert.equal(await p.evaluate(()=>testScene.interiors.keepsakeDisplay.crown.visible),true);await p.getByRole('button',{name:'Open settings'}).click();await p.getByRole('button',{name:'Change home / sign out'}).click();assert.equal(await p.evaluate(()=>testScene.interiors.active),false);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});
