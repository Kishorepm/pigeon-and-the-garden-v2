(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomModel=factory();})(globalThis,function(){
  'use strict';
  const people=['north','south'];
  const names={north:'North · the knight',south:'South · the princess'};
  const moods=['Content','Excited','Tender','Tired','Low','Overwhelmed'];
  const needs=['A little company','Encouragement','A chat','Some quiet','Nothing in particular'];
  const missionKinds=['tasting','date','kindness','custom'];
  const missionKind=m=>m.kind||(m.target?'tasting':'custom');
  const placeKey=v=>[v.venue,v.area].filter(Boolean).join(' · ').trim().replace(/\s+/g,' ').toLowerCase();
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
    const ready=checked===m.steps.length&&(!m.target||distinct>=m.target)&&evidence&&(!m.prerequisite||s.missions.some(x=>x.id===m.prerequisite&&x.status==='completed'));
    return {checked,total:m.steps.length,distinct,evidence,ready};
  }
  function command(state,actor,c,now=new Date()){
    requireThat(people.includes(actor),'Sign in to your own home first.');
    requireThat(c&&typeof c.id==='string'&&/^[\w-]{8,80}$/.test(c.id),'This change needs a valid identifier.');
    requireThat(c.data&&typeof c.data==='object','Invalid change.');
    if(state.applied.includes(c.id))return state;
    const s=copy(state),d=c.data,stamp=now.toISOString();
    switch(c.type){
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
      case 'mission':{
        requireThat(['me','partner','both'].includes(d.who),'Choose who this mission is for.');
        const participants=d.who==='me'?[actor]:d.who==='partner'?[other(actor)]:people.slice();
        const kind=d.kind||(d.target?'tasting':'custom');requireThat(missionKinds.includes(kind),'Choose a mission type.');
        const steps=(d.steps||[]).map(x=>required(x,140));requireThat((steps.length>0||kind==='tasting')&&steps.length<=12,kind==='tasting'?'Keep any final steps to twelve or fewer.':'Add between one and twelve steps.');
        requireThat(Number.isInteger(d.target)&&d.target>=0&&d.target<=30,'The tasting target must be between 0 and 30.');
        requireThat(kind==='tasting'?d.target>0:!d.target&&!d.bothRate,'Place targets and tasting ratings belong to taste-test missions.');
        const category=kind==='tasting'?(d.category||'Any'):null;requireThat(!category||['Coffee','Food','Any'].includes(category),'Choose coffee, food, or either.');
        requireThat(!d.due||date(d.due),'Choose a valid target date.');
        requireThat(['once','weekly','monthly'].includes(d.repeat||'once'),'Choose a repeat schedule.');
        if(d.prerequisite)find(s,'missions',d.prerequisite);
        s.missions.push({id:c.id,kind,category,author:actor,title:required(d.title),description:text(d.description||'',800),people:participants,steps,checks:{},notes:{},target:d.target,bothRate:!!d.bothRate,evidence:!!d.evidence,confirm:!!d.confirm,due:d.due||'',repeat:d.repeat||'once',prerequisite:d.prerequisite||null,accepted:participants.includes(actor)?[actor]:[],status:participants.every(p=>p===actor)?'active':'proposed',created:stamp,version:2});break;
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
        const m=find(s,'missions',d.id);requireThat(m.status==='active'&&m.people.includes(actor),'Only an active participant can finish this mission.');requireThat(progress(s,m).ready,'There are still mission rules to finish.');
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
    s.applied.push(c.id);s.revision++;return s;
  }
  function visible(state,now=new Date()){
    const s=copy(state);delete s.applied;
    s.capsules.forEach(x=>{x.contributors=Object.keys(x.entries);if(x.opens>day(now)){delete x.entries;x.sealed=true;}});return s;
  }
  return {people,names,moods,needs,missionKinds,missionKind,placeKey,day,other,initial,command,progress,visible,date};
});
