(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomModel=factory();})(globalThis,function(){
  'use strict';
  const people=['north','south'];
  const names={north:'North · the knight',south:'South · the princess'};
  const moods=['Content','Excited','Tender','Tired','Low','Overwhelmed'];
  const needs=['A little company','Encouragement','A chat','Some quiet','Nothing in particular'];
  const missionKinds=['tasting','date','kindness','custom'];
  const missionKind=m=>m.kind||(m.target?'tasting':'custom');
  const tastingGoals=['places','favourite','forever'];
  const tastingGoal=m=>missionKind(m)==='tasting'?(m.goal||'places'):null;
  const placeKey=v=>[v.venue,v.area].filter(Boolean).join(' · ').trim().replace(/\s+/g,' ').toLowerCase();
  const restorations=[
    {id:'garden',title:'The memory garden',threshold:3,copy:'A flower for each chapter. A place for both of your words.',gift:'Plant your first memory'},
    {id:'balcony',title:'The lantern balcony',threshold:5,copy:'A quiet place above the courtyard, lit by the adventures you keep.',gift:'A new silhouette for the castle'},
    {id:'library',title:'The little story tower',threshold:8,copy:'A warm-windowed tower for a growing collection of your days.',gift:'A home for all your chapters'}
  ];
  const comforts={company:{label:'Sit with you',received:'left a little company',copy:'No need to say anything. I’m here.'},hug:{label:'Leave a hug',received:'left you a hug',copy:'A little hug, for whenever you need it.'},flowers:{label:'Bring flowers',received:'brought you flowers',copy:'Something small to brighten your doorstep.'},quiet:{label:'Give you quiet',received:'left a quiet light on',copy:'Take your time. No reply needed.'}};
  function life(s){return {builds:s.life?.builds||{},flowers:s.life?.flowers||[],responses:s.life?.responses||[],ruby:s.life?.ruby||{}};}
  function storySeeds(s){return [{id:'date1',title:'A walk at Ambury',kind:'chapter',detail:'30 August · the throne'},{id:'date2',title:'The long way through Kmart',kind:'chapter',detail:'12 September · the crown'},{id:'date3',title:'Our first kiss',kind:'chapter',detail:'Manawa Bay · the lantern'},...s.missions.filter(m=>m.status==='completed').map(m=>({id:'mission:'+m.id,title:m.title,kind:'mission',detail:'An adventure, completed together'}))];}
  function story(s){const count=storySeeds(s).length,built=life(s).builds;return {count,projects:restorations.map(p=>({...p,built:!!built[p.id],available:count>=p.threshold})),next:restorations.find(p=>!built[p.id])||null};}
  function rating(value){requireThat(typeof value==='number'&&value>=0&&value<=10&&Number.isInteger(value*2),'Choose a score from 0 to 10, in half-points.');return value;}
  const day=(at=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Auckland',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
  const other=p=>p==='north'?'south':'north';
  const copy=x=>JSON.parse(JSON.stringify(x));
  function requireThat(ok,message){if(!ok)throw new Error(message);}
  function text(value,max=500){requireThat(typeof value==='string'&&value.trim().length<=max,'Please shorten that text.');return value.trim();}
  function required(value,max=100){const v=text(value,max);requireThat(v,'Please fill in the required details.');return v;}
  function date(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!isNaN(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().startsWith(value);}
  const collection=['missions','visits','letters','ideas','awards','capsules','gestures'];
  function initial(){return {schema:1,revision:0,applied:[],missions:[],visits:[{id:'starbucks-02',venue:'Starbucks · Sylvia Park',item:'Iced mocha',category:'Coffee',day:'2026-09-12',author:'north',ratings:{},notes:{}}],moods:{},letters:[],ideas:[],awards:[],capsules:[],gestures:[],placements:{throne:'castle',crown:'castle',lantern:'castle'},duckName:'',memories:{},preferences:{north:'',south:''}};}
  function find(s,list,id){const row=s[list]?.find(x=>x.id===id);requireThat(row,'That entry is no longer available.');return row;}
  function progress(s,m){
    const checked=m.steps.filter((_,i)=>m.checks[i]).length;
    const visits=s.visits.filter(v=>v.mission===m.id);
    const rated=visits.filter(v=>people.every(p=>v.ratings[p]!==undefined));
    const distinct=new Set((m.bothRate?rated:visits).map(placeKey)).size;
    const evidence=!m.evidence||m.people.every(p=>!!m.notes[p]?.trim());
    const goal=tastingGoal(m),favourite=(m.bothRate?rated:visits).find(v=>v.id===m.favouriteVisit);
    const goalReached=goal==='forever'?false:goal==='favourite'?!!favourite:!m.target||distinct>=m.target;
    const ready=checked===m.steps.length&&goalReached&&evidence&&(!m.prerequisite||s.missions.some(x=>x.id===m.prerequisite&&x.status==='completed'));
    return {checked,total:m.steps.length,distinct,evidence,ready,goal,goalReached};
  }
  function command(state,actor,c,now=new Date()){
    requireThat(people.includes(actor),'Sign in to your own home first.');
    requireThat(c&&typeof c.id==='string'&&/^[\w-]{8,80}$/.test(c.id),'This change needs a valid identifier.');
    requireThat(c.data&&typeof c.data==='object','Invalid change.');
    if(state.applied.includes(c.id))return state;
    const s=copy(state),d=c.data,stamp=now.toISOString();s.life=life(s);
    switch(c.type){
      case 'restore':{
        const p=restorations.find(p=>p.id===d.project);requireThat(p,'Choose a castle project.');
        requireThat(storySeeds(s).length>=p.threshold,'A few more completed adventures will open this project.');
        requireThat(!s.life.builds[p.id],'This part of the castle is already restored.');
        s.life.builds[p.id]={author:actor,at:stamp};break;
      }
      case 'plant':{
        requireThat(s.life.builds.garden,'Restore the memory garden first.');
        requireThat(storySeeds(s).some(x=>x.id===d.source),'Choose one of your completed chapters.');
        requireThat(!s.life.flowers.some(f=>f.source===d.source),'This memory already has a flower.');
        requireThat(['daisy','sunflower','bluebell'].includes(d.species),'Choose a flower.');
        s.life.flowers.push({id:c.id,source:d.source,species:d.species,author:actor,notes:{[actor]:text(d.note||'',500)},at:stamp});break;
      }
      case 'garden-note':{
        const f=s.life.flowers.find(f=>f.id===d.id);requireThat(f,'That flower is no longer here.');f.notes[actor]=required(d.note,500);break;
      }
      case 'comfort':{
        requireThat(Object.hasOwn(comforts,d.kind),'Choose a little way to be there.');
        requireThat(d.day===day(now)&&s.moods[d.day+':'+other(actor)],'Your partner needs a check-in for today first.');
        const entry={id:c.id,author:actor,to:other(actor),day:day(now),kind:d.kind,at:stamp};
        const i=s.life.responses.findIndex(x=>x.author===actor&&x.day===entry.day);
        if(i<0)s.life.responses.push(entry);else s.life.responses[i]=entry;break;
      }
      case 'ruby-play':{
        requireThat(d.rounds===3&&Number.isInteger(d.accurate)&&d.accurate>=0&&d.accurate<=3,'Finish three throws to keep this playtime.');
        const previous=s.life.ruby[actor];s.life.ruby[actor]={plays:(previous?.plays||0)+1,best:Math.max(previous?.best||0,d.accurate),first:previous?.first||stamp,last:stamp};break;
      }
      case 'mood':{
        requireThat(moods.includes(d.mood),'Choose the mood that feels closest.');
        requireThat(!d.need||needs.includes(d.need),'Choose what would feel good.');
        requireThat(!d.energy||['Low','Medium','High'].includes(d.energy),'Choose your energy.');
        s.moods[day(now)+':'+actor]={author:actor,day:day(now),mood:d.mood,need:d.need||'',energy:d.energy||'',note:text(d.note||'',500),updated:stamp};break;
      }
      case 'visit':{
        if(d.mission){const m=find(s,'missions',d.mission);requireThat(m.people.includes(actor)&&m.status==='active'&&missionKind(m)==='tasting','Choose an active taste-test mission you joined.');requireThat(!m.category||m.category==='Any'||m.category===d.category,'This item does not match the mission’s tasting category.');}
        requireThat(date(d.day)&&d.day<=day(now),'Choose a real visit date, today or earlier.');
        requireThat(['Coffee','Food','Other'].includes(d.category),'Choose an item category.');
        const scored=d.score!==undefined&&d.score!==null&&d.score!=='';
        s.visits.push({id:c.id,author:actor,venue:required(d.venue),area:text(d.area||'',100),item:required(d.item),category:d.category,day:d.day,mission:d.mission||null,ratings:scored?{[actor]:rating(d.score)}:{},notes:{[actor]:text(d.note||'',300)}});break;
      }
      case 'link-visit':{
        const v=find(s,'visits',d.visit),m=find(s,'missions',d.mission);
        requireThat(m.people.includes(actor)&&m.status==='active'&&missionKind(m)==='tasting','Choose an active taste-test mission you joined.');
        requireThat(!v.mission||v.mission===m.id,'That tasting already belongs to another mission.');
        requireThat(!m.category||m.category==='Any'||m.category===v.category,'This item does not match the mission’s tasting category.');v.mission=m.id;break;
      }
      case 'rate':{
        const v=find(s,'visits',d.id);v.ratings[actor]=rating(d.score);v.notes[actor]=text(d.note||'',300);v.again={...v.again,[actor]:!!d.again};break;
      }
      case 'favourite':{
        const m=find(s,'missions',d.id),v=find(s,'visits',d.visit);
        requireThat(m.status==='active'&&m.people.includes(actor)&&tastingGoal(m)==='favourite','Choose a favourite for an active search you joined.');
        requireThat(v.mission===m.id,'Choose a tasting from this mission.');
        requireThat(!m.bothRate||people.every(p=>v.ratings[p]!==undefined),'Both of you need to rate this tasting first.');
        m.favouriteVisit=v.id;break;
      }
      case 'mission':{
        requireThat(['me','partner','both'].includes(d.who),'Choose who this mission is for.');
        const participants=d.who==='me'?[actor]:d.who==='partner'?[other(actor)]:people.slice();
        const kind=d.kind||(d.target?'tasting':'custom');requireThat(missionKinds.includes(kind),'Choose a mission type.');
        const goal=kind==='tasting'?(d.goal||'places'):null;
        requireThat(!goal||tastingGoals.includes(goal),'Choose a set number, a favourite search, or an ongoing quest.');
        const steps=(d.steps||[]).map(x=>required(x,140));requireThat((steps.length>0||kind==='tasting')&&steps.length<=12,kind==='tasting'?'Keep any final steps to twelve or fewer.':'Add between one and twelve steps.');
        requireThat(Number.isInteger(d.target)&&d.target>=0&&d.target<=30,'The tasting target must be between 0 and 30.');
        requireThat(kind==='tasting'?(goal==='places'?d.target>0:d.target===0):!d.target&&!d.bothRate,'Use a place count only for a taste test with a set number of places.');
        const category=kind==='tasting'?(d.category||'Any'):null;requireThat(!category||['Coffee','Food','Any'].includes(category),'Choose coffee, food, or either.');
        requireThat(!d.due||date(d.due),'Choose a valid target date.');
        requireThat(['once','weekly','monthly'].includes(d.repeat||'once'),'Choose a repeat schedule.');
        if(d.prerequisite)find(s,'missions',d.prerequisite);
        s.missions.push({id:c.id,kind,goal,category,favouriteVisit:null,author:actor,title:required(d.title),description:text(d.description||'',800),people:participants,steps,checks:{},notes:{},target:d.target,bothRate:!!d.bothRate,evidence:goal!=='forever'&&!!d.evidence,confirm:goal!=='forever'&&!!d.confirm,due:goal==='forever'?'':d.due||'',repeat:goal==='forever'?'once':d.repeat||'once',prerequisite:goal==='forever'?null:d.prerequisite||null,accepted:participants.includes(actor)?[actor]:[],status:participants.every(p=>p===actor)?'active':'proposed',created:stamp,version:3});break;
      }
      case 'accept':{
        const m=find(s,'missions',d.id);requireThat(m.people.includes(actor)&&m.status==='proposed','Only an invited participant can accept.');
        if(!m.accepted.includes(actor))m.accepted.push(actor);if(m.people.every(p=>m.accepted.includes(p)))m.status='active';break;
      }
      case 'decline':{
        const m=find(s,'missions',d.id);requireThat(m.people.includes(actor)&&m.status==='proposed','Only an invited participant can decline.');m.status='declined';break;
      }
      case 'step':{
        const m=find(s,'missions',d.id);requireThat(m.status==='active'&&m.people.includes(actor),'Join this mission before updating it.');
        requireThat(Number.isInteger(d.index)&&d.index>=0&&d.index<m.steps.length,'Choose a valid step.');m.checks[d.index]=d.done?{author:actor,at:stamp}:null;break;
      }
      case 'mission-note':{
        const m=find(s,'missions',d.id);requireThat(m.people.includes(actor)&&m.status==='active','Join this mission before adding a note.');m.notes[actor]=required(d.note,800);break;
      }
      case 'complete':{
        const m=find(s,'missions',d.id);requireThat(m.status==='active'&&m.people.includes(actor),'Only an active participant can finish this mission.');requireThat(tastingGoal(m)!=='forever','This quest stays open. Its creator can archive it when you are ready.');requireThat(progress(s,m).ready,'There are still mission rules to finish.');
        m.submittedBy=actor;m.status=m.confirm?'awaiting':'completed';if(!m.confirm)m.completed=stamp;break;
      }
      case 'confirm':{
        const m=find(s,'missions',d.id);requireThat(m.status==='awaiting'&&actor!==m.submittedBy,'The other person confirms this completion.');m.status='completed';m.completed=stamp;break;
      }
      case 'archive':{
        const m=find(s,'missions',d.id);requireThat(m.author===actor&&m.status!=='completed','Only the creator can archive an unfinished mission.');m.status='archived';break;
      }
      case 'award':{
        const m=find(s,'missions',d.id);requireThat(m.status==='completed'&&m.people.includes(other(actor)),'Award a completed mission your partner took part in.');
        requireThat(!s.awards.some(x=>x.mission===m.id&&x.author===actor),'You have already recognised this mission.');
        requireThat(Number.isInteger(d.points)&&d.points>=1&&d.points<=50,'Choose 1 to 50 tokens.');
        s.awards.push({id:c.id,mission:m.id,author:actor,recipient:other(actor),points:d.points,reason:required(d.reason,300),at:stamp});break;
      }
      case 'letter':s.letters.push({id:c.id,author:actor,to:other(actor),title:required(d.title),body:required(d.body,3000),at:stamp,read:false});break;
      case 'read-letter':{const l=find(s,'letters',d.id);requireThat(l.to===actor,'This letter is addressed to your partner.');l.read=true;break;}
      case 'idea':s.ideas.push({id:c.id,author:actor,title:required(d.title),note:text(d.note||'',600),interested:[],at:stamp});break;
      case 'interest':{const i=find(s,'ideas',d.id);i.interested=i.interested.includes(actor)?i.interested.filter(p=>p!==actor):[...i.interested,actor];break;}
      case 'memory':requireThat(['date1','date2','date3','pearl'].includes(d.id),'Choose a memory.');s.memories[d.id]={...s.memories[d.id],[actor]:text(d.note,1800)};break;
      case 'taste':s.preferences[actor]=text(d.note,1200);break;
      case 'duck-name':requireThat(actor==='south','The princess gets to name her little duckling.');s.duckName=required(d.name,40);break;
      case 'gesture':requireThat(['Flowers','A little note','A bench invitation'].includes(d.kind),'Choose a little gesture.');s.gestures.push({id:c.id,author:actor,to:other(actor),kind:d.kind,note:text(d.note||'',300),at:stamp});break;
      case 'place':requireThat(['throne','crown','lantern'].includes(d.item)&&['north','south','castle'].includes(d.place),'Choose a keepsake and a home.');s.placements[d.item]=d.place;break;
      case 'capsule':{
        requireThat(date(d.opens)&&d.opens>day(now),'Choose a future opening day.');
        s.capsules.push({id:c.id,author:actor,title:required(d.title),opens:d.opens,entries:{[actor]:required(d.body,2000)},at:stamp});break;
      }
      case 'capsule-note':{const x=find(s,'capsules',d.id);requireThat(x.opens>day(now),'This capsule is already open.');x.entries[actor]=required(d.body,2000);break;}
      default:throw new Error('That action is not supported.');
    }
    for(const key of collection)requireThat(s[key].length<=2000,'The journal is full. Export your memories before adding more.');
    requireThat(s.life.flowers.length<=2000&&s.life.responses.length<=5000,'This part of the journal is full. Export your memories before adding more.');
    s.applied.push(c.id);s.revision++;return s;
  }
  function visible(state,now=new Date()){
    const s=copy(state);delete s.applied;
    s.capsules.forEach(x=>{x.contributors=Object.keys(x.entries);if(x.opens>day(now)){delete x.entries;x.sealed=true;}});return s;
  }
  return {people,names,moods,needs,missionKinds,missionKind,tastingGoals,tastingGoal,placeKey,restorations,comforts,life,storySeeds,story,day,other,initial,command,progress,visible,date};
});
