const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html',out=path.join(__dirname,'../.local-review');
async function enter(b,{gentle=true,width=390,height=844}={}){
  const p=await b.newPage({viewport:{width,height},isMobile:width<600,hasTouch:true,reducedMotion:gentle?'reduce':'no-preference'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/kingdom-world.js',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await p.goto(url);await p.locator('#loading').waitFor({state:'hidden',timeout:30000});await p.getByRole('button',{name:'Enter our kingdom'}).click();await p.getByRole('button',{name:'North · the knight',exact:true}).click();return {p,errors};
}
async function journal(p,entry){if(await p.locator('#book').getAttribute('open')!==null)await p.getByRole('button',{name:'Close journal'}).click();await p.getByRole('button',{name:'Journal',exact:true}).click();await p.getByRole('button',{name:entry}).click();}
async function home(p,name){await p.getByRole('button',{name:'Close journal'}).click();await p.getByRole('button',{name:'Open settings'}).click();await p.getByRole('button',{name:'Change home / sign out'}).click();await p.getByRole('button',{name,exact:true}).click();}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png')});}

test('restoration, two-person memory flowers and comfort persist without inflating progression',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b);
    await journal(p,/Our growing castle Restore/);await shot(p,'life-castle-phone');
    assert.ok((await p.locator('.story-vista svg').boundingBox()).width>250);
    await p.getByRole('button',{name:'Restore our garden',exact:true}).click();await p.waitForFunction(()=>testScene.life.sprites.garden.visible);await shot(p,'life-garden-world-phone');
    await journal(p,/The memory garden Plant/);await p.getByLabel('Which chapter?').selectOption('date1');await p.getByRole('radio',{name:'Bluebell',exact:true}).check();await p.getByLabel('Your little memory (optional)').fill('The dark-green debate.');
    // An unsuccessful write keeps the whole draft and never announces success.
    await p.evaluate(()=>{window.originalSend=KingdomUI.store.send;KingdomUI.store.send=async()=>{throw Error('Could not save this memory. Please retry.');};});
    await p.getByRole('button',{name:/Plant this memory/}).click();await p.getByText('Could not save this memory. Please retry.',{exact:true}).waitFor();assert.equal(await p.getByLabel('Your little memory (optional)').inputValue(),'The dark-green debate.');
    await p.evaluate(()=>KingdomUI.store.send=window.originalSend);await p.getByRole('button',{name:/Plant this memory/}).click();await p.locator('blockquote').getByText('The dark-green debate.',{exact:true}).waitFor();
    await home(p,'South · the princess');await journal(p,/The memory garden Plant/);await p.getByText('Leave your memory',{exact:true}).click();await p.getByLabel('What do you remember?').fill('Your flowers and the walk.');await p.getByRole('button',{name:/Keep my words/}).click();await p.getByText('IN BLOOM',{exact:true}).waitFor();await shot(p,'life-memory-garden-phone');
    await p.getByRole('button',{name:'Close journal'}).click();await p.getByRole('button',{name:'Us today',exact:true}).click();await p.getByRole('radio',{name:'Tired',exact:true}).check();await p.getByRole('button',{name:'Share my mood'}).click();
    await home(p,'North · the knight');await p.getByRole('button',{name:'Us today',exact:true}).click();await p.getByRole('radio',{name:'Good',exact:true}).check();await p.getByRole('button',{name:'Share my mood'}).click();await p.getByRole('button',{name:'Bring flowers',exact:true}).click();assert.equal(await p.getByRole('button',{name:/Bring flowers/}).getAttribute('aria-pressed'),'true');
    await p.getByRole('button',{name:'Give you quiet',exact:true}).click();assert.equal(await p.evaluate(()=>KingdomModel.life(KingdomUI.store.state).responses.length),1);await shot(p,'life-comfort-sent-phone');
    await home(p,'South · the princess');await p.getByRole('button',{name:'Us today',exact:true}).click();await p.getByText('Take your time. No reply needed.',{exact:true}).waitFor();await shot(p,'life-comfort-received-phone');
    await p.reload();await p.locator('#loading').waitFor({state:'hidden'});await p.getByRole('button',{name:'Us today',exact:true}).click();await p.getByText('Take your time. No reply needed.',{exact:true}).waitFor();
    assert.deepEqual(await p.evaluate(()=>{const s=KingdomUI.store.state,l=KingdomModel.life(s);return {count:KingdomModel.story(s).count,notes:l.flowers[0].notes,build:!!l.builds.garden};}),{count:3,notes:{north:'The dark-green debate.',south:'Your flowers and the walk.'},build:true});
    await p.setViewportSize({width:320,height:740});assert.equal(await p.evaluate(()=>document.querySelector('#book-content').scrollWidth>document.querySelector('#book-content').clientWidth),false);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('Ruby plays in the world with controls, pauses while reading, saves once, and cleans up on leaving',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b,{gentle:false,width:1280,height:900});
    await journal(p,/Ruby’s meadow A ball/);await p.waitForFunction(()=>{const i=new Image();i.src='game-art/pets/dogs.png';return i.complete&&i.naturalWidth>0;});await shot(p,'life-ruby-intro-desktop');
    await p.getByRole('button',{name:'Let’s play fetch',exact:true}).click();await p.getByRole('button',{name:'Arrive now'}).click();await p.locator('#fetch-hud').waitFor({state:'visible'});
    await p.keyboard.down('d');await p.waitForFunction(()=>testScene.active.x>429);await p.keyboard.up('d');assert.ok(await p.evaluate(()=>testScene.life.game));
    await p.keyboard.press('e');await p.waitForFunction(()=>testScene.life.game.phase!=='ready');assert.equal(await p.locator('#interact').isDisabled(),true);
    await p.getByRole('button',{name:'Journal',exact:true}).click();const paused=await p.evaluate(()=>testScene.life.game.time);await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>testScene.life.game.time),paused);await p.getByRole('button',{name:'Close journal'}).click();
    await p.waitForFunction(()=>testScene.life.game?.phase==='ready',{},{timeout:15000});await shot(p,'life-ruby-meadow-desktop');
    const target=await p.evaluate(()=>{const r=KingdomFetch.ring(testScene.life.game),c=testScene.cameras.main;return {x:c.width/2+(r.x-c.midPoint.x)*c.zoom,y:c.height/2+(r.y-c.midPoint.y)*c.zoom};});await p.mouse.click(target.x,target.y);await p.waitForFunction(()=>testScene.life.game?.round===2&&testScene.life.game.phase==='ready',{},{timeout:15000});
    await p.getByRole('button',{name:/Throw ball ·/}).click();await p.getByRole('button',{name:'Keep Ruby’s rosette',exact:true}).waitFor({timeout:15000});await shot(p,'life-ruby-result-desktop');await p.getByRole('button',{name:'Keep Ruby’s rosette',exact:true}).click();
    assert.equal(await p.evaluate(()=>KingdomModel.life(KingdomUI.store.state).ruby.north.plays),1);assert.equal(await p.evaluate(()=>testScene.life.rosette.visible),true);assert.equal(await p.locator('#fetch-hud').isVisible(),false);
    await p.reload();await p.locator('#loading').waitFor({state:'hidden'});await journal(p,/Ruby’s meadow A ball/);await p.getByText(/Ruby’s playmate · 1 playtime kept/).waitFor();
    await p.getByRole('button',{name:'Let’s play fetch',exact:true}).click();await p.getByRole('button',{name:'Arrive now'}).click();await p.locator('#fetch-hud').waitFor({state:'visible'});await p.getByRole('button',{name:'Leave playtime',exact:true}).click();
    assert.equal(await p.evaluate(()=>testScene.life.game),null);assert.equal(await p.evaluate(()=>testScene.ruby.x),215);assert.equal(await p.evaluate(()=>KingdomModel.life(KingdomUI.store.state).ruby.north.plays),1);assert.deepEqual(errors,[]);
  }finally{await b.close();}
});

