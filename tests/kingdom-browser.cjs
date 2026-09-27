const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html';
const out=path.join(__dirname,'../.local-review');fs.mkdirSync(out,{recursive:true});

test('living kingdom loads within the iPhone canvas budget and saves independent opinions',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:3});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(...args){if(this.width*this.height>16777216)throw Error('iPhone canvas budget exceeded');return original.apply(this,args);};
    });
    await page.goto(url);await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
    await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'kingdom-mobile-welcome.png')});
    await page.getByRole('button',{name:'Enter our kingdom'}).click();
    await page.getByRole('button',{name:'North · the knight',exact:true}).click();
    await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'kingdom-mobile-north.png')});
    await page.getByRole('button',{name:'Reduce animation',exact:true}).click();
    await page.getByRole('button',{name:'Journal',exact:true}).click();
    await page.getByRole('button',{name:'The little inn',exact:false}).click();
    await page.getByRole('button',{name:'Give your rating'}).click();
    await page.getByLabel('Your score / 10').fill('8');
    await page.getByLabel('What did you think?').fill('Chocolatey, worth another visit.');
    await page.getByRole('button',{name:'Save my opinion'}).click();
    await page.getByText('Waiting for both opinions.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Close journal',exact:true}).click();
    await page.getByRole('button',{name:'Open settings',exact:true}).click();
    await page.getByRole('button',{name:'Change home / sign out'}).click();
    await page.getByRole('button',{name:'South · the princess',exact:true}).click();
    await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'kingdom-mobile-south.png')});
    await page.getByRole('button',{name:'Journal',exact:true}).click();
    await page.getByRole('button',{name:'The little inn',exact:false}).click();
    await page.getByRole('button',{name:'Give your rating'}).click();
    await page.getByLabel('Your score / 10').fill('7.5');
    await page.getByRole('button',{name:'Save my opinion'}).click();
    await page.getByText('Together: 7.8 / 10',{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'kingdom-mobile-tastings.png')});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.reload();await page.locator('#loading').waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>KingdomUI.store.state.visits[0].ratings.north),8);
    assert.equal(await page.evaluate(()=>KingdomUI.store.state.visits[0].ratings.south),7.5);
    assert.deepEqual(errors,[]);
    await page.setViewportSize({width:1440,height:1000});
    await page.getByRole('button',{name:'Show kingdom map'}).click();await page.getByRole('button',{name:'Close journal'}).click();
    await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'kingdom-map.png')});
    assert.equal(await page.locator('#world canvas').evaluate(c=>c.width),1440);
    assert.ok(await page.locator('#world canvas').evaluate(c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data,colors=new Set();for(let i=0;i<data.length;i+=1600)colors.add(data[i]+','+data[i+1]+','+data[i+2]);return colors.size>30;}),'the resized map contains scenery, not only the background');
  }finally{await browser.close();}
});

