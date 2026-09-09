const {test}=require('node:test');
const assert=require('node:assert/strict');
const Q=require('../pixel-model.js');
test('a new invitation requires all four new decisions and a travel range',()=>{
 const p=Q.initial();assert.equal(Q.ready(p),false);
 for(const [k,v] of Object.entries({travel:'near',date:'meal',day:'sat',time:'afternoon',addition:'flowers'}))assert.equal(Q.choose(p,k,v),true);
 assert.equal(p.range,'close');assert.equal(Q.ready(p),true);
});
test('changing travel clears a stale distance except the nearby route',()=>{
 const p=Q.initial();Q.choose(p,'travel','pickup');Q.choose(p,'range','adventure');Q.choose(p,'travel','middle');assert.equal(p.range,null);
 Q.choose(p,'travel','near');assert.equal(p.range,'close');
});
test('invalid options and inherited object properties cannot become choices',()=>{
 const p=Q.initial(),before=JSON.stringify(p);
 for(const [k,v] of [['travel','constructor'],['__proto__','near'],['date','unknown']])assert.equal(Q.choose(p,k,v),false);
 assert.equal(JSON.stringify(p),before);assert.equal(Q.ready({...p,travel:'toString'}),false);
});
test('open timing is an explicit valid choice, with no invented appointment',()=>{
 const p=Q.initial();Q.choose(p,'day','arrange');assert.equal(Q.timingReady(p),false);Q.choose(p,'time','arrange');assert.equal(Q.timingReady(p),true);
 assert.match(Q.payload(p).day,/arrange by text/);
});
test('all date plans include iced drinks and preserve the throne',()=>{
 for(const date of Object.keys(Q.options.date)){const p={...Q.initial(),date};const sent=Q.payload(p);assert.match(sent.drink,/Iced drinks/);assert.match(sent.throne,/carried forward/);assert.match(sent.food,new RegExp(Q.options.date[date].replace(/[+]/g,'\\+')));}
});
test('notification includes travel, range, date and addition; editing changes its fingerprint',()=>{
 const p={travel:'pickup',range:'little',date:'drive',day:'sun',time:'lunch',addition:'lantern'};
 const out=Q.payload(p),first=Q.fingerprint(p);assert.match(out.travel,/pick you up/);assert.match(out.range,/further/);assert.match(out.date,/scenic/);assert.match(out.build,/lantern tree/);
 Q.choose(p,'addition','fountain');assert.notEqual(Q.fingerprint(p),first);
});
