const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const {webcrypto}=require('node:crypto');const M=require('../kingdom-model');
const source=fs.readFileSync(require.resolve('../kingdom-store.js'),'utf8');
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
function setup(hash=''){
  const c={window:{},EventTarget,Event,KingdomModel:M,URLSearchParams,crypto:webcrypto,location:{hash,origin:'https://kingdom.test',pathname:'/kingdom.html',search:''},history:{replaceState(){c.location.hash='';}},sessionStorage:storage(),localStorage:storage(),document:{visibilityState:'visible'},setInterval:()=>1,clearInterval:()=>{},fetch:async()=>{throw Error('No unexpected network requests');}};
  vm.createContext(c);vm.runInContext(source,c);return {context:c,store:new c.window.KingdomStore()};
}
test('preview reload restores its home without confusing it with a shared account',async()=>{
  const {store:s,context:c}=setup();s.preview('south');await s.send('rate',{id:'starbucks-02',score:6});
  const resumed=new c.window.KingdomStore();assert.equal(await resumed.resume(),true);assert.equal(resumed.actor,'south');assert.equal(resumed.mode,'preview');assert.equal(resumed.state.visits[0].ratings.south,6);
  resumed.logout();assert.equal(c.sessionStorage.getItem('kingdom-preview-actor'),null);
});
test('slow polling cannot overwrite a later successful save',async()=>{
  const {store:s}=setup();s.mode='live';s.actor='north';let resolveRead;
  s.request=body=>body?Promise.resolve({state:{...M.initial(),revision:2},actor:'north'}):new Promise(resolve=>resolveRead=resolve);
  const load=s.load();await s.send('rate',{id:'starbucks-02',score:8});resolveRead({state:{...M.initial(),revision:1},actor:'north'});await load;
  assert.equal(s.state.revision,2);
});
test('an unsuccessful save retains confirmed data and reports failure',async()=>{
  const {store:s}=setup();s.mode='live';s.actor='north';let tries=0;s.request=async()=>{tries++;throw Error('Offline');};
  await assert.rejects(s.send('rate',{id:'starbucks-02',score:8}),/Offline/);assert.equal(s.state.visits[0].ratings.north,undefined);assert.equal(tries,2);assert.equal(s.status,'Not saved · please retry');assert.equal(s.busy,false);
});
test('invitation callback removes credentials from the URL and reaches password setup after membership is verified',async()=>{
  const {store:s,context:c}=setup('#type=invite&access_token=sample-access&refresh_token=sample-refresh&expires_in=3600');
  assert.equal(c.location.hash,'');s.config={configured:true,url:'https://auth.test',key:'publishable'};
  c.fetch=async(url,options)=>{
    if(url==='/api/kingdom'){assert.equal(options.headers.Authorization,'Bearer sample-access');return {ok:true,json:async()=>({actor:'south',state:M.visible(M.initial())})};}
    assert.equal(url,'https://auth.test/auth/v1/user');assert.equal(options.method,'PUT');assert.equal(JSON.parse(options.body).password,'my private password');return {ok:true};
  };
  assert.equal(await s.resume(),true);assert.equal(s.actor,'south');assert.equal(s.needsPassword,true);
  await s.password('my private password');assert.equal(s.needsPassword,false);assert.equal(c.sessionStorage.getItem('kingdom-password-setup'),null);
});
