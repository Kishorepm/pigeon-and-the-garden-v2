const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../kingdom-model'),F=require('../kingdom-fetch');
const now=new Date('2026-09-29T01:00:00Z');let serial=0;
const apply=(s,actor,type,data,id='life-command-'+ ++serial)=>M.command(s,actor,{id,type,data},now);
const quest=s=>{const id='life-mission-'+ ++serial;s=apply(s,'north','mission',{title:'A little adventure',who:'me',kind:'custom',target:0,steps:['Have a lovely time'],confirm:false},id);s=apply(s,'north','step',{id,index:0,done:true});return apply(s,'north','complete',{id});};
test('old saves have three real chapters; projects unlock from completed missions only',()=>{
  const old=M.initial();assert.equal(old.life,undefined);assert.equal(M.story(old).count,3);
  assert.throws(()=>apply(old,'north','restore',{project:'balcony'}),/more completed/);
  let s=apply(old,'north','restore',{project:'garden'},'restore-once');assert.equal(old.life,undefined);
  assert.equal(apply(s,'north','restore',{project:'garden'},'restore-once'),s);
  assert.throws(()=>apply(s,'south','restore',{project:'garden'}),/already/);
  s=apply(s,'north','mood',{mood:'Low'});s=apply(s,'south','comfort',{kind:'company',day:M.day(now)});s=apply(s,'north','ruby-play',{rounds:3,accurate:3});assert.equal(M.story(s).count,3);
  s=quest(quest(s));s=apply(s,'south','restore',{project:'balcony'});assert.ok(M.life(s).builds.balcony);assert.equal(M.story(s).count,5);
  assert.throws(()=>apply(s,'north','restore',{project:'library'}));s=quest(quest(quest(s)));s=apply(s,'north','restore',{project:'library'});assert.ok(M.life(s).builds.library);
});
test('each completed chapter has one flower, with separately authored notes',()=>{
  let s=M.initial();assert.throws(()=>apply(s,'north','plant',{source:'date1',species:'daisy'}));
  s=apply(s,'north','restore',{project:'garden'});assert.throws(()=>apply(s,'north','plant',{source:'made-up',species:'daisy'}));
  s=apply(s,'north','plant',{source:'date1',species:'bluebell',note:'Dark green.'},'flower-0001');
  assert.throws(()=>apply(s,'south','plant',{source:'date1',species:'sunflower'}),/already/);
  s=apply(s,'south','garden-note',{id:'flower-0001',note:'Definitely not green.',author:'north'});
  assert.deepEqual(M.life(s).flowers[0].notes,{north:'Dark green.',south:'Definitely not green.'});
  s=apply(s,'north','garden-note',{id:'flower-0001',note:'Still dark green.'});assert.equal(M.life(s).flowers[0].notes.south,'Definitely not green.');
});
test('comfort responds to the other person today and changes replace rather than pile up',()=>{
  let s=apply(M.initial(),'north','mood',{mood:'Tired'});
  assert.throws(()=>apply(s,'north','comfort',{kind:'hug',day:M.day(now)}));
  assert.throws(()=>apply(s,'south','comfort',{kind:'hug',day:'2026-09-28'}));
  assert.throws(()=>apply(s,'south','comfort',{kind:'toString',day:M.day(now)}));
  s=apply(s,'south','comfort',{kind:'company',day:M.day(now),to:'south'});s=apply(s,'south','comfort',{kind:'quiet',day:M.day(now)});
  assert.equal(M.life(s).responses.length,1);assert.equal(M.life(s).responses[0].to,'north');assert.equal(M.life(s).responses[0].kind,'quiet');assert.equal(s.moods[M.day(now)+':north'].mood,'Tired');
});
test('Ruby results belong to the actor, preserve best score and deduplicate retries',()=>{
  assert.throws(()=>apply(M.initial(),'north','ruby-play',{rounds:2,accurate:2}));assert.throws(()=>apply(M.initial(),'north','ruby-play',{rounds:3,accurate:4}));
  let s=apply(M.initial(),'north','ruby-play',{rounds:3,accurate:2},'ruby-result-01');assert.equal(apply(s,'north','ruby-play',{rounds:3,accurate:2},'ruby-result-01'),s);
  s=apply(s,'north','ruby-play',{rounds:3,accurate:1});s=apply(s,'south','ruby-play',{rounds:3,accurate:3});assert.deepEqual([M.life(s).ruby.north.plays,M.life(s).ruby.north.best,M.life(s).ruby.south.plays],[2,2,1]);
});
test('fetch follows three full retrieve loops, blocks repeat throws, and tracks flower accuracy',()=>{
  const game=F.create(true),player={x:409,y:1190};
  for(let i=0;i<3;i++){
    assert.equal(game.phase,'ready');assert.ok(F.toss(game,i===1?{x:330,y:1240}:F.ring(game),player));assert.equal(F.toss(game,F.ring(game),player),false);
    let frames=0;while(!['ready','done'].includes(game.phase)&&frames++<1500)F.step(game,1/60,player);assert.ok(frames<1500);assert.equal(game.round,i+1);
  }
  assert.equal(game.phase,'done');assert.equal(game.accurate,2);assert.equal(F.toss(game,F.ring(game),player),false);
});
test('fetch timing is stable across frame sizes, aim clamps to the meadow, and gentle ring is still',()=>{
  const a=F.create(true),b=F.create(true),player={x:409,y:1190};const ring=F.ring(a);F.step(a,20,player);assert.deepEqual(F.ring(a),ring);
  F.toss(a,{x:9999,y:-999},player);assert.deepEqual(a.target,{x:510,y:1128});
  F.toss(b,{x:9999,y:-999},player);for(let i=0;i<600;i++)F.step(a,1/60,player);for(let i=0;i<200;i++)F.step(b,.05,player);assert.equal(a.round,b.round);assert.equal(a.accurate,b.accurate);
});
