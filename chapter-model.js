(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Chapter=factory();})(globalThis,function(){
  'use strict';
  const options={
    travel:{near:'I come to your side around Waiuku',middle:'Meet somewhere between us',pickup:'I pick you up for a drive',yours:'You come my way'},
    activity:{meal:'A proper meal + iced drinks',picnic:'A takeaway picnic',drive:'Food + a scenic drive',cosy:'A cosy table + dessert',surprise:'Plan something for me'},
    time:{morning:'Morning',lunch:'Lunchtime',afternoon:'Afternoon',evening:'Evening',flexible:'Let’s arrange the time by text'}
  };
  const ranges={near:{local:'Around Waiuku'},middle:{short:'Up to 20 minutes each way',medium:'Up to 40 minutes each way',long:'Up to an hour each way',flexible:'Let’s work out the drive together'},yours:{short:'Up to 20 minutes each way',medium:'Up to 40 minutes each way',long:'Up to an hour each way',flexible:'Let’s work out the drive together'},pickup:{short:'A short outing close by',scenic:'A longer scenic outing',flexible:'Happy to decide together'}};
  function today(){const parts=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');}
  function validDay(value,minimum=today()){if(value==='flexible')return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value&&value>=minimum;}
  const initial=()=>({travel:null,range:null,activity:null,day:null,time:null,note:'',status:'draft'});
  const has=(set,key)=>typeof key==='string'&&!!set&&Object.hasOwn(set,key);
  const ready=p=>!!(p&&has(options.travel,p.travel)&&has(ranges[p.travel],p.range)&&has(options.activity,p.activity)&&validDay(p.day)&&has(options.time,p.time));
  function choose(p,key,value){if(key==='travel'&&has(options.travel,value)){p.travel=value;p.range=value==='near'?'local':null;return true;}if(key==='range'&&has(ranges[p.travel],value)||has(options,key)&&has(options[key],value)||key==='day'&&validDay(value)){p[key]=value;return true;}return false;}
  const dayLabel=v=>v==='flexible'?'Let’s arrange a day by text':validDay(v,'1900-01-01')?new Intl.DateTimeFormat('en-NZ',{weekday:'long',day:'numeric',month:'long',timeZone:'Pacific/Auckland'}).format(new Date(v+'T00:00:00Z')):'Still to choose';
  function activities(p){return {...options.activity,...(p.time==='morning'?{meal:'Breakfast or brunch + iced drinks',picnic:'A breakfast picnic',cosy:'A cosy cafe + something sweet'}:p.time==='lunch'?{meal:'A proper lunch + iced drinks'}:p.time==='evening'?{meal:'Dinner + iced drinks'}:{})};}
  function rows(p){return [['Where',options.travel[p.travel]||'Still to choose'],['Travel',ranges[p.travel]?.[p.range]||'Still to choose'],['Our outing',activities(p)[p.activity]||'Still to choose'],['Day',dayLabel(p.day)],['Time',options.time[p.time]||'Still to choose'],['Venue','We’ll choose somewhere after this']];}
  function payload(p){return {travel:options.travel[p.travel],range:ranges[p.travel]?.[p.range],date:activities(p)[p.activity],day:dayLabel(p.day),hour:options.time[p.time],place:'Exact venue to arrange after confirming preferences',food:activities(p)[p.activity],drink:'Two overdue iced drinks',throne:'Date 1 throne, already earned',crown:'For after Date 2, not awarded yet',...(p.note?{note:p.note.slice(0,300)}:{})};}
  const text=p=>'OUR LITTLE ADVENTURE · STOP 02\n\n'+rows(p).map(([k,v])=>k+': '+v).join('\n')+'\nDrinks: Two overdue iced drinks'+(p.note?'\nA little note: '+p.note:'');
  function restore(raw){const p=initial();if(!raw||typeof raw!=='object')return p;if(has(options.travel,raw.travel))choose(p,'travel',raw.travel);for(const key of ['range','activity','day','time'])choose(p,key,raw[key]);p.note=typeof raw.note==='string'?raw.note.slice(0,300):'';p.status=['draft','sent','confirmed'].includes(raw.status)?raw.status:'draft';return p;}
  function validConfig(c){return !!(c&&typeof c.revision==='string'&&['inviting','proposed','completed'].includes(c.stage)&&(c.stage==='inviting'||c.itinerary&&typeof c.itinerary.venue==='string'&&c.itinerary.venue.trim()&&c.itinerary.day!=='flexible'&&validDay(c.itinerary.day,'1900-01-01')&&typeof c.itinerary.time==='string'&&c.itinerary.time.trim()));}
  return {options,activities,ranges,today,validDay,initial,ready,choose,dayLabel,rows,payload,text,restore,validConfig};
});
