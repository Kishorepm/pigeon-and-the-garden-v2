/* Shared interpretation of current Open-Meteo model weather. Never uses device location. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomWeatherModel=factory();})(globalThis,()=>{
  'use strict';
  const url='https://api.open-meteo.com/v1/forecast?latitude=-36.85&longitude=174.76&current=temperature_2m,weather_code,cloud_cover,precipitation,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=Pacific%2FAuckland&timeformat=unixtime&forecast_days=2';
  const modes={clear:'Clear skies',cloud:'Cloudy',rain:'Rain',fog:'Mist',storm:'Stormy skies',snow:'Snowfall'};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const finite=(v,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?v:fallback;
  function kind(code){
    if([95,96,97,99].includes(code))return 'storm';
    if([71,73,75,77,85,86].includes(code))return 'snow';
    if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return 'rain';
    if([45,48].includes(code))return 'fog';return code<=1?'clear':'cloud';
  }
  function normalize(raw,now=Date.now()){
    const c=raw?.current;
    if(!c||!Number.isFinite(c.temperature_2m)||!Number.isInteger(c.weather_code)||!Number.isFinite(c.time))throw Error('Weather is incomplete.');
    const observedAt=c.time*1000;
    if(observedAt>now+3600000||observedAt<now-86400000)throw Error('Weather is out of date.');
    const type=kind(c.weather_code);
    return {version:2,region:'Auckland',source:'Open-Meteo',temperature:Math.round(c.temperature_2m),code:c.weather_code,kind:type,label:modes[type],cloud:clamp(finite(c.cloud_cover,type==='clear'?10:85),0,100),precipitation:clamp(finite(c.precipitation),0,100),wind:clamp(finite(c.wind_speed_10m),0,200),direction:clamp(finite(c.wind_direction_10m),0,360),solar:(raw.daily?.sunrise||[]).map((rise,i)=>({rise:rise*1000,set:raw.daily.sunset?.[i]*1000})).filter(x=>Number.isFinite(x.rise)&&Number.isFinite(x.set)&&x.rise<x.set),observedAt,at:now};
  }
  function valid(w,now=Date.now()){
    return !!(w?.version===2&&Object.hasOwn(modes,w.kind)&&Number.isFinite(w.temperature)&&w.temperature>=-90&&w.temperature<=65&&Number.isFinite(w.observedAt)&&w.observedAt<=now+3600000&&w.observedAt>now-86400000&&Array.isArray(w.solar)&&w.solar.length<=7&&w.solar.every(x=>x&&Number.isFinite(x.rise)&&Number.isFinite(x.set)&&x.rise>0&&x.rise<x.set&&x.set<8640000000000000)&&Object.entries({cloud:100,precipitation:100,wind:200,direction:360}).every(([k,max])=>Number.isFinite(w[k])&&w[k]>=0&&w[k]<=max));
  }
  function age(w,now=Date.now()){return w?Math.max(0,Math.floor((now-w.observedAt)/60000)):null;}
  function daylight(w,now=Date.now()){
    const date=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Auckland',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
    const solar=w?.solar?.find(x=>date(x.rise)===date(now));let hour,phase,dark;
    if(solar){
      const toRise=(now-solar.rise)/3600000,toSet=(solar.set-now)/3600000;
      if(toRise<-.6||toSet<-.6){phase='Night';dark=.25;}
      else if(toRise<.75){phase='Dawn';dark=clamp(.17-toRise*.17,.035,.25);}
      else if(toSet<.9){phase='Dusk';dark=clamp(.17-toSet*.17,.025,.25);}
      else{phase='Day';dark=0;}
    }else{
      const parts=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',hour:'numeric',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
      hour=Number(parts.find(p=>p.type==='hour').value)+Number(parts.find(p=>p.type==='minute').value)/60;
      phase=hour<6||hour>=20?'Night':hour<8?'Dawn':hour>=18?'Dusk':'Day';dark=phase==='Night'?.25:phase==='Day'?0:.1;
    }
    return {phase,dark,night:phase==='Night',tint:phase==='Dusk'?'#896c55':phase==='Dawn'?'#bba17e':'#172f4d'};
  }
  function sample(type,now=Date.now()){
    if(!Object.hasOwn(modes,type))throw Error('Choose a sky.');
    return {version:2,region:'Auckland',source:'Preview',kind:type,label:modes[type],temperature:null,cloud:({clear:8,cloud:85,rain:95,fog:85,storm:100,snow:95})[type],precipitation:type==='storm'?3:type==='rain'?1:0,wind:type==='storm'?38:type==='fog'?3:14,direction:260,solar:[],observedAt:now,at:now};
  }
  return {url,modes,kind,normalize,valid,age,daylight,sample,clamp};
});
