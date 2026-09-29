const {test}=require('node:test');
const assert=require('node:assert/strict');
require('node:fs').mkdirSync(require('node:path').join(__dirname,'../.local-review'),{recursive:true});
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=new URL(process.env.PREVIEW_URL||'http://localhost:8124/kingdom.html').origin;
async function stage(page){
  await page.goto(origin+'/kingdom-panels.css');
  await page.setContent(`<base href="${origin}/"><link rel="stylesheet" href="fonts/pixelify.css"><link rel="stylesheet" href="kingdom.css"><link rel="stylesheet" href="kingdom-panels.css"><script src="kingdom-model.js"></script><script src="kingdom-panels.js"></script><div id="portrait" style="margin:30px;padding:20px;background:#f3edd8"></div>`);
  await page.evaluate(()=>{const el=document.querySelector('#portrait');el.innerHTML=KingdomPanels.personDay(KingdomModel.initial(),'south','north');KingdomPanels.renderPortraits(el);});
}
test('portrait never exposes a base sprite while clothing is delayed or unavailable',async()=>{
  const browser=await webkit.launch({headless:true});let release;
  try{
    const page=await browser.newPage({viewport:{width:500,height:280}}),gate=new Promise(r=>release=r);
    await page.route('**/characters/her-*.png',async route=>{if(/her-(dress|skirt|shoes)/.test(route.request().url()))await gate;await route.continue();});
    await stage(page);
    await page.evaluate(async()=>{for(const key of ['body','hair']){const image=new Image();image.src='game-art/characters/her-'+key+'.png';await image.decode();}});
    assert.equal(await page.locator('.character-portrait canvas,.character-portrait i').count(),0);
    assert.equal(await page.locator('.portrait-placeholder').isVisible(),true);
    await page.screenshot({path:'.local-review/portrait-delayed-fixed.png'});release();
    await page.locator('.character-portrait.is-ready').waitFor();
    const green=await page.locator('.character-portrait canvas').evaluate(c=>{const pixels=c.getContext('2d').getImageData(0,0,64,64).data;let count=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]&&pixels[i+1]>pixels[i]*1.2&&pixels[i+1]>pixels[i+2]*1.2)count++;return count;});
    assert.ok(green>70,'the portrait includes the green dress and skirt');
    await page.screenshot({path:'.local-review/portrait-complete-fixed.png'});
    const failed=await browser.newPage();let markFailed;const failedRequest=new Promise(r=>markFailed=r);
    await failed.route('**/characters/her-dress.png',async route=>{await route.abort();markFailed();});
    await stage(failed);await failedRequest;
    assert.equal(await failed.locator('.character-portrait canvas,.character-portrait i').count(),0);
    assert.equal(await failed.locator('.portrait-placeholder').isVisible(),true);
    await failed.unroute('**/characters/her-dress.png');
    await failed.evaluate(()=>KingdomPanels.renderPortraits(document.querySelector('#portrait')));
    await failed.locator('.character-portrait.is-ready').waitFor();
  }finally{release?.();await browser.close();}
});