test('gentle phone play supports three throws and every castle addition renders',async()=>{
  const b=await webkit.launch({headless:true});try{
    const {p,errors}=await enter(b);
    await journal(p,/Ruby’s meadow A ball/);await p.waitForTimeout(300);await shot(p,'life-ruby-intro-phone');
    await p.getByRole('button',{name:'Let’s play fetch',exact:true}).click();await p.locator('#fetch-hud').waitFor({state:'visible'});
    await shot(p,'life-ruby-meadow-phone');const ring=await p.evaluate(()=>KingdomFetch.ring(testScene.life.game));await p.waitForTimeout(300);assert.deepEqual(await p.evaluate(()=>KingdomFetch.ring(testScene.life.game)),ring);
    await p.setViewportSize({width:320,height:740});await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await shot(p,'life-ruby-small-phone');
    await p.setViewportSize({width:844,height:390});await p.waitForTimeout(500);await shot(p,'life-ruby-landscape');await p.setViewportSize({width:390,height:844});
    for(let i=0;i<3;i++){await p.getByRole('button',{name:/Throw ball ·/}).click();if(i<2)await p.waitForFunction(n=>testScene.life.game?.round===n&&testScene.life.game.phase==='ready',i+1,{timeout:15000});}
    await p.getByRole('button',{name:'Keep Ruby’s rosette',exact:true}).waitFor({timeout:15000});assert.equal(await p.evaluate(()=>KingdomUI.rubyResult.accurate),3);await p.getByRole('button',{name:'Keep Ruby’s rosette',exact:true}).click();
    // Seed completed test adventures through validated commands to inspect later artwork.
    await p.evaluate(async()=>{for(let i=0;i<5;i++){const id=await KingdomUI.store.send('mission',{title:'Test adventure '+i,who:'me',kind:'custom',target:0,steps:['A lovely day'],confirm:false});await KingdomUI.store.send('step',{id,index:0,done:true});await KingdomUI.store.send('complete',{id});}});
    for(const name of ['Restore our garden','Restore the balcony','Restore the story tower']){await journal(p,/Our growing castle Restore/);await p.getByRole('button',{name,exact:true}).click();}
    await p.waitForFunction(()=>Object.values(testScene.life.sprites).every(s=>s.visible));await p.setViewportSize({width:1280,height:900});await p.evaluate(()=>{testScene.life.revealTime=8;testScene.cameraPoint.x=350;testScene.cameraPoint.y=380;testScene.cameras.main.centerOn(350,380);});await p.waitForTimeout(250);await shot(p,'life-castle-restored-desktop');
    await journal(p,/Our growing castle Restore/);await shot(p,'life-castle-complete-desktop');assert.deepEqual(errors,[]);
  }finally{await b.close();}
});
