/* The illustrated second chapter. One in-memory journey, local assets only. */
(function () {
  'use strict';
  const D = window.GardenData;
  const engine = window.anime;
  const app = document.getElementById('chapter');
  const host = document.getElementById('scene-host');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const query = new URLSearchParams(location.search);
  const start = local && /^\d$/.test(query.get('scene') || '') ? Number(query.get('scene')) : 0;
  const state = {
    scene: start, picks: D.initial(), editing: false, auxiliary: null, previous: start,
    paused: motionQuery.matches || (local && query.get('motion') === 'off'),
    locked: false, left: false, sealed: '', submitted: '', status: 'idle', request: 0
  };
  // Screen review starts from a plausible plan; the normal entry has no preselected answers.
  if (start > 0) Object.assign(state.picks, {place:'garden',day:'sat',hour:'evening',duration:'relaxed',food:'both',crown:'flowers'});
  let sceneAnimations = [], ambient = [], advanceTimer = 0, currentWorld = 'garden';
  const titleForPlace = {garden:'A table in<br>the garden.',animals:'Good company.<br>Birds included.',indoors:'Somewhere<br>quiet. Together.',any:'Dinner.<br>And good company.'};
  const placeShort = {garden:'A garden table',animals:'Animals nearby',indoors:'Quiet, indoors',any:'A place I’ll choose'};
  const dayShort = {fri:'Friday',sat:'Saturday',next:'Next week',any:'A day I’ll choose'};
  const hourShort = {morning:'morning',afternoon:'afternoon',evening:'evening',any:'time to be arranged'};
  const foodShort = {sweet:'Something sweet',savoury:'Something savoury',both:'Both, obviously',any:'Something I’ll choose'};
  const arrow = '<span aria-hidden="true">→</span>';
  const svg = (body, view='0 0 80 80') => `<svg viewBox="${view}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const crown = kind => svg(kind === 'flowers'
    ? '<path d="M9 55q31-16 62 0v10H9z" fill="#849365" stroke="#536347"/><path d="M13 52q27-21 54 0"/><g fill="#d4a386"><path d="m20 40 4-6 4 6 7 2-6 5-1 7-6-4-7 2 1-7-4-5z"/><path d="m51 37 4-6 4 6 7 2-6 5-1 7-6-4-7 2 1-7-4-5z"/></g><circle cx="24" cy="43" r="3" fill="#f1d59b"/><circle cx="55" cy="40" r="3" fill="#f1d59b"/>'
    : '<path d="M10 24 25 40 40 17 55 40 70 24 64 63H16Z" fill="#d3ab5a"/><path d="M17 56h47M25 42l3 11M40 29v23M55 42l-3 11"/><circle cx="10" cy="23" r="3" fill="#efd799"/><circle cx="40" cy="16" r="3" fill="#efd799"/><circle cx="70" cy="23" r="3" fill="#efd799"/><path d="m40 56 4 4-4 4-4-4z" fill="#a76340"/>');
  const food = kind => svg('<ellipse cx="40" cy="64" rx="33" ry="8"/><path d="M11 64h58"/>' + (kind==='sweet'
    ? '<path d="M19 33h42v30H19z" fill="#c9a576"/><path d="M19 42h42M19 50h42" stroke="#f3e4c7" stroke-width="5"/><path d="M17 33q4-13 10-5 6-13 13-5 8-9 13 3 11-6 11 7" fill="#f3e4c7"/><path d="M39 22v-9"/><path d="M39 15q5-10 10-3-1 8-10 3" fill="#aa6850"/>'
    : kind==='savoury' ? '<path d="M17 43q5-25 23-25t23 25Z" fill="#be935d"/><path d="m20 47 8-4 12 5 11-5 10 4v7H20Z" fill="#78875c"/><path d="M18 56h44l-5 7H23Z" fill="#c39862"/><path d="m30 29 2-2m9 4 2-2m7 7 2-2"/>'
    : '<path d="M12 42h27v19H12z" fill="#cea27c"/><path d="M11 42q5-9 9-5 8-7 10 1 6-5 10 4" fill="#f3e4c7"/><path d="M45 49q3-16 13-16t12 16Z" fill="#c59b62"/><path d="M45 54h25v7H45Z" fill="#76845a"/>'));
  const drink = svg('<path d="M22 22h36l-5 48H27z" fill="#e4c89a"/><path d="m44 40 9-34M51 8h15"/><path d="m30 30 9 1-1 9-9-1zm11 12 9 1-1 9-9-1zm-11 9 8 1-1 9-8-1z" fill="#f5ebd4"/>');
  const heading = (label,title,intro='') => `<header class="scene-heading"><p class="eyebrow">${label}</p><h1 id="scene-title">${title}</h1>${intro?`<p class="scene-intro">${intro}</p>`:''}</header>`;
  const primary = (text,action='next',disabled=false) => `<button class="primary" type="button" data-action="${action}"${disabled?' disabled':''}>${text} ${arrow}</button>`;
  const backToCard = () => state.editing ? '<button type="button" class="edit-return" data-action="card">Back to your invitation</button>' : '';
  const section = (name,content) => `<section class="scene scene-${name}" tabindex="-1" aria-labelledby="scene-title">${content}</section>`;
  const pick = (field,value,label,body,cls='') => `<button type="button" class="${cls}" data-pick="${field}" data-value="${value}" aria-label="${label}" aria-pressed="${state.picks[field]===value}">${body}</button>`;
  const val = (map,key,fallback) => map[key] || fallback;
  function template(n) {
    switch(n) {
      case 0: return section('prologue',heading('A NEW CHAPTER','The road<br>continues.','A good beginning behind us.<br>Something lovely still ahead.') + `<footer class="scene-footer"><p class="prelude">Same pigeon. A new stretch of path.</p>${primary('Walk on to Stop 02')}<p class="footnote">And this time, there will be food.</p></footer>`);
      case 1: return section('note',heading('A NOTE FROM THE OTHER SIDE','One thing<br>is unfinished.') + `<article class="paper"><p class="eyebrow">AMBURY · SATURDAY</p><h2>We forgot the food.</h2><p>The day ran long. You named birds I couldn’t see. And the meal never happened.</p><span class="note-rule"></span><p>I’d like another afternoon like that.<br>With a table this time.</p><div class="inherited-line"><span>Iced, still</span><span>The green, corrected</span><span>Your first ban stands</span></div></article><footer class="scene-footer">${primary('Let’s make a plan')}<button class="text-button" type="button" data-action="leave">Not this time</button></footer>`);
      case 2: return section('setting',heading('01 / THE NEW PLAN','Where shall<br>we end up?','Three paths. One table for two.') + `<div class="choices">${[
        ['garden','A garden table','A little greenery. A little time.'],['animals','Animals nearby','You can name the birds again.'],['indoors','Quiet, indoors','Somewhere cosy. No weather required.']
      ].map(([v,t,s])=>pick('place',v,t,`<span class="setting-thumb thumb-${v}" aria-hidden="true"></span><span><b>${t}</b><small>${s}</small></span><span class="arrow" aria-hidden="true">›</span>`,'setting-option')).join('')}</div><footer class="scene-footer"><button type="button" class="text-button" data-pick="place" data-value="any">You choose the place</button>${backToCard()}</footer>`);
      case 3: return section('planning',heading('02 / A LITTLE TIME','A day.<br>Room for us.','The exact hour can follow by text.') + `<div class="paper planning-paper"><fieldset><legend>The day</legend><div class="segmented">${[['fri','FRI','after work'],['sat','SAT','again?'],['next','NEXT','week'],['any','ANY','you choose']].map(([v,t,s])=>pick('day',v,dayShort[v],`<b>${t}</b><small>${s}</small>`)).join('')}</div></fieldset><fieldset><legend>The light</legend><div class="segmented times">${[['morning','Morning'],['afternoon','Afternoon'],['evening','Evening'],['any','You choose']].map(([v,t])=>pick('hour',v,t,t)).join('')}</div></fieldset><details id="duration-details"><summary>How long? <span id="duration-label">${D.options.duration[state.picks.duration]}</span></summary><div class="duration-options">${[['short','45 minutes'],['relaxed','An hour or two'],['open','Until we have to go'],['any','You choose']].map(([v,t])=>pick('duration',v,t,t)).join('')}</div></details></div><footer class="scene-footer">${primary(state.editing?'Save the timing':'That sounds good',state.editing?'card':'next',!D.planReady(state.picks))}<p class="selection-hint" id="selection-hint">${D.planReady(state.picks)?'Nothing more exact than that, for now.':'Choose a day and a time of day.'}</p>${backToCard()}</footer>`);
      case 4: return section('food',heading('03 / THE IMPORTANT AMENDMENT','This time,<br>we eat.','A very small menu. A much better plan.') + `<div class="paper menu-paper"><div class="menu-caption">What are we ordering?</div><div class="menu-options">${[['sweet','Sweet','For the good part.'],['savoury','Savoury','An actual meal.'],['both','Both','Obviously.']].map(([v,t,s])=>pick('food',v,t,`${food(v)}<b>${t}</b><small>${s}</small>`,'menu-choice')).join('')}</div><div class="menu-foot">${drink}<span>Iced is already on the order.</span></div></div><footer class="scene-footer"><button class="text-button" type="button" data-pick="food" data-value="any">You choose the food</button><p class="footnote">White chocolate remains off the menu.</p>${backToCard()}</footer>`);
      case 5: return section('crossing',heading('THE PATH BETWEEN','A little<br>further along.','Stop 01 is behind us.<br>This part of the garden is new.') + `<footer class="scene-footer"><p class="crossing-phrase">The pigeon knows the way.</p>${primary('Follow the path')}<p class="footnote">The rest of the road is still hidden.<br>Some things can wait.</p></footer>`);
      case 6: return section('arrival',heading('04 / SOMETHING HAS CHANGED','A table.<br>At last.','Two places. No unfinished meal.') + `<button class="small-find" data-action="tortoise" type="button" aria-expanded="false">A small visitor in the garden ↗</button><div class="discovery-note" id="discovery" hidden><span class="pixel-tortoise" aria-hidden="true">${svg('<path d="M12 45q1-22 27-22t29 22v12H12Z" fill="#849365"/><path d="m24 30 14 12 16-13M38 42v14M12 45h56"/><path d="M10 44H2v10h10m8 3v9m37-9v9"/><circle cx="5" cy="47" r="1"/>')}</span><p>The tortoise is in no hurry.<br>Its anatomy lesson can wait for another stop.</p></div><footer class="scene-footer"><p class="arrival-note"><span>Still no roof on the castle.</span>But there is somewhere to sit now.</p>${primary('One finishing touch')}</footer>`);
      case 7: return section('crown',heading('05 / A SMALL CEREMONY','Already<br>your throne.','This is the new part. Entirely optional.') + `<div class="paper crown-paper"><div class="crown-options">${[['gold','The gold one'],['small','The small one'],['flowers','Made of flowers']].map(([v,t])=>pick('crown',v,t,`${crown(v)}<span>${t}</span>`,'crown-option')).join('')}</div></div><footer class="scene-footer"><button type="button" class="text-button" data-pick="crown" data-value="none">Perfectly fine without a crown</button>${backToCard()}</footer>`);
      case 8: return decree();
      case 9: return ending();
      default: return template(0);
    }
  }
  function decree() {
    const rows = [
      ['Place',val(placeShort,state.picks.place,'A place I’ll choose'),2],
      ['When',`${val(dayShort,state.picks.day,'A day I’ll choose')} · ${val(hourShort,state.picks.hour,'time to be arranged')}`,3],
      ['Food',`${val(foodShort,state.picks.food,'Something I’ll choose')} · iced to drink`,4]
    ];
    return section('decree',`<article class="paper decree-paper"><header class="decree-top"><p class="eyebrow">THE PIGEON & THE GARDEN<br>A SECOND CHAPTER</p><span class="decree-stop">02</span></header><h1 id="scene-title">${titleForPlace[state.picks.place]||titleForPlace.any}</h1><p class="decree-sub">An invitation, made yours.</p><div class="decree-rows">${rows.map(([label,value,n])=>`<button class="decree-row" data-edit="${n}" type="button" aria-label="Edit ${label.toLowerCase()}"><span class="row-label">${label}</span><span class="row-value">${value}</span><span class="row-edit" aria-hidden="true">↗</span></button>`).join('')}</div><p class="decree-note">I liked the first one.<br>I’d really like another.<br>On time, and with food.</p><button class="decree-details" data-action="details" type="button">The little details, and what carries forward ↗</button><div class="seal-area"><button class="seal" type="button" data-action="seal" aria-label="Seal this invitation"${!D.ready(state.picks)?' disabled':''}>SEAL</button><p><strong>A table for two.</strong>Press the seal to send your plan.</p></div></article><footer class="scene-footer"><p class="footnote">You can change your choices before or after sealing.</p></footer>`);
  }
  function deliveryCopy() {
    if (local) return 'A local preview. No message has been sent.';
    if (state.status==='success') return 'The pigeon delivered your note.';
    if (state.status==='failed') return 'The pigeon couldn’t deliver the note. Your choices are still here.';
    return 'The pigeon is carrying your note…';
  }
  function ending() {
    return section('ending',heading('STOP 02 / STAMPED','A second chapter.<br>Yours, now.') + `<div class="completion-badge" aria-label="Stop 02 sealed">${state.picks.crown!=='none'?`<span class="badge-crown">${crown(state.picks.crown)}</span>`:''}02</div><footer class="scene-footer"><p class="ending-plan">${val(dayShort,state.picks.day,'A day to be chosen')}. ${val(foodShort,state.picks.food,'Something good')}.</p><p class="ending-caption">I’ll text you to fix the hour.<br>The address will come with it.</p><p class="delivery-status" id="delivery-status" role="status">${deliveryCopy()}</p><button class="retry-delivery" type="button" data-action="retry"${state.status==='failed'?'':' hidden'}>Try sending again</button>${primary('See your invitation','card')}<div class="ending-actions"><button class="text-button" type="button" data-action="edit">Change something</button></div><p class="next-chapter">03 · STILL A LITTLE FURTHER DOWN THE ROAD</p></footer>`);
  }
  function details() {
    const select = (field,label) => `<label for="detail-${field}">${label}</label><select id="detail-${field}" data-select="${field}">${Object.entries(D.options[field]).map(([v,t])=>`<option value="${v}"${state.picks[field]===v?' selected':''}>${t}</option>`).join('')}</select>`;
    return section('details',heading('THE LITTLE DETAILS','Already part<br>of the story.') + `<div class="paper"><p class="detail-caption">Iced drinks. The green, corrected. Your first ban still stands.</p>${select('escort','Company on the path')}${select('duration','How long we stay')}${select('tortoise','The promised tortoise lesson')}<button class="text-button" type="button" data-edit="7">Change the crown ↗</button></div><footer class="scene-footer">${primary('Back to your invitation','card')}</footer>`);
  }
  function exitView(final) {
    return section('exit',`<article class="paper"><p class="eyebrow">THE GARDEN STAYS</p><h1 id="scene-title">${final?'That is a<br>complete answer.':'Leave it<br>here for now?'}</h1><p>${final?'No appeal. No awkward follow-up.<br>You can close this tab. We’re good.':'You don’t have to finish the invitation.<br>It is fine to leave the path here.'}</p></article>${final?'':`<footer class="scene-footer">${primary('Stay in the garden','stay')}<button class="text-button" data-action="decline" type="button">Leave this invitation</button></footer>`}`);
  }
  function stopScenes() {
    clearTimeout(advanceTimer);
    state.locked=false;
    sceneAnimations.forEach(a=>a.cancel());sceneAnimations=[];
  }
  function animate(target,params) {
    if (state.paused || !engine) return null;
    const a=engine.animate(target,params);sceneAnimations.push(a);return a;
  }
  function getWorld(n) {
    if (n>=6 && n<=9) return state.picks.place==='indoors'?'indoor':'table';
    return n>=3?'bridge':'garden';
  }
  function updateWorld(n) {
    const next=getWorld(n);
    document.querySelector('.milestone-two').style.opacity='';
    document.querySelectorAll('.world-image').forEach(img=>{
      if(img.dataset.world===next && !img.src) img.src=img.dataset.src;
      img.classList.toggle('is-current',img.dataset.world===next);
    });
    const image=document.querySelector(`[data-world="${next}"]`);
    if (currentWorld!==next || n===0 || n===5) animate(image,{scale:[1.09,1.025],duration:1800,ease:'out(3)'});
    currentWorld=next;
    document.querySelector('.halo-one').style.top=next==='table'?'33%':'43%';
    document.querySelector('.halo-two').style.top=next==='table'?'25%':'35%';
    document.querySelectorAll('.table-food,.table-crown').forEach(e=>e.remove());
    if (n===6 || n===9) {
      const world=document.querySelector('.world');
      const serving=document.createElement('div');serving.className='table-food';serving.innerHTML=food(state.picks.food||'both');
      if(next==='indoor')serving.style.top='60%';world.append(serving);

    }
    const messenger=document.getElementById('messenger');
    messenger.style.transform='';messenger.style.opacity='';messenger.style.left='';messenger.style.top='';
  }
  function entrance(n) {
    if(state.paused || !engine)return;
    const tl=engine.createTimeline({defaults:{ease:'out(4)',duration:550}});
    tl.add(host.querySelector('.scene-heading')||host.querySelector('.paper'),{opacity:[0,1],y:[14,0]},0);
    const content=host.querySelector('.choices,.planning-paper,.menu-paper,.crown-paper');
    if(content)tl.add(content,{opacity:[0,1],y:[18,0]},90);
    const foot=host.querySelector('.scene-footer');if(foot)tl.add(foot,{opacity:[0,1],y:[12,0]},160);
    sceneAnimations.push(tl);
    if(n===0)animate('.milestone-two',{opacity:[0,1],scale:[.9,1],delay:400,duration:600,ease:'out(3)'});
    if(n===5 && engine.svg){
      const messenger=document.getElementById('messenger');messenger.style.left='0px';messenger.style.top='0px';
      animate(messenger,{...engine.svg.createMotionPath('#new-path'),duration:2600,ease:'inOut(2)'});
    }
    if(n===9){
      animate('.completion-badge',{scale:[1.35,1],rotate:[-8,0],opacity:[0,1],duration:600,ease:'out(4)'});
      animate('#messenger',{x:[0,app.clientWidth*.78],y:[0,-app.clientHeight*.5],scale:[1,.25],rotate:[0,-12],opacity:[1,0],delay:700,duration:2100,ease:'in(2)'});
      animate('.lantern-halo',{opacity:[.2,.95],delay:engine.stagger(180),duration:1000,ease:'out(3)'});
    }
  }
  function render(focus=true) {
    stopScenes();app.dataset.scene=String(state.scene);
    host.innerHTML=state.auxiliary==='details'?details():state.auxiliary==='leave'?exitView(false):state.left?exitView(true):template(state.scene);
    const back=document.getElementById('back'),leave=document.getElementById('leave');
    back.hidden=state.scene===0||state.left;leave.hidden=state.scene===0||!!state.sealed||state.left||state.auxiliary==='leave';
    document.querySelector('.topbar').classList.toggle('has-nav',!back.hidden);
    document.getElementById('progress').hidden=state.scene===0||state.left||!!state.auxiliary;
    document.getElementById('progress-fill').style.width=(state.scene/9*100)+'%';
    document.getElementById('progress').setAttribute('aria-label',`Step ${state.scene+1} of 10, from Stop 01 to Stop 02`);
    updateWorld(state.scene);
    if(!state.auxiliary&&!state.left)entrance(state.scene);
    if(focus)host.querySelector('.scene').focus({preventScroll:true});
    document.getElementById('announcement').textContent='';
  }
  function go(n,fromHistory=false) {
    if(state.left)return;
    n=Math.max(0,Math.min(9,n));state.scene=n;state.auxiliary=null;
    if(!fromHistory)try{history.pushState({chapterTwo:true,scene:n},'');}catch{}
    render();
  }
  function updatePlan() {
    host.querySelectorAll('[data-pick]').forEach(el=>el.setAttribute('aria-pressed',String(state.picks[el.dataset.pick]===el.dataset.value)));
    const main=host.querySelector('.primary');if(main)main.disabled=!D.planReady(state.picks);
    document.getElementById('selection-hint').textContent=D.planReady(state.picks)?'Nothing more exact than that, for now.':'Choose a day and a time of day.';
    document.getElementById('duration-label').textContent=D.options.duration[state.picks.duration];
  }
  function savePick(button) {
    if(state.locked||!D.choose(state.picks,button.dataset.pick,button.dataset.value))return;
    if(state.scene===3){updatePlan();return;}
    state.locked=true;button.setAttribute('aria-pressed','true');
    animate(button,{scale:[1,.98,1],duration:180,ease:'out(3)'});
    const destination=state.editing?8:state.scene+1;
    advanceTimer=setTimeout(()=>{state.locked=false;go(destination);},state.paused?0:180);
  }
  async function deliver(snapshot = {...state.picks}) {
    const fingerprint=D.fingerprint(snapshot);
    if(state.status==='pending'){state.queued=snapshot;return;}
    if(state.status==='success'&&state.submitted===fingerprint)return;
    const request=++state.request;
    state.status='pending';
    if(local){state.status='preview';updateDelivery();return;}
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice:'sealed',picks:D.payload(snapshot),updated:!!state.submitted}),signal:controller.signal});
      if(!response.ok)throw new Error('Delivery failed');
      if(request===state.request){state.status='success';state.submitted=fingerprint;}
    }catch{if(request===state.request)state.status='failed';}
    finally{clearTimeout(timeout);updateDelivery();if(state.queued){const queued=state.queued;state.queued=null;deliver(queued);}}
  }
  function updateDelivery(){
    const status=document.getElementById('delivery-status');if(status)status.textContent=deliveryCopy();
    const retry=host.querySelector('[data-action="retry"]');if(retry){retry.hidden=state.status!=='failed';retry.disabled=state.status==='pending';}
  }
  function seal() {
    if(state.locked||!D.ready(state.picks))return;
    state.locked=true;state.sealed=D.fingerprint(state.picks);state.editing=false;
    const btn=host.querySelector('.seal');btn.disabled=true;btn.textContent='SEALED';btn.setAttribute('aria-label','Invitation sealed');
    animate(btn,{scale:[1,.82,1],rotate:[0,-5,0],duration:380,ease:'out(3)'});
    deliver();
    advanceTimer=setTimeout(()=>{state.locked=false;go(9);},state.paused?0:520);
  }
  function auxiliary(name){state.previous=state.scene;state.auxiliary=name;render();}
  function handleAction(action) {
    if(state.locked||state.left)return;
    if(action==='next'){if(state.scene===3&&!D.planReady(state.picks))return;go(state.scene+1);}
    if(action==='card'){state.auxiliary=null;go(8);}
    if(action==='edit'){state.editing=true;go(8);}
    if(action==='details')auxiliary('details');
    if(action==='leave'&&!state.sealed)auxiliary('leave');
    if(action==='stay'){state.auxiliary=null;render();}
    if(action==='seal')seal();
    if(action==='retry')deliver();
    if(action==='decline'){
      state.left=true;state.auxiliary=null;
      if(!local&&!state.sealed)fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"choice":"left"}',keepalive:true}).catch(()=>{});
      render();
    }
    if(action==='tortoise'){
      const note=document.getElementById('discovery');note.hidden=!note.hidden;
      const btn=host.querySelector('[data-action="tortoise"]');btn.setAttribute('aria-expanded',String(!note.hidden));
      if(!note.hidden)animate(note,{opacity:[0,1],y:[6,0],duration:280,ease:'out(3)'});
    }
  }
  host.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled||state.left)return;
    if(button.dataset.pick){savePick(button);return;}
    if(button.dataset.edit){state.editing=true;go(Number(button.dataset.edit));return;}
    if(button.hasAttribute('data-next')){handleAction('next');return;}
    if(button.dataset.action)handleAction(button.dataset.action);
  });
  host.addEventListener('change',event=>{if(event.target.dataset.select)D.choose(state.picks,event.target.dataset.select,event.target.value);});
  document.getElementById('back').addEventListener('click',()=>{
    if(state.auxiliary){state.auxiliary=null;render();return;}
    if(state.editing && state.scene!==8){go(8);return;}
    state.editing=false;
    go(state.scene-1);
  });
  document.getElementById('leave').addEventListener('click',()=>handleAction('leave'));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.auxiliary){state.auxiliary=null;render();}});
  window.addEventListener('popstate',event=>{
    if(state.left)return;
    state.editing=false;
    go(event.state?.chapterTwo?event.state.scene:0,true);
  });
  function setMotion(paused){
    state.paused=paused;app.dataset.motion=paused?'off':'on';
    const button=document.getElementById('motion');button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Play garden animation':'Pause garden animation');
    button.innerHTML=svg(paused?'<path d="m7 4 9 6-9 6Z"/>':'<path d="M7 5v10M13 5v10"/>','0 0 20 20');
    ambient.forEach(a=>paused?a.pause():a.resume());
    if(paused){sceneAnimations.forEach(a=>a.cancel());sceneAnimations=[];host.querySelectorAll('[style]').forEach(e=>{e.style.opacity='';e.style.transform='';});document.getElementById('messenger').style.transform='';}
  }
  function createAmbient(){
    const container=document.getElementById('fireflies');
    for(let i=0;i<11;i++){const f=document.createElement('i');f.className='firefly';f.style.left=(14+(i*29)%78)+'%';f.style.top=(33+(i*17)%42)+'%';container.append(f);}
    if(!engine)return;
    container.querySelectorAll('i').forEach((el,i)=>ambient.push(engine.animate(el,{y:[8,-14],x:[-3,6],opacity:[0,.7,0],duration:3400+i*137,delay:i*293,loop:true,ease:'inOut(2)',autoplay:!state.paused})));
    ambient.push(engine.animate('.sprig-left',{rotate:[-2,2],duration:6500,alternate:true,loop:true,ease:'inOut(2)',autoplay:!state.paused}));
    ambient.push(engine.animate('.sprig-right',{rotate:[2,-1],duration:7300,alternate:true,loop:true,ease:'inOut(2)',autoplay:!state.paused}));
  }
  document.getElementById('motion').addEventListener('click',()=>setMotion(!state.paused));
  motionQuery.addEventListener('change',event=>{setMotion(event.matches);render(false);});
  document.addEventListener('visibilitychange',()=>{
    ambient.forEach(a=>document.hidden?a.pause():!state.paused&&a.resume());
    sceneAnimations.forEach(a=>document.hidden?a.pause():!state.paused&&a.resume());
  });
  try{history.replaceState({chapterTwo:true,scene:start},'');}catch{}
  render(false);createAmbient();setMotion(state.paused);
  // Defer additional scenery until the first screen is usable. All requests remain local.
  setTimeout(()=>document.querySelectorAll('.world-image[data-src]').forEach(img=>{if(!img.src)img.src=img.dataset.src;}),1200);
})();
