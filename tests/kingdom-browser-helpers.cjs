async function prepare(page){
  await page.addInitScript(()=>{for(const who of ['north','south'])localStorage.setItem('kingdom-intro-v2:'+who,'seen');});
}
async function satchel(page,name){
  if(await page.locator('#explorer').isHidden())await page.locator('#menu-open').click();
  await page.getByRole('button',{name,exact:typeof name==='string'}).click();
  if(await page.locator('#explorer').isVisible())await page.locator('#explorer-close').click();
}
module.exports={prepare,satchel};
