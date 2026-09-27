const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html';
const out=path.join(__dirname,'../.local-review');fs.mkdirSync(out,{recursive:true});
async function enter(browser,options={}){
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'no-preference',...options}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/kingdom-world.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await page.goto(url);await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
  await page.getByRole('button',{name:'Enter our kingdom'}).click();await page.getByRole('button',{name:'North · the knight',exact:true}).click();
  await page.locator('#movement-controls').waitFor({state:'visible'});return {page,errors};
}
const position=page=>page.evaluate(()=>[testScene.active.x,testScene.active.y]);

test('keyboard exploration stops on release, respects collision, interacts, and pauses for typing',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const {page,errors}=await enter(browser);
    assert.ok(await page.evaluate(()=>{testScene.controls.keys.add('KeyD');testScene.controls.keys.add('KeyS');const {x,y}=testScene.controls.sample();testScene.controls.reset();return Math.abs(Math.hypot(x,y)-1)<.001;}),'diagonal speed is normalised');
    await page.keyboard.down('d');await page.waitForFunction(()=>testScene.active.x>380);await page.keyboard.up('d');
    const stopped=await position(page);await page.waitForTimeout(250);assert.deepEqual(await position(page),stopped);
    assert.equal(await page.evaluate(()=>testScene.active.walking),false);
    await page.evaluate(()=>{testScene.active.setPosition(350,-35);testScene.frameParty(true);});
    await page.keyboard.down('w');await page.waitForTimeout(1500);await page.keyboard.up('w');
    assert.ok((await position(page))[1]>-100,'cottage wall stops the character');
    await page.evaluate(()=>{testScene.active.setPosition(350,-35);testScene.frameParty(true);});
    await page.keyboard.press('e');await page.locator('#book[open]').waitFor();
    const atHome=await position(page);await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');assert.deepEqual(await position(page),atHome);
    await page.getByRole('button',{name:'Close journal'}).click();
    await page.getByRole('button',{name:'Missions',exact:true}).click();await page.getByRole('button',{name:'Create a mission',exact:true}).click();
    await page.getByLabel('Mission name',{exact:true}).fill('We wander east');await page.getByLabel('Mission name',{exact:true}).press('End');await page.keyboard.type(' wasd');
    assert.deepEqual(await position(page),atHome);assert.match(await page.getByLabel('Mission name',{exact:true}).inputValue(),/wasd$/);
    await page.getByRole('button',{name:'Close journal'}).click();
    await page.getByRole('button',{name:'Show kingdom map'}).click();await page.getByRole('button',{name:/The little inn Coffee/}).click();
    await page.waitForFunction(()=>testScene.travel&&testScene.walkDistance>30);
    await page.keyboard.down('s');await page.waitForFunction(()=>!testScene.travel);await page.keyboard.up('s');
    assert.equal(await page.locator('#travel-note').isVisible(),false);
    await page.waitForTimeout(300);assert.equal(await page.locator('#book').getAttribute('open'),null,'map choice does not click a world object behind the closed dialog');
    await page.evaluate(()=>{testScene.active.setPosition(550,800);testScene.frameParty(true);});
    await page.keyboard.down('d');await page.waitForTimeout(600);await page.keyboard.up('d');assert.ok((await position(page))[0]<=569);
    await page.evaluate(()=>{testScene.active.setPosition(550,552);testScene.frameParty(true);});
    await page.keyboard.down('d');
    await page.waitForFunction(()=>testScene.active.x>685,{},{timeout:15000});
    await page.keyboard.up('d');
    await page.screenshot({path:path.join(out,'kingdom-controls-desktop.png')});
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('phone pad holds, drags, releases, cancels and stays clear of the journal dock',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const {page,errors}=await enter(browser,{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
    const east=await page.getByRole('button',{name:'Walk east',exact:true}).boundingBox(),south=await page.getByRole('button',{name:'Walk south',exact:true}).boundingBox();
    await page.mouse.move(east.x+east.width/2,east.y+east.height/2);await page.mouse.down();
    await page.waitForFunction(()=>testScene.active.x>380);
    await page.mouse.move(south.x+south.width/2,south.y+south.height/2);await page.waitForFunction(()=>testScene.active.y>0);await page.mouse.up();
    const stopped=await position(page);await page.waitForTimeout(250);assert.deepEqual(await position(page),stopped);
    await page.mouse.move(east.x+east.width/2,east.y+east.height/2);await page.mouse.down();await page.waitForTimeout(200);
    await page.locator('#walk-pad').dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await page.mouse.up();
    const cancelled=await position(page);await page.waitForTimeout(200);assert.deepEqual(await position(page),cancelled);
    await page.touchscreen.tap(east.x+east.width/2,east.y+east.height/2);assert.equal(await page.evaluate(()=>testScene.travel),null,'a touch on the pad does not select scenery underneath');
    const pad=await page.locator('#walk-pad').boundingBox(),dock=await page.locator('.bottom-dock').boundingBox();assert.ok(pad.y+pad.height<dock.y);
    await page.screenshot({path:path.join(out,'kingdom-controls-phone.png')});
    await page.setViewportSize({width:320,height:740});await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const smallPad=await page.locator('#walk-pad').boundingBox(),action=await page.locator('#interact').boundingBox();assert.ok(smallPad.x+smallPad.width<action.x);
    await page.screenshot({path:path.join(out,'kingdom-controls-small-phone.png')});
    await page.setViewportSize({width:844,height:390});await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),false);
    assert.ok(await page.evaluate(()=>{const s=testScene,c=s.cameras.main,p=c.worldView;return s.active.x>p.x+60&&s.active.x<p.right-60&&s.active.y>p.y+55&&s.active.y<p.bottom-50;}),'rotation keeps the character within the visible playing area');
    await page.waitForFunction(()=>{const c=document.querySelector('#world canvas'),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data,colors=new Set();for(let i=0;i<data.length;i+=400)colors.add(data[i]+','+data[i+1]+','+data[i+2]);return colors.size>30;});
    await page.screenshot({path:path.join(out,'kingdom-controls-landscape.png')});assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('actual scenery routes connect every place; ground clicks and reduced motion remain usable',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const {page,errors}=await enter(browser);
    const routes=await page.evaluate(()=>{const n=testScene.navigation,P=KingdomPaths,fail=[];for(const [a,A] of Object.entries(P.places))for(const [b,B] of Object.entries(P.places))if(!n.route(P.nodes[A.node],P.nodes[B.node]))fail.push(a+' to '+b);return fail;});
    assert.deepEqual(routes,[]);
    await page.evaluate(()=>{testScene.active.setPosition(440,855);testScene.frameParty(true);});await page.waitForTimeout(200);
    const target=await page.evaluate(()=>{const cam=testScene.cameras.main;return {x:cam.width/2+(480-cam.midPoint.x)*cam.zoom,y:cam.height/2+(855-cam.midPoint.y)*cam.zoom};});
    await page.mouse.click(target.x,target.y);await page.waitForFunction(()=>testScene.travel?.destination===null);await page.waitForFunction(()=>!testScene.travel);
    const arrived=await position(page);assert.ok(Math.abs(arrived[0]-480)<3);assert.equal(await page.locator('#book').getAttribute('open'),null);
    await page.getByRole('button',{name:'Reduce animation',exact:true}).click();
    const before=await position(page);await page.keyboard.down('s');await page.waitForFunction(y=>testScene.active.y>y+15,before[1]);await page.keyboard.up('s');
    assert.equal(await page.evaluate(()=>testScene.active.parts[0].frame.name%13),0,'reduced motion uses still sprite');
    await page.getByRole('button',{name:'Show kingdom map'}).click();await page.getByRole('button',{name:/The workshop The keeper/}).click();await page.locator('#book[open]').waitFor();
    assert.deepEqual(await position(page),[1040,855]);assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
