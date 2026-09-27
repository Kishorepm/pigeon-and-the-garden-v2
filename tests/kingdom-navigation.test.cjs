const {test}=require('node:test');
const assert=require('node:assert/strict');
const N=require('../kingdom-navigation');
const P=require('../kingdom-paths');

test('water blocks walking except at the two bridges',()=>{
  const n=N.create();
  assert.equal(n.walkable(624,700),false);
  assert.equal(n.walkable(55,671),false);
  assert.equal(n.walkable(624,552),true);
  assert.equal(n.walkable(624,1048),true);
  const blocked=n.move(550,800,200,0);assert.ok(blocked[0]<=569);
  const crossed=n.move(550,552,200,0);assert.ok(Math.abs(crossed[0]-750)<.001&&crossed[1]===552);
});
test('solid footprints stop tunnelling and allow sliding along a wall',()=>{
  const n=N.create([{type:'circle',x:400,y:100,r:11}]);
  assert.ok(n.move(350,-35,0,-200)[1]>-100,'cannot walk into North cottage');
  assert.ok(n.move(350,100,100,0)[0]<=382,'tree trunk is solid');
  const p=n.move(550,800,60,60);assert.ok(p[0]<=569&&p[1]>850,'slide south beside river');
  assert.equal(n.walkable(-1000,400),false);
});
test('every destination connects with routes that remain on walkable ground',()=>{
  const n=N.create();
  for(const a of Object.keys(P.places))for(const b of Object.keys(P.places)){
    const from=P.nodes[P.places[a].node],to=P.nodes[P.places[b].node],route=n.route(from,to);
    assert.ok(route,`${a} to ${b} is reachable`);let last=from;
    for(const p of route){assert.ok(n.clear(last,p),`${a} to ${b} segment clears obstacles`);last=p;}
    assert.deepEqual(last,to);
  }
});
test('route begins from actual position and refuses blocked destinations',()=>{
  const n=N.create(),from=[455,855],to=[850,855],route=n.route(from,to);
  assert.ok(route);assert.ok(n.clear(from,route[0]));
  assert.equal(n.route(from,[624,855]),null);
  assert.equal(n.route(from,[350,-140]),null);
});
