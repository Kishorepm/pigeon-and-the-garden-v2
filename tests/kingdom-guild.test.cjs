const {test}=require('node:test');const assert=require('node:assert/strict');const M=require('../kingdom-model');
let id=0;const now=new Date('2026-09-28T02:00:00Z');
const send=(s,actor,type,data,key='guild-command-'+(++id))=>M.command(s,actor,{id:key,type,data},now);
const quest={kind:'tasting',category:'Coffee',title:'The mocha quest',description:'Find a favourite',who:'both',steps:['Pick our favourite'],target:2,bothRate:true,confirm:true};
test('a quick mood requires no invented energy or support preference',()=>{
  const s=send(M.initial(),'north','mood',{mood:'Content'}),m=s.moods['2026-09-28:north'];
  assert.equal(m.energy,'');assert.equal(m.need,'');assert.equal(m.note,'');assert.equal(m.mood,'Content');
  assert.throws(()=>send(s,'north','mood',{mood:'Invented'}));
});
test('mission types preserve legacy quests and validate their relevant rules',()=>{
  assert.equal(M.missionKind({target:3}),'tasting');assert.equal(M.missionKind({target:0}),'custom');
  for(const kind of ['date','kindness','custom']){const s=send(M.initial(),'north','mission',{...quest,kind,target:0,bothRate:false});assert.equal(s.missions[0].kind,kind);assert.equal(s.missions[0].category,null);}
  assert.throws(()=>send(M.initial(),'north','mission',{...quest,kind:'date'}));
  assert.throws(()=>send(M.initial(),'north','mission',{...quest,kind:'invented'}));
  assert.throws(()=>send(M.initial(),'north','mission',{...quest,target:0}));
});
test('branch names count separately; repeats at the same branch do not inflate progress',()=>{
  let s=send(M.initial(),'north','mission',quest,'mocha-quest-01');s=send(s,'south','accept',{id:'mocha-quest-01'});
  for(const [i,area] of ['Sylvia Park','  sylvia   park ','Manawa Bay'].entries()){
    s=send(s,'north','visit',{mission:'mocha-quest-01',venue:'Starbucks',area,item:'Mocha',category:'Coffee',day:'2026-09-28',score:8},'branch-visit-'+i);
    s=send(s,'south','rate',{id:'branch-visit-'+i,score:7.5});
  }
  assert.equal(M.progress(s,s.missions[0]).distinct,2);
  assert.equal(s.visits.at(-1).ratings.north,8);assert.equal(s.visits.at(-1).ratings.south,7.5);
  assert.throws(()=>send(s,'north','visit',{mission:'mocha-quest-01',venue:'A restaurant',item:'Lunch',category:'Food',day:'2026-09-28'}));
});
test('linking an earlier tasting preserves ratings and cannot steal another mission entry',()=>{
  let s=send(M.initial(),'north','rate',{id:'starbucks-02',score:8});s=send(s,'north','mission',quest,'mocha-quest-02');
  assert.throws(()=>send(s,'north','link-visit',{visit:'starbucks-02',mission:'mocha-quest-02'}));
  s=send(s,'south','accept',{id:'mocha-quest-02'});s=send(s,'north','link-visit',{visit:'starbucks-02',mission:'mocha-quest-02'});
  assert.deepEqual(s.visits[0].ratings,{north:8});assert.equal(s.visits[0].mission,'mocha-quest-02');
  s=send(s,'north','mission',{...quest,who:'me'},'mocha-quest-03');
  assert.throws(()=>send(s,'north','link-visit',{visit:'starbucks-02',mission:'mocha-quest-03'}));
});

