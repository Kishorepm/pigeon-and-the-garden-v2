// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.env.PREVIEW_URL||'http://localhost:8124/slice.html';

test('iPhone canvas budget: scene opens and the invitation works',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:3});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{
      const getContext=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(...args){
        if(this.width*this.height>16777216)throw new Error('Canvas exceeds iPhone pixel budget');
        return getContext.apply(this,args);
      };
    });
    await page.goto(url);
    await page.locator('#loading').waitFor({state:'hidden',timeout:20000});
    await page.getByRole('button',{name:'Reduce animation',exact:true}).click();
    await page.getByRole('button',{name:'Open the pigeon’s letter',exact:false}).click();
    await page.getByRole('button',{name:'Let’s open the next chapter',exact:false}).click();
    await page.getByRole('button',{name:'Pick up the basket',exact:false}).waitFor({timeout:10000});
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});

test('scene construction failure offers retry instead of staying at 100%',async()=>{
  const browser=await webkit.launch({headless:true});
  try{
    const page=await browser.newPage();
    await page.route('**/slice-world.js',async route=>{
      const response=await route.fetch();
      const source=await response.text();
      await route.fulfill({response,body:source.replace('makeGround(){',"makeGround(){throw new Error('Simulated scene allocation failure');")});
    });
    await page.goto(url);
    await page.getByRole('button',{name:/Try again/}).waitFor({timeout:20000});
    assert.equal(await page.locator('#loading').isVisible(),true);
  }finally{await browser.close();}
});
