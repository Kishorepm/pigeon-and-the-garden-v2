(function(){
  'use strict';
  const Q=window.Quest,engine=window.anime,game=document.getElementById('game'),box=document.getElementById('dialogue');
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname),query=new URLSearchParams(location.search),mq=matchMedia('(prefers-reduced-motion:reduce)');
  const start=local&&/^(?:[0-9]|10)$/.test(query.get('scene')||'')?Number(query.get('scene')):0;
  const state={scene:start,p:Q.initial(),editing:false,aux:null,left:false,paused:mq.matches||(local&&query.get('motion')==='off'),found:false,sealed:false,status:'idle',submitted:'',queued:null,pending:false,locked:false};
  if(start>0)Object.assign(state.p,{travel:'near',range:'close',date:'meal',day:'sat',time:'afternoon',addition:'lantern'});
  const world=new PixelWorld(document.getElementById('world'));world.pause(state.paused);
  let animation=null,timer=0;
  const titles=['Back where we left off.','A small unfinished quest.','This time, I come to you.','How far shall we wander?','First, the important part.','Make a little time.','Something new for your castle.','A little further together.','A table. Finally.','The second-date decree.','The next chapter is ours.'];
  const labels=['THE STORY SO FAR','A MESSAGE HAS ARRIVED','CHOOSE OUR PATH','SET THE ADVENTURE RADIUS','QUEST: THE MISSING MEAL','A DAY FOR STOP 02','COURTYARD UPGRADE','STOP 01 → STOP 02','NEW AREA UNLOCKED','CHECK YOUR PLAN','STOP 02 · PLANNED'];
  const captions=['Your throne. Still here.','Two outstanding objectives.','No long drive required.','Your call. Always.','Iced drinks are coming too.','The exact hour can follow.','The throne stays. We add to it.','The castle can wait a little.','Food. Drinks. Two places.','','Knight training: underway.'];
  const button=(text,action='next')=>`<button class="primary" type="button" data-action="${action}">${text}<span aria-hidden="true">→</span></button>`;
  const intro=(who,title,body='')=>`<p class="speaker">${who}</p><h2 id="dialogue-title">${title}</h2>${body?`<p>${body}</p>`:''}`;
  const link=(text,action)=>`<button class="text-link" type="button" data-action="${action}">${text}</button>`;
  const carry=()=>'<div class="carried"><img src="/art-drink.png" alt="">Iced drinks included. This time, actually.</div>';
  const option=(field,value,title,sub='',icon='')=>`<button class="choice" type="button" data-pick="${field}" data-value="${value}" aria-pressed="${state.p[field]===value}">${icon?`<img class="item-icon" src="${icon.startsWith('pixel-')?'/'+icon+'.svg':'/art-'+icon+'.png'}" alt="">`:'<span class="option-mark" aria-hidden="true">◇</span>'}<span><b>${title}</b>${sub?`<small>${sub}</small>`:''}</span><span class="option-arrow" aria-hidden="true">›</span></button>`;
  const returnLink=()=>state.editing?link('Back to the decree','card'):'';
  function scene(n){
    switch(n){
      case 0:return intro('THE PIGEON','Stop 01 is stamped.','Ambury. Saturday. You named birds I couldn’t even see.')+'<p class="aside">The throne was secured. The story wasn’t finished.</p>'+button('Continue from Stop 01');
      case 1:return intro('AN AMENDMENT FROM YOUR ASPIRING KNIGHT','The throne was secured. Lunch was not.','We missed the iced drinks. We missed the food.<br>I’d like another date. With both this time.')+button('Let’s fix that')+link('Not this time','leave');
      case 2:return intro('YOUR ASPIRING KNIGHT','You came my way last time.','Let me come your way this time. How would you like to do it?')+`<div class="choices">${option('travel','near','Come to my side','Around Waiuku. I make the trip.')}${option('travel','middle','Meet somewhere between us','A little travel each.')}${option('travel','pickup','Pick me up. Let’s take a drive.','We choose how far together.')}${option('travel','yours','I’m happy to come your way','Only if that suits you.')}</div>`+returnLink();
      case 3:return intro('THE MAP IS OPEN','How far feels good?','For this outing—not a commitment to cross the kingdom.')+`<div class="choices">${option('range','close','Keep it close','A nearby spot. More time together.')}${option('range','little','A little further is fine','A short drive to somewhere nice.')}${option('range','adventure','Make a small adventure of it','A scenic route, with stops.')}</div>`+returnLink();
      case 4:return intro('THE MISSING MEAL','What sort of date?','A proper second chapter. Pick the one you feel like.')+`<div class="choices compact">${option('date','meal','Iced drinks + a proper meal')}${option('date','drive','Food + a scenic little drive')}${option('date','picnic','A takeaway picnic')}${option('date','cosy','A cosy table + dessert')}${option('date','surprise','Plan it for me')}</div>`+carry()+returnLink();
      case 5:return intro('A LITTLE TIME FOR US','When shall we make it happen?','We can settle the exact hour by text.')+`<div class="timing"><fieldset><legend>The day</legend><div class="segments">${[['fri','Friday'],['sat','Saturday'],['sun','Sunday'],['arrange','Another day']].map(([v,t])=>`<button type="button" data-pick="day" data-value="${v}" aria-pressed="${state.p.day===v}">${t}</button>`).join('')}</div></fieldset><fieldset><legend>The time of day</legend><div class="segments">${[['lunch','Lunch'],['afternoon','Afternoon'],['evening','Evening'],['arrange','Let’s see']].map(([v,t])=>`<button type="button" data-pick="time" data-value="${v}" aria-pressed="${state.p.time===v}">${t}</button>`).join('')}</div></fieldset></div><button class="primary" type="button" data-action="timing"${Q.timingReady(state.p)?'':' disabled'}>${state.editing?'Save the timing':'That sounds good'} <span aria-hidden="true">→</span></button><p class="selection-hint" id="timing-hint">${Q.timingReady(state.p)?'The builder intends to be early.':'Choose a day and a time—or leave them open.'}</p>`+returnLink();
      case 6:return intro('YOUR THRONE IS ALREADY HERE','The castle gets a courtyard.','A table for two is going in. What shall we build beside it?')+`<div class="choices three">${option('addition','fountain','A little fountain','','pixel-fountain')}${option('addition','flowers','A flower arch','','pixel-arch')}${option('addition','lantern','A lantern tree','','pixel-lantern')}</div>`+'<p class="aside">A little more of your castle, with every chapter.</p>'+returnLink();
      case 7:return intro('THE NEXT STRETCH','Same garden. A new path.','A proper meal ahead. The unfinished castle behind us.')+'<p class="aside">The pigeon has taken charge of directions.</p>'+button('Walk on to Stop 02');
      case 8:return intro('THE PIGEON, INSPECTING THE WORK','Two places. Two iced drinks.','Your throne has company. So does the table.')+`<p class="aside">Added to your castle: ${Q.label(state.p,'addition').toLowerCase()}.</p>`+button('Make the plan official');
      case 9:return decree();
      case 10:return intro('DECREE SEALED','A second date. Properly planned.','I’ll sort the place and text you the details.<br>You just have to show up as you.')+`<p class="delivery-status" role="status" id="delivery-status">${deliveryCopy()}</p><button class="text-link" type="button" data-action="retry"${state.status==='failed'?'':' hidden'}>Try sending again</button>`+button('See our plan','card')+link('See the road ahead','map');
      default:return scene(0);
    }
  }
  function decree(){
    const rows=[['Journey',Q.label(state.p,'travel')+' · '+Q.label(state.p,'range'),'travel'],['Our date',Q.label(state.p,'date'),'date'],['When',Q.label(state.p,'day')+' · '+Q.label(state.p,'time'),'timing'],['Courtyard',Q.label(state.p,'addition'),'addition']];
    return intro('STOP 02 / THE MISSING MEAL','A better plan than last time.')+`<div class="decree-list">${rows.map(([label,value,key])=>`<button class="decree-row" type="button" data-edit="${key}" aria-label="Edit ${label.toLowerCase()}"><span>${label}</span><span>${value}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`+carry()+'<p class="aside">I liked the first one. I’d really like another.<br>On time, and with food.</p>'+`<button class="primary seal-button" type="button" data-action="seal"${Q.ready(state.p)?'':' disabled'}><img src="/art-seal.png" alt="">Seal the second date <span aria-hidden="true">✓</span></button>`;
  }
  function map(){return intro('THE ROAD AHEAD','One castle. A few good chapters.')+`<ol class="quest-map"><li>01 · A good beginning<small>Ambury. Your throne. The first date.</small></li><li>02 · The missing meal<small>${state.sealed?'Planned. Dining courtyard added.':'Our next stop. Food, drinks, a table for two.'}</small></li><li class="locked">More dates. More of your castle.<small>The knight has some training to do.</small></li><li class="locked">The dragon · final boss<small>Further down the road. No spoilers from the pigeon.</small></li><li class="locked">Your castle, complete.<small>You on your throne. Me, your knight.</small></li></ol>`+button('Back to our chapter','close');}
  function render(focus=true){
    clearTimeout(timer);state.locked=false;animation?.cancel();game.dataset.scene=state.scene;
    let content=scene(state.scene);
    if(state.aux==='map')content=map();
    if(state.aux==='leave')content=intro('NO QUEST IS COMPULSORY','Leave it here for now?','It’s okay to leave the invitation unfinished.')+button('Stay in the garden','close')+link('Leave this invitation','decline');
    if(state.aux==='discovery')content=intro('OPTIONAL ENCOUNTER','A bird you can actually see.','The builder confidently identifies it as “a bird”.')+'<p class="aside">You found the duck. It will now supervise lunch.</p>'+button('Very helpful. Carry on.','close');
    if(state.left)content=intro('THE GARDEN STAYS','That is a complete answer.','No appeal. No awkward follow-up.<br>We’re good. You can close this tab.');
    box.innerHTML=content;box.scrollTop=0;
    document.getElementById('scene-title').textContent=state.left?'Until another chapter.':titles[state.scene];
    document.getElementById('chapter-label').textContent=labels[state.scene];
    const back=document.getElementById('back'),leave=document.getElementById('leave');back.hidden=state.left||(state.scene===0&&!state.aux);leave.hidden=state.left||state.scene===0||state.sealed||state.aux==='leave';document.querySelector('.game-bar').classList.toggle('has-nav',!back.hidden);
    document.getElementById('quest-tag').innerHTML=state.scene<2?'STOP 01 <span>COMPLETE ✓</span>':state.scene>=8?'STOP 02 <span>'+(state.sealed?'PLANNED ✓':'THE MISSING MEAL')+'</span>':'NEW PATH <span>STOP 02 AHEAD</span>';
    document.getElementById('world-caption').textContent=captions[state.scene];document.getElementById('world-caption').hidden=!captions[state.scene];
    document.getElementById('discovery').hidden=state.left||!!state.aux||state.found||state.scene!==7;
    document.getElementById('inventory').textContent=state.sealed?'COURTYARD ADDED':state.p.date?'DRINKS + FOOD ✓':'A NEW CHAPTER';
    world.discovered=state.found;world.set(state.scene,state.p);
    if(engine&&!state.paused)animation=engine.animate(box,{opacity:[.7,1],y:[6,0],duration:240,ease:'out(3)'});
    if(focus)box.focus({preventScroll:true});
  }
  function go(n,historyNavigation=false){if(state.left)return;state.scene=Math.max(0,Math.min(10,n));state.aux=null;if(!historyNavigation)history.pushState({quest:true,scene:state.scene},'');render();}
  function choose(btn){
    if(state.locked||!Q.choose(state.p,btn.dataset.pick,btn.dataset.value))return;
    const field=btn.dataset.pick;document.getElementById('announcement').textContent=Q.label(state.p,field)+' selected.';
    if(field==='day'||field==='time'){
      box.querySelectorAll('[data-pick]').forEach(b=>b.setAttribute('aria-pressed',String(state.p[b.dataset.pick]===b.dataset.value)));
      box.querySelector('[data-action="timing"]').disabled=!Q.timingReady(state.p);document.getElementById('timing-hint').textContent=Q.timingReady(state.p)?'The builder intends to be early.':'Choose a day and a time—or leave them open.';world.p={...state.p};world.draw();return;
    }
    state.locked=true;btn.setAttribute('aria-pressed','true');world.p={...state.p};world.draw();
    let next=state.editing?9:state.scene+1;
    if(field==='travel')next=state.p.travel==='near'?(state.editing?9:4):3;
    timer=setTimeout(()=>go(next),state.paused?0:220);
  }
  function deliveryCopy(){if(local)return 'Local preview: no message has been sent.';return state.status==='success'?'Your plan has been received.':state.status==='failed'?'Your choices are here, but the note didn’t send. Please try again.':'The pigeon is carrying your note…';}
  function deliveryUI(){const status=document.getElementById('delivery-status');if(status)status.textContent=deliveryCopy();const retry=box.querySelector('[data-action="retry"]');if(retry)retry.hidden=state.status!=='failed';}
  async function deliver(snapshot={...state.p}){
    const fingerprint=Q.fingerprint(snapshot);
    if(local){state.status='preview';deliveryUI();return;}
    if(state.pending){state.queued=snapshot;return;}
    if(state.submitted===fingerprint){state.status='success';deliveryUI();return;}
    state.pending=true;state.status='pending';deliveryUI();const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
    try{const response=await fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice:'sealed',picks:Q.payload(snapshot),updated:!!state.submitted}),signal:controller.signal});if(!response.ok)throw new Error('Not received');state.status='success';state.submitted=fingerprint;}
    catch{state.status='failed';}
    finally{clearTimeout(timeout);state.pending=false;deliveryUI();if(state.queued){const queued=state.queued;state.queued=null;deliver(queued);}}
  }
  function action(name){
    if(state.locked||state.left)return;
    if(name==='next')go(state.scene+1);
    if(name==='timing'&&Q.timingReady(state.p))go(state.editing?9:6);
    if(name==='card'){state.editing=false;go(9);}
    if(name==='close'){state.aux=null;render();}
    if(name==='map'){state.aux='map';render();}
    if(name==='leave'&&!state.sealed){state.aux='leave';render();}
    if(name==='seal'&&Q.ready(state.p)){
      state.locked=true;state.sealed=true;state.editing=false;const b=box.querySelector('[data-action="seal"]');b.disabled=true;b.innerHTML='SEALED ✓';deliver();
      if(engine&&!state.paused)animation=engine.animate(b,{scale:[1,.97,1],duration:280,ease:'out(3)'});
      timer=setTimeout(()=>go(10),state.paused?0:430);
    }
    if(name==='retry')deliver();
    if(name==='decline'){state.left=true;state.aux=null;if(!local&&!state.sealed)fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"choice":"left"}',keepalive:true}).catch(()=>{});render();}
  }
  box.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.disabled||state.locked||state.left)return;if(b.dataset.pick)choose(b);else if(b.dataset.edit){state.editing=true;go({travel:2,date:4,timing:5,addition:6}[b.dataset.edit]);}else if(b.dataset.action)action(b.dataset.action);});
  document.getElementById('back').addEventListener('click',()=>{if(state.locked||state.left)return;if(state.aux){state.aux=null;render();return;}if(state.editing&&state.scene!==9){go(9);return;}state.editing=false;go(state.scene===4&&state.p.travel==='near'?2:state.scene-1);});
  document.getElementById('leave').addEventListener('click',()=>action('leave'));
  document.getElementById('map-button').addEventListener('click',()=>action('map'));
  document.getElementById('discovery').addEventListener('click',()=>{state.found=true;state.aux='discovery';render();});
  function motion(paused){state.paused=paused;world.pause(paused);const b=document.getElementById('motion');b.setAttribute('aria-pressed',String(paused));b.setAttribute('aria-label',paused?'Play animation':'Pause animation');b.textContent=paused?'▶ Motion':'Ⅱ Motion';if(paused){animation?.cancel();box.style.opacity='';box.style.transform='';}}
  document.getElementById('motion').addEventListener('click',()=>motion(!state.paused));mq.addEventListener('change',e=>motion(e.matches));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.aux){state.aux=null;render();}});
  window.addEventListener('popstate',e=>{if(state.left)return;state.editing=false;go(e.state?.quest?e.state.scene:0,true);});
  history.replaceState({quest:true,scene:start},'');render(false);motion(state.paused);
})();
