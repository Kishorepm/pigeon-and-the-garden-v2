const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../kingdom-model');
const handler=require('../api/kingdom');
const config=require('../api/kingdom-config');
const clone=x=>JSON.parse(JSON.stringify(x));
function response(){return {headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};}
async function fixture(run){
  const oldFetch=global.fetch,env={...process.env};let row={state:M.initial(),revision:0},conflicts=0;
  process.env.SUPABASE_URL='https://example.test';process.env.SUPABASE_SERVICE_ROLE_KEY='server-secret';process.env.SUPABASE_PUBLISHABLE_KEY='public-key';
  global.fetch=async(url,options={})=>{
    const u=new URL(url),reply=data=>({ok:true,status:200,json:async()=>clone(data)});
    if(u.pathname==='/auth/v1/user'){const actor=options.headers.Authorization.slice(7);return actor==='expired'?{ok:false,status:401}:reply({id:actor});}
    assert.equal(options.headers.apikey,'server-secret');
    if(u.pathname==='/rest/v1/kingdom_members'){const actor=u.searchParams.get('user_id').slice(3);return reply(M.people.includes(actor)?[{kingdom_id:'our-kingdom',home:actor}]:[]);}
    if(u.pathname==='/rest/v1/kingdom_states'){assert.equal(u.searchParams.get('id'),'eq.our-kingdom');return reply([row]);}
    if(u.pathname==='/rest/v1/rpc/commit_kingdom'){const d=JSON.parse(options.body);assert.equal(d.kingdom,'our-kingdom');if(d.expected_revision!==row.revision){conflicts++;return reply(false);}row={state:d.next_state,revision:row.revision+1};return reply(true);}
    throw Error('Unexpected request: '+u.pathname);
  };
  const request=async(actor,body)=>{const res=response();await handler({method:body?'POST':'GET',headers:actor?{authorization:'Bearer '+actor}:{},body},res);return res;};
  try{await run({request,get row(){return row;},get conflicts(){return conflicts;}});}finally{global.fetch=oldFetch;for(const k of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_PUBLISHABLE_KEY']){if(env[k]===undefined)delete process.env[k];else process.env[k]=env[k];}}
}
test('configuration exposes only the public key, while missing auth and outsiders cannot read',()=>fixture(async f=>{
  const res=response();await config({method:'GET'},res);assert.equal(res.body.key,'public-key');assert.ok(!JSON.stringify(res.body).includes('server-secret'));
  assert.equal((await f.request()).statusCode,401);
  assert.equal((await f.request('expired')).statusCode,401);
  assert.equal((await f.request('outsider')).statusCode,403);
}));
test('the server derives identity and preserves both concurrent ratings through revision conflicts',()=>fixture(async f=>{
  const [n,s]=await Promise.all([
    f.request('north',{id:'north-rating-01',actor:'south',type:'rate',data:{id:'starbucks-02',score:8.5,actor:'south'}}),
    f.request('south',{id:'south-rating-01',type:'rate',data:{id:'starbucks-02',score:7}})
  ]);
  assert.equal(n.statusCode,200);assert.equal(s.statusCode,200);
  assert.deepEqual(f.row.state.visits[0].ratings,{north:8.5,south:7});assert.ok(f.conflicts>0);
  const rev=f.row.revision;await f.request('north',{id:'north-rating-01',type:'rate',data:{id:'starbucks-02',score:3}});assert.equal(f.row.revision,rev);assert.equal(f.row.state.visits[0].ratings.north,8.5);
}));
test('API enforces mission completion and opposite-person awards, including duplicate delivery',()=>fixture(async f=>{
  const cmd=(id,type,data)=>({id,type,data});
  await f.request('north',cmd('mission-0001','mission',{title:'A small kindness',who:'me',steps:['Bring flowers'],target:0,confirm:true}));
  assert.equal((await f.request('north',cmd('complete-too-soon','complete',{id:'mission-0001'}))).statusCode,400);
  await f.request('north',cmd('step-000001','step',{id:'mission-0001',index:0,done:true}));
  await f.request('north',cmd('complete-0001','complete',{id:'mission-0001'}));
  assert.equal((await f.request('north',cmd('self-confirm-01','confirm',{id:'mission-0001'}))).statusCode,400);
  await f.request('south',cmd('confirm-0001','confirm',{id:'mission-0001'}));
  assert.equal((await f.request('north',cmd('self-award-01','award',{id:'mission-0001',points:5,reason:'Me'}))).statusCode,400);
  const award=cmd('award-000001','award',{id:'mission-0001',points:9,reason:'A thoughtful surprise'});
  await Promise.all([f.request('south',award),f.request('south',award)]);
  assert.equal(f.row.state.awards.length,1);assert.equal(f.row.state.awards[0].recipient,'north');
}));
test('sealed capsule text stays on the server for both accounts',()=>fixture(async f=>{
  const sent=await f.request('north',{id:'capsule-0001',type:'capsule',data:{title:'For later',body:'Secret future note',opens:'2099-01-01'}});
  assert.equal(sent.statusCode,200);assert.equal(f.row.state.capsules[0].entries.north,'Secret future note');
  for(const actor of M.people){const res=await f.request(actor);assert.equal(res.body.state.capsules[0].sealed,true);assert.ok(!JSON.stringify(res.body).includes('Secret future note'));assert.equal(res.body.state.applied,undefined);}
}));
