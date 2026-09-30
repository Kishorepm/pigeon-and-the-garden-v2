const {prepare,satchel}=require('./kingdom-browser-helpers.cjs');
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const url=process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html';
const out=path.join(__dirname,'../.local-review');fs.mkdirSync(out,{recursive:true});
async function enter(browser,viewport={width:390,height:844}){
  const page=await browser.newPage({viewport,isMobile:viewport.width<600,hasTouch:true,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/kingdom-world.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace("this.phase='living';","window.testScene=this;this.phase='living';")});});
  await prepare(page);await page.goto(url);await page.locator('#loading').waitFor({state:'hidden',timeout:30000});await page.getByRole('button',{name:'Enter our kingdom'}).click();await page.getByRole('button',{name:'North · the knight',exact:true}).click();return {page,errors};
}
async function home(page,name){await page.getByRole('button',{name:'Close journal'}).click();await page.getByRole('button',{name:'Open settings'}).click();await page.getByRole('button',{name:'Change home / sign out'}).click();await page.getByRole('button',{name,exact:true}).click();}

test('daily check-in is a mood choice and optional note, visible for both homes',async()=>{
  const browser=await webkit.launch({headless:true});try{
    const {page,errors}=await enter(browser);
    await page.getByRole('button',{name:'Open our daily check-in'}).click();await page.screenshot({path:path.join(out,'guild-daily-before.png')});
    await page.getByRole('radio',{name:'Good',exact:true}).check();await page.getByLabel('A little note (optional)',{exact:true}).fill('A good day, thinking of you.');await page.getByRole('button',{name:'Share my mood'}).click();
    await page.getByText('Your check-in is here.',{exact:true}).waitFor();assert.equal(await page.locator('.daily-form').count(),0);
    assert.equal(await page.evaluate(()=>KingdomUI.store.state.moods[KingdomModel.day()+':north'].energy),'');
    await home(page,'South · the princess');await page.getByRole('button',{name:'Open our daily check-in'}).click();await page.getByText('A good day, thinking of you.',{exact:true}).waitFor();
    await page.getByRole('radio',{name:'Loved',exact:true}).check();await page.getByRole('button',{name:'Share my mood'}).click();await page.getByText('Your check-in is here.',{exact:true}).waitFor();
    await page.screenshot({path:path.join(out,'guild-daily-together.png')});await page.getByRole('button',{name:'Close journal'}).click();
    assert.match(await page.locator('#daily-glance').innerText(),/Good/);assert.match(await page.locator('#daily-glance').innerText(),/Loved/);
    await page.reload();await page.locator('#loading').waitFor({state:'hidden'});await page.getByRole('button',{name:'Open our daily check-in'}).click();await page.getByRole('button',{name:'Edit',exact:true}).click();assert.equal(await page.getByRole('radio',{name:'Loved',exact:true}).isChecked(),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('guild type builder keeps places, independent ratings and earlier tastings inside a mission',async()=>{
  const browser=await webkit.launch({headless:true});try{
    const {page,errors}=await enter(browser,{width:1280,height:900});
    await page.getByRole('button',{name:'Guild hall',exact:true}).click();await page.screenshot({path:path.join(out,'guild-board-empty.png')});
    await page.getByRole('button',{name:'Create a mission'}).click();await page.screenshot({path:path.join(out,'guild-types.png')});await page.getByRole('button',{name:/Taste test Try places/}).click();
    await page.getByLabel('Mission name',{exact:true}).fill('Our iced mocha trail');await page.getByLabel('What are we trying?').selectOption('Coffee');await page.getByLabel('Different places to try').fill('2');await page.getByLabel('Any final steps — one per line').fill('');await page.getByRole('button',{name:'Preview the scroll'}).click();await page.getByRole('button',{name:'Post this mission'}).click();
    await page.getByText('Waiting for your partner to join.',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Our steps',exact:true}).count(),0);
    await home(page,'South · the princess');await page.getByRole('button',{name:'Guild hall',exact:true}).click();await page.getByRole('button',{name:'View invitation'}).click();await page.getByRole('button',{name:'I’m in',exact:true}).click();
    await page.getByRole('button',{name:'Add a tasting',exact:true}).click();await page.getByLabel('Place name',{exact:true}).fill('The Corner Café');await page.getByLabel('Area or branch (optional)').fill('Town centre');await page.getByLabel('What did you try?').fill('Iced mocha');await page.getByLabel('Your score / 10 (optional)').fill('8.5');await page.getByRole('button',{name:'Save this tasting'}).click();
    await page.getByRole('heading',{name:'The Corner Café',exact:true}).waitFor();await page.getByText('Bring an earlier tasting into this quest',{exact:true}).click();await page.getByRole('button',{name:'Link this tasting'}).click();await page.getByRole('heading',{name:'Starbucks · Sylvia Park',exact:true}).waitFor();
    await home(page,'North · the knight');await page.getByRole('button',{name:'Guild hall',exact:true}).click();await page.getByRole('button',{name:'Open mission',exact:true}).click();
    const cafe=page.locator('.tasting-entry').filter({has:page.getByRole('heading',{name:'The Corner Café',exact:true})});await cafe.getByRole('button',{name:'Give your rating'}).click();await page.getByLabel('Your score / 10',{exact:true}).fill('7.5');await page.getByRole('button',{name:'Save my opinion'}).click();await page.getByText('Together: 8.0 / 10',{exact:true}).waitFor();
    assert.equal(await page.locator('#book').getAttribute('data-page'),'mission');await page.screenshot({path:path.join(out,'guild-tasting-mission.png')});
    await page.getByRole('button',{name:'Mission board',exact:false}).click();await page.screenshot({path:path.join(out,'guild-board-desktop.png')});
    await page.getByRole('button',{name:'Close journal'}).click();await satchel(page,'Show kingdom map');await page.getByRole('button',{name:/The guild hall Missions/}).click();await page.getByRole('button',{name:'Close journal'}).click();await page.waitForTimeout(800);await page.screenshot({path:path.join(out,'guild-world.png')});
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
