const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../kingdom-weather-model');
const V=require('../kingdom-view');
const now=Date.parse('2026-09-29T00:00:00Z');
const raw=(at=now)=>({current:{time:at/1000,temperature_2m:14.4,weather_code:63,cloud_cover:92,precipitation:.7,wind_speed_10m:21,wind_direction_10m:220},daily:{sunrise:[Date.parse('2026-09-28T17:00:00Z')/1000],sunset:[Date.parse('2026-09-29T06:30:00Z')/1000]}});

test('current conditions distinguish rain, fog, snow and thunderstorms',()=>{
  for(const [code,kind] of [[0,'clear'],[3,'cloud'],[45,'fog'],[56,'rain'],[63,'rain'],[71,'snow'],[86,'snow'],[97,'storm'],[99,'storm']]){const r=raw();r.current.weather_code=code;assert.equal(M.normalize(r,now).kind,kind);}
  const w=M.normalize(raw(),now);assert.equal(w.temperature,14);assert.equal(w.observedAt,now);assert.equal(M.valid(w,now),true);
  const u=new URL(M.url);assert.equal(u.searchParams.get('latitude'),'-36.85');assert.equal(u.searchParams.get('timezone'),'Pacific/Auckland');assert.equal(u.searchParams.get('timeformat'),'unixtime');
});

test('malformed, future and expired cached conditions cannot masquerade as current weather',()=>{
  assert.throws(()=>M.normalize({current:{temperature_2m:null}},now));assert.throws(()=>M.normalize(raw(now-90000000),now));assert.throws(()=>M.normalize(raw(now+7200000),now));
  const w=M.normalize(raw(),now);for(const bad of [{...w,solar:[{rise:'no',set:null}]},{...w,wind:-5},{...w,kind:'<script>'},{...w,observedAt:now-90000000},{...w,temperature:Infinity}])assert.equal(M.valid(bad,now),false);
  assert.equal(M.age(w,now+61*60000),61);assert.equal(M.valid(M.sample('rain',now),now),false,'a chosen sky is never valid provider data');
});

test('Auckland daylight uses absolute solar instants across daylight saving',()=>{
  const w=M.normalize(raw(),now);
  assert.equal(M.daylight(w,Date.parse('2026-09-28T17:15:00Z')).phase,'Dawn');
  assert.equal(M.daylight(w,now).phase,'Day');
  assert.equal(M.daylight(w,Date.parse('2026-09-29T06:00:00Z')).phase,'Dusk');
  assert.equal(M.daylight(w,Date.parse('2026-09-29T09:00:00Z')).phase,'Night');
  assert.equal(M.daylight(null,Date.parse('2026-09-26T19:00:00Z')).phase,'Day','DST has advanced Auckland to 8am');
});

test('camera zoom is bounded and preserves the existing responsive starting view',()=>{
  assert.equal(V.base(390),1.22);assert.equal(V.base(844),1.45);assert.equal(V.base(1280),1.75);
  assert.equal(V.limit(-1),.6);assert.equal(V.limit(10),1.9);assert.equal(V.limit(NaN),1);
});

test('weather endpoint caches fresh data, marks fallback data and refuses expired weather',async()=>{
  const oldFetch=global.fetch,oldNow=Date.now;let clock=now,requests=0,fail=false;
  Date.now=()=>clock;global.fetch=async url=>{requests++;assert.equal(url,M.url);if(fail)throw Error('Offline');return {ok:true,json:async()=>raw(now)};};
  const key=require.resolve('../api/kingdom-weather');delete require.cache[key];const handler=require(key);
  const call=async method=>{const r={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;},end(){return this;}};await handler({method:method||'GET'},r);return r;};
  try{
    assert.equal((await call('POST')).code,405);assert.equal((await call()).body.kind,'rain');assert.equal((await call()).code,200);assert.equal(requests,1);
    clock+=660000;fail=true;const fallback=await call();assert.equal(fallback.body.stale,true);assert.equal(fallback.headers['Cache-Control'],'no-store');
    clock=now+7*3600000;const expired=await call();assert.equal(expired.code,503);assert.equal(expired.body.temperature,undefined);
  }finally{global.fetch=oldFetch;Date.now=oldNow;delete require.cache[key];}
});