test('a tasting note survives without a score and a taste test can use just its place target',()=>{
  let s=send(M.initial(),'north','visit',{venue:'A little café',item:'Iced mocha',category:'Coffee',day:'2026-09-28',note:'Rate it together later.'});
  assert.deepEqual(s.visits.at(-1).ratings,{});assert.equal(s.visits.at(-1).notes.north,'Rate it together later.');
  s=send(s,'north','mission',{...quest,who:'me',target:1,bothRate:false,steps:[]},'target-only-quest');
  assert.equal(M.progress(s,s.missions[0]).ready,false);
  s=send(s,'north','link-visit',{visit:s.visits.at(-1).id,mission:'target-only-quest'});
  assert.equal(M.progress(s,s.missions[0]).ready,true);
  assert.throws(()=>send(s,'north','mission',{...quest,kind:'custom',target:0,bothRate:false,steps:[]}));
});

test('a favourite search ends only with an eligible tasting and partner confirmation',()=>{
  let s=send(M.initial(),'north','mission',{...quest,goal:'favourite',target:0,steps:[]},'favourite-quest');
  s=send(s,'south','accept',{id:'favourite-quest'});
  assert.equal(M.progress(s,s.missions[0]).ready,false);
  assert.throws(()=>send(s,'north','complete',{id:'favourite-quest'}));
  assert.throws(()=>send(s,'north','favourite',{id:'favourite-quest',visit:'starbucks-02'}));
  s=send(s,'north','visit',{venue:'Our café',item:'Mocha',category:'Coffee',day:'2026-09-28',mission:'favourite-quest',score:8},'favourite-visit');
  assert.throws(()=>send(s,'north','favourite',{id:'favourite-quest',visit:'favourite-visit'}));
  s=send(s,'south','rate',{id:'favourite-visit',score:9});
  assert.equal(M.progress(s,s.missions[0]).ready,false,'ratings alone do not end the search');
  s=send(s,'south','favourite',{id:'favourite-quest',visit:'favourite-visit'});
  assert.equal(M.progress(s,s.missions[0]).ready,true);
  s=send(s,'south','complete',{id:'favourite-quest'});assert.equal(s.missions[0].status,'awaiting');
  assert.throws(()=>send(s,'south','confirm',{id:'favourite-quest'}));
  s=send(s,'north','confirm',{id:'favourite-quest'});
  assert.equal(s.missions[0].status,'completed');assert.equal(s.missions[0].favouriteVisit,'favourite-visit');
});

test('a forever quest remains open across visits and can be archived without losing them',()=>{
  let s=send(M.initial(),'north','mission',{...quest,goal:'forever',target:0,steps:[],who:'me',bothRate:false,evidence:true,due:'2099-01-01'},'forever-quest');
  assert.equal(s.missions[0].confirm,false);assert.equal(s.missions[0].evidence,false);assert.equal(s.missions[0].due,'');
  for(let i=0;i<4;i++)s=send(s,'north','visit',{venue:'Café '+i,item:'Mocha',category:'Coffee',day:'2026-09-28',mission:'forever-quest'});
  s=JSON.parse(JSON.stringify(s));assert.equal(M.progress(s,s.missions[0]).distinct,4);assert.equal(M.progress(s,s.missions[0]).ready,false);
  assert.throws(()=>send(s,'north','complete',{id:'forever-quest'}),/stays open/);
  assert.throws(()=>send(s,'south','archive',{id:'forever-quest'}));
  s=send(s,'north','archive',{id:'forever-quest'});assert.equal(s.missions[0].status,'archived');assert.equal(s.visits.length,5);
});

test('unlimited modes validate their rules and legacy tasting goals still use their count',()=>{
  assert.equal(M.tastingGoal({target:2}),'places');
  for(const goal of ['favourite','forever'])assert.throws(()=>send(M.initial(),'north','mission',{...quest,goal}));
  assert.throws(()=>send(M.initial(),'north','mission',{...quest,goal:'unknown'}));
  let s=send(M.initial(),'north','mission',{...quest,goal:'favourite',target:0,who:'partner'},'partner-favourite');
  s=send(s,'south','accept',{id:'partner-favourite'});s=send(s,'south','link-visit',{visit:'starbucks-02',mission:'partner-favourite'});
  assert.throws(()=>send(s,'north','favourite',{id:'partner-favourite',visit:'starbucks-02'}),/joined/);
});
