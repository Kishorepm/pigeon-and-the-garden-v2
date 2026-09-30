const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {prepare,satchel}=require('./kingdom-browser-helpers.cjs');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html',out=path.join(__dirname,'../.local-review');
async function enter(b,{width=390,height=844,tour=false}={}){
  const p=await b.newPage({viewport:{width,height},isMobile:width<600,hasTouch:true,reducedMotion:'reduce'}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));if(!tour)await prepare(p);
  await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){if(this.width*this.height>16777216)throw Error('Canvas exceeds iPhone pixel budget');return get.apply(this,args);};});
  await p.route('**/kingdom-world.js',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await p.goto(url);await p.locator('#loading').waitFor({state:'hidden',timeout:45000});await p.locator('#enter').click();await p.getByRole('button',{name:'North · the knight',exact:true}).click();return {p,errors};
}
test('the character introduces the real world, starts a guild visit, and respects skip and replay',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b,{tour:true});await p.locator('#character-intro').waitFor({state:'visible'});
    await p.locator('#intro-portrait .is-ready').waitFor();assert.match(await p.locator('#intro-copy').textContent(),/Three dates/);assert.equal(await p.locator('#toast').isHidden(),true,'the entry status must not obscure the introduction');
    await p.locator('#intro-next').click();assert.match(await p.locator('#intro-copy').textContent(),/Release to stop/);
    const before=await p.evaluate(()=>testScene.active.x);await p.keyboard.down('d');await p.waitForFunction(x=>testScene.active.x>x+10,before);await p.keyboard.up('d');
    await p.locator('#intro-next').click();await p.locator('#intro-next').click();await p.waitForFunction(()=>testScene.interiors.active&&testScene.interiors.id==='inn');await p.getByRole('button',{name:'Guild hall',exact:true}).click();await p.getByRole('heading',{name:'The guild hall.'}).waitFor();assert.equal(await p.locator('#character-intro').isHidden(),true);
    await p.locator('#book-close').click();await p.reload();await p.locator('#loading').waitFor({state:'hidden'});assert.equal(await p.locator('#character-intro').isHidden(),true);
    await satchel(p,'Meet your character');assert.equal(await p.locator('#character-intro').isVisible(),true);await p.locator('#intro-skip').click();
    await p.locator('#settings-open').click();await p.getByRole('button',{name:'Change home / sign out'}).click();await p.getByRole('button',{name:'South · the princess',exact:true}).click();await p.locator('#intro-portrait .is-ready').waitFor();assert.match(await p.locator('#intro-copy').textContent(),/Ruby/);await p.locator('#intro-skip').click();
    assert.deepEqual(errors,[]);
  }finally{await b.close();}
});
test('phone tools stay in the satchel, movement pauses in it, and nearby actions only appear in context',async()=>{
  const b=await webkit.launch();try{
    const {p,errors}=await enter(b);assert.equal(await p.locator('#walk-pad').isHidden(),true);assert.equal(await p.locator('.camera-tools').isHidden(),true);
    await p.evaluate(()=>{testScene.active.setPosition(448,855);testScene.frameParty(true);});await p.waitForFunction(()=>document.querySelector('.interaction-control').hidden);assert.equal(await p.locator('#interact').isHidden(),true);
    await p.locator('#menu-open').click();const before=await p.evaluate(()=>[testScene.active.x,testScene.active.y]);await p.keyboard.down('d');await p.waitForTimeout(180);await p.keyboard.up('d');assert.deepEqual(await p.evaluate(()=>[testScene.active.x,testScene.active.y]),before);
    await p.getByRole('button',{name:'Zoom in world',exact:true}).click();assert.equal(await p.locator('#zoom-reset').textContent(),'110%');await p.keyboard.press('Escape');assert.equal(await p.locator('#explorer').isHidden(),true);assert.equal(await p.locator('#menu-open').getAttribute('aria-expanded'),'false');
    await p.evaluate(()=>{testScene.active.setPosition(926,744);testScene.frameParty(true);});await p.getByRole('button',{name:'Enter the guild · The guild hall',exact:true}).waitFor();await p.getByRole('button',{name:'Enter the guild · The guild hall',exact:true}).click();await p.waitForFunction(()=>testScene.interiors.active);await p.getByRole('button',{name:'Guild hall',exact:true}).click();await p.getByRole('button',{name:'Create a mission',exact:true}).waitFor();await p.locator('#book-close').click();await p.locator('#room-exit').click();
    await p.evaluate(()=>{testScene.active.setPosition(350,-35);testScene.frameParty(true);});await p.waitForTimeout(400);await p.screenshot({path:path.join(out,'experience-north-phone.png')});
    await satchel(p,'Show kingdom map');await p.getByRole('button',{name:/South Her home/}).click();await p.waitForFunction(()=>testScene.interiors.active&&testScene.interiors.id==='south');await p.waitForTimeout(400);await p.screenshot({path:path.join(out,'experience-south-phone.png')});
    assert.deepEqual(errors,[]);
  }finally{await b.close();}
});
