const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../kingdom-interior-model'),N=require('../kingdom-navigation');
for(const [id,room] of Object.entries(M.rooms))test(`${id}: every room activity connects around furniture`,()=>{
  const n=N.create(room.obstacles,6,{bounds:M.bounds,buildings:[],water:false,cell:8});
  assert.ok(n.walkable(0,116));
  for(const a of [[0,116],...room.stations.map(st=>st.point)])for(const st of room.stations){const route=n.route(a,st.point);assert.ok(route,`${id}: ${a} to ${st.id}`);let last=a;for(const p of route){assert.ok(n.clear(last,p));last=p;}assert.deepEqual(last,st.point);}
  for(const o of room.obstacles)assert.equal(n.walkable(o.x+o.w/2,o.y+o.h/2),false);
});
test('room walls and furnishings stop a long movement without tunnelling',()=>{
  const n=N.create(M.rooms.north.obstacles,6,{bounds:M.bounds,buildings:[],water:false,cell:8});
  assert.ok(n.move(0,116,1000,0)[0]<=154);assert.ok(n.move(0,116,0,1000)[1]<=138);
  const p=n.move(104,-7,0,-1000);assert.ok(p[1]>=-19,'the writing desk is solid');
  assert.equal(n.route([0,116],[104,-50]),null);assert.equal(n.walkable(0,-180),false);
});
test('the pouring activity has a readable target, boundaries and deterministic results',()=>{
  assert.equal(M.pour(-1),0);assert.equal(M.pour(100),1);assert.equal(M.pour(NaN),0);
  assert.equal(M.result(M.pour(2.24)),'Just right');assert.equal(M.result(M.pour(.4)),'A little sip');assert.equal(M.result(M.pour(3)),'A very generous cup');
});