test('narrow-screen walking advances the layered character and can be skipped',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:320,height:740},isMobile:true,reducedMotion:'no-preference'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/kingdom-world.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
    await page.goto(url);await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
    await page.getByRole('button',{name:'Enter our kingdom'}).click();await page.getByRole('button',{name:'North · the knight',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Enable ambient sound'}).getAttribute('aria-pressed'),'false');
    await page.getByRole('button',{name:'Show kingdom map'}).click();await page.getByRole('button',{name:/The little inn Coffee/}).click();
    await page.waitForFunction(()=>window.testScene.walkDistance>15);
    assert.ok(await page.evaluate(()=>{const p=window.testScene.active;return p.parts.length>1&&p.parts.every(x=>x.frame.name===p.parts[0].frame.name)&&p.x>350;}));
    await page.getByRole('button',{name:'Arrive now'}).click();await page.getByRole('heading',{name:'An excellent excuse for a detour.'}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.getByRole('button',{name:'Close journal'}).click();
    const supportsAudio=await page.evaluate(()=>!!(window.AudioContext||window.webkitAudioContext));await page.getByRole('button',{name:'Enable ambient sound'}).click();
    if(supportsAudio){assert.equal(await page.getByRole('button',{name:'Mute ambient sound'}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Mute ambient sound'}).click();}
    else{assert.equal(await page.getByRole('button',{name:'Ambient sound unavailable'}).isDisabled(),true);await page.getByText('This browser does not support ambient sound.',{exact:true}).waitFor();}
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('custom mission survives editing, requires acceptance and records a partner award',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
    await page.getByRole('button',{name:'Enter our kingdom'}).click();await page.getByRole('button',{name:'North · the knight',exact:true}).click();
    await page.getByRole('button',{name:'Missions',exact:true}).click();await page.getByRole('button',{name:'Create a mission',exact:true}).click();
    await page.getByLabel('Mission name', {exact:true}).fill('A park picnic <3');
    await page.getByLabel('The idea',{exact:true}).fill('A relaxed walk and something delicious.');
    await page.getByLabel('Steps — one per line').fill('Pack a picnic\nTake a little walk');
    await page.getByText('Rules & little details',{exact:true}).click();
    await page.getByLabel('Each participant adds a completion note').check();
    await page.getByLabel('Target date (optional)').fill('2099-01-01');
    await page.getByRole('combobox',{name:/Tradition/}).selectOption('monthly');
    await page.getByRole('button',{name:'Preview the scroll'}).click();
    await page.getByRole('button',{name:'Back to edit'}).click();
    await page.getByText('Rules & little details',{exact:true}).click();
    assert.equal(await page.getByLabel('Each participant adds a completion note').isChecked(),true);
    assert.equal(await page.getByRole('combobox',{name:/Tradition/}).inputValue(),'monthly');
    assert.equal(await page.getByLabel('Target date (optional)').inputValue(),'2099-01-01');
    await page.getByRole('button',{name:'Preview the scroll'}).click();await page.getByRole('button',{name:'Post this mission'}).click();
    const switchHome=async(home)=>{await page.getByRole('button',{name:'Close journal',exact:true}).click();await page.getByRole('button',{name:'Open settings'}).click();await page.getByRole('button',{name:'Change home / sign out'}).click();await page.getByRole('button',{name:home,exact:true}).click();await page.getByRole('button',{name:'Missions',exact:true}).click();await page.getByRole('button',{name:'Open mission',exact:true}).click();};
    await switchHome('South · the princess');await page.getByRole('button',{name:'I’m in',exact:true}).click();
    await page.getByLabel('Pack a picnic', {exact:true}).check();await page.getByLabel('Take a little walk',{exact:true}).check();
    assert.equal(await page.getByRole('button',{name:'Send for confirmation'}).isDisabled(),true);
    await page.getByLabel('Your completion note',{exact:true}).fill('I packed the picnic.');await page.getByRole('button',{name:'Save my note'}).click();
    await switchHome('North · the knight');await page.getByLabel('Your completion note',{exact:true}).fill('A lovely afternoon together.');await page.getByRole('button',{name:'Save my note'}).click();
    await page.getByRole('button',{name:'Send for confirmation'}).click();await page.getByText('Waiting for your partner to confirm.',{exact:true}).waitFor();
    await switchHome('South · the princess');await page.getByRole('button',{name:'Confirm our adventure'}).click();
    await page.getByRole('button',{name:'Acknowledge their part'}).click();await page.getByLabel('Tokens (1–50)').fill('8');await page.getByLabel('What did you appreciate?').fill('You planned such a thoughtful picnic.');await page.getByRole('button',{name:'Record the award'}).click();
    await page.getByText('8 tokens in our shared ledger',{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'kingdom-ledger.png')});
    await page.getByRole('button',{name:'Close journal'}).click();await page.getByRole('button',{name:'Show kingdom map'}).click();await page.getByRole('button',{name:'Close journal'}).click();
    await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,'kingdom-desktop-map.png')});
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
