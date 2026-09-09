/* The second-date choices. Pure model shared by the browser and tests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Quest=factory();})(globalThis,function(){
  'use strict';
  const options={
    travel:{near:'I come to your side · around Waiuku',middle:'We meet somewhere between us',pickup:'I pick you up for a little drive',yours:'You come my way again'},
    range:{close:'Keep it close',little:'A little further is fine',adventure:'A small adventure'},
    date:{meal:'Iced drinks + a proper meal',drive:'Food + a scenic little drive',picnic:'A takeaway picnic',cosy:'A cosy table + dessert',surprise:'Plan it for me'},
    day:{fri:'Friday',sat:'Saturday',sun:'Sunday',arrange:'Another day · arrange by text'},
    time:{lunch:'Lunchtime',afternoon:'Afternoon',evening:'Evening',arrange:'Let’s work it out'},
    addition:{fountain:'A little fountain',flowers:'A flower arch',lantern:'A lantern tree'}
  };
  const initial=()=>({travel:null,range:null,date:null,day:null,time:null,addition:null});
  const valid=(field,value)=>Object.hasOwn(options,field)&&Object.hasOwn(options[field],value);
  function choose(p,field,value){if(!valid(field,value))return false;p[field]=value;if(field==='travel')p.range=value==='near'?'close':null;return true;}
  const ready=p=>Object.keys(options).every(k=>valid(k,p[k]));
  const timingReady=p=>valid('day',p.day)&&valid('time',p.time);
  const label=(p,k)=>valid(k,p[k])?options[k][p[k]]:'Still to choose';
  const payload=p=>({travel:label(p,'travel'),range:label(p,'range'),date:label(p,'date'),place:label(p,'travel')+'; exact venue to arrange',day:label(p,'day'),hour:label(p,'time'),food:label(p,'date'),drink:'Iced drinks — we missed them last time',build:'Dining courtyard + '+label(p,'addition'),throne:'Her chosen castle throne, carried forward'});
  const fingerprint=p=>JSON.stringify(payload(p));
  return {options,initial,valid,choose,ready,timingReady,label,payload,fingerprint};
});
