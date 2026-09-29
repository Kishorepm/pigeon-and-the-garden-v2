/* Small, reusable views for the guild and the daily check-in. No generated text is
   presented as AI: starting ideas are editable, hand-written mission templates. */
window.KingdomPanels=(()=>{
  const M=KingdomModel;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const b=(label,action,id='',cls='')=>`<button type="button" class="${cls}" data-act="${action}" data-id="${esc(id)}">${esc(label)}</button>`;
  const paths={
    tasting:'M5 7h12v10H5z M17 9h4v6h-4 M3 21h16 M8 2v2 M13 2v2',
    date:'M12 2v5 M8 7h8v4h4v10H4V11h4z M10 15h4v6',
    kindness:'M12 20L3 11V6h5l4 4 4-4h5v5z',
    custom:'M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5',
    guild:'M3 21V9l9-7 9 7v12 M2 10h20 M7 14h3v7 M14 14h3v7',
    post:'M2 6h20v14H2z M2 6l10 8L22 6',
    journal:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1v16',
    settings:'M8 2h8v4h4v4h2v4h-2v4h-4v4H8v-4H4v-4H2v-4h2V6h4z M9 9h6v6H9z'
  };
  const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="miter" aria-hidden="true">${`<path d="${paths[name]||paths.custom}"/>`}</svg>`;
  const types={tasting:{title:'Taste test',sub:'Try places. Keep both opinions.',example:'Our best iced mocha',icon:'tasting'},date:{title:'Date adventure',sub:'Make a plan worth remembering.',example:'A walk and a picnic',icon:'date'},kindness:{title:'Little kindness',sub:'Make an ordinary day sweeter.',example:'A small surprise',icon:'kindness'},custom:{title:'Your own quest',sub:'Choose the steps and the rules.',example:'Anything that feels like us',icon:'custom'}};
  const templates={
    tasting:{kind:'tasting',goal:'places',title:'Find our next favourite',description:'Try a few places together and give each one our own honest rating.',steps:'',target:3,category:'Any',bothRate:true},
    date:{kind:'date',title:'A little day out',description:'Time together, with room for a detour.',steps:'Choose a day and a place\nGo on our adventure\nKeep one favourite memory',target:0},
    kindness:{kind:'kindness',title:'Make an ordinary day lovely',description:'Something small and thoughtful, just because.',steps:'Choose a little surprise\nMake it happen',target:0},
    custom:{kind:'custom',title:'',description:'',steps:'',target:0}
  };
  function template(kind){return {...templates[kind],who:'both',confirm:true,repeat:'once'};}
  const goalHelp={places:'Try a set number of different places, then finish the quest.',favourite:'No place limit. Choose a favourite from the tastings in this quest when you find the one.',forever:'No place limit and no finish line. Keep adding tastings; archive the quest whenever you want to put it away.'};
  function tastingProgress(m,p){return `${p.distinct}${M.tastingGoal(m)==='places'?' / '+m.target:''} ${p.distinct===1&&M.tastingGoal(m)!=='places'?'place':'places'} ${m.bothRate?'rated by both':'visited'}`;}
  function goalDescription(m){const goal=M.tastingGoal(m);return goal?(goal==='places'?`Try ${m.target} different places.`:goal==='favourite'?'Keep exploring until we choose our favourite.':'Keep exploring forever, with no place limit or finish line.')+(m.bothRate?' Both of us rate each tasting.':''):'Finish the checklist.';}
  function missionTrack(m,p){
    const goal=M.tastingGoal(m);
    if(goal==='forever'||goal==='favourite')return `<p class="quest-goal">${goal==='forever'?'An ongoing adventure':m.favouriteVisit?'A favourite chosen':'Searching for our favourite'}</p>`;
    return `<div class="quest-track"><i style="width:${Math.min(100,100*(goal?p.distinct/m.target:p.checked/Math.max(1,p.total)))}%"></i></div>`;
  }
  function syncTastingForm(form){
    if(!form?.elements.goal)return;const goal=form.elements.goal.value;
    const count=form.querySelector('[data-place-target]');count.hidden=goal!=='places';count.querySelector('input').disabled=count.hidden;
    form.querySelector('[data-goal-help]').textContent=goalHelp[goal];
    form.elements.steps.closest('label').firstChild.textContent=goal==='forever'?'Little things along the way (optional)':'Any final steps — one per line';
    const ending=form.querySelector('[data-ending-rules]');ending.hidden=goal==='forever';ending.querySelectorAll('input,select').forEach(el=>el.disabled=ending.hidden);
  }
  const portraitCache=new Map();
  function portrait(who){return `<span class="character-portrait ${who}" data-portrait="${who}" aria-hidden="true"><span class="portrait-placeholder">${who==='north'?'N':'S'}</span></span>`;}
  function assembledPortrait(who){
    if(!portraitCache.has(who)){
      const parts=who==='north'?['him-body','him-legs','him-shoes','him-chest','him-arms','him-beard','him-hair']:['her-body','her-shoes','her-skirt','her-dress','her-hair'];
      // Paint one complete frame only after every layer has decoded. A delayed
      // or failed outfit must never expose the base sprite in the journal.
      portraitCache.set(who,Promise.all(parts.map(async part=>{const img=new Image();img.src=`game-art/characters/${part}.png`;await img.decode();return img;})).then(images=>{
        const frame=document.createElement('canvas');frame.width=frame.height=64;const ctx=frame.getContext('2d');ctx.imageSmoothingEnabled=false;
        images.forEach(img=>ctx.drawImage(img,0,640,64,64,0,0,64,64));return frame;
      }).catch(error=>{portraitCache.delete(who);throw error;}));
    }
    return portraitCache.get(who);
  }
  function renderPortraits(root){
    root.querySelectorAll('[data-portrait]').forEach(el=>assembledPortrait(el.dataset.portrait).then(frame=>{
      if(!el.isConnected)return;const canvas=document.createElement('canvas');canvas.width=canvas.height=64;canvas.getContext('2d').drawImage(frame,0,0);el.replaceChildren(canvas);el.classList.add('is-ready');
    }).catch(()=>{ /* Keep the placeholder; retry on reopening. */ }));
  }
  const expressions={Content:'M8 14v2h8v-2',Excited:'M8 13h8v5H8z',Tender:'M8 14v2h8v-2 M4 11h2 M18 11h2',Tired:'M6 9h4 M14 9h4 M9 16h6',Low:'M8 17v-2h8v2',Overwhelmed:'M6 8l4 3 M6 11l4-3 M14 8l4 3 M14 11l4-3 M8 17h8'};
  function moodIcon(mood){return `<svg class="mood-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 2h12v2h3v3h2v10h-2v3h-3v2H6v-2H3v-3H1V7h2V4h3z"/>${['Tired','Overwhelmed'].includes(mood)?'':'<path d="M7 8v3 M17 8v3"/>'}<path d="${expressions[mood]||expressions.Content}"/></svg>`;}
  const moodName=m=>({Content:'Good',Tender:'Loved'})[m]||m;
  function personDay(s,person,who){const mood=s.moods[M.day()+':'+person];return `<article class="person-day ${person}" data-person="${person}">${portrait(person)}<div><span class="person-name">${person===who?'You · ':''}${person==='north'?'North':'South'}</span><strong>${mood?esc(moodName(mood.mood)):'Not shared yet'}</strong></div>${mood?.note?`<p>${esc(mood.note)}</p>`:''}${mood?.need?`<small>Would welcome ${esc(mood.need.toLowerCase())}</small>`:''}${mood?.energy?`<small>${esc(mood.energy)} energy</small>`:''}${mood?`<span class="day-emotion" data-mood="${mood.mood}">${moodIcon(mood.mood)}</span>`:''}</article>`;}
  function today(s,who,editing){
    const mine=s.moods[M.day()+':'+who];
    let html=`<div class="together-today">${personDay(s,who,who)}${personDay(s,M.other(who),who)}</div>`;
    if(!mine||editing){
      html+=`<form class="form daily-form" data-form="mood"><fieldset class="mood-picker"><legend>${mine?'How are you feeling now?':'How are you feeling?'}</legend><p>Choose what feels closest. A few words are optional.</p><div class="mood-options">${M.moods.map(m=>`<label data-mood="${m}"><input type="radio" name="mood" value="${m}" required ${mine?.mood===m?'checked':''}>${moodIcon(m)}<span>${esc(moodName(m))}</span></label>`).join('')}</div></fieldset><label>A little note (optional)<input name="note" maxlength="500" value="${esc(mine?.note||'')}" placeholder="What’s on your mind?"></label><details class="gentle-details"><summary>Anything you need today? <span>Optional</span></summary><div class="split"><label>I’d welcome<select name="need"><option value="">Leave this blank</option>${M.needs.map(n=>`<option ${mine?.need===n?'selected':''}>${esc(n)}</option>`).join('')}</select></label><label>My energy<select name="energy"><option value="">Leave this blank</option>${['Low','Medium','High'].map(n=>`<option ${mine?.energy===n?'selected':''}>${n}</option>`).join('')}</select></label></div></details><p class="form-error" role="alert"></p><button type="submit" class="primary">${mine?'Update my check-in':'Share my mood'} <span>→</span></button></form>`;
    }else html+=`<div class="checkin-saved"><span class="saved-tick" aria-hidden="true">✓</span><div><strong>Your check-in is here.</strong><p>${s.moods[M.day()+':'+M.other(who)]?'A little closer, even from different places.':'Your partner can leave theirs whenever they’re ready.'}</p></div>${b('Edit','edit-mood','','quiet')}</div>`;
    return html+`<div class="daily-links">${b('Leave a little kindness','open','gesture')}${b('Our recent days','open','days','quiet')}</div>`;
  }
  function glance(s,who){return `<span class="glance-title">US TODAY <span>↗</span></span><span class="glance-people">${M.people.map(p=>{const m=s.moods[M.day()+':'+p];return `<span><i class="mood-dot" data-mood="${m?.mood||''}"></i>${p===who?'You':p==='north'?'North':'South'} <strong>${m?esc(moodName(m.mood)):'—'}</strong></span>`;}).join('')}</span>`;}
  const statusLabel={active:'In progress',proposed:'An invitation',awaiting:'Ready to confirm',completed:'Completed',declined:'Not this time',archived:'Archived'};
  function tabs(active){return `<nav class="guild-tabs" aria-label="Guild sections">${[['missions','Missions'],['completed','History'],['tastes','Tastings']].map(([key,name])=>`<button data-act="guild-tab" data-id="${key}" aria-pressed="${active===key}">${name}</button>`).join('')}</nav>`;}
  function board(s,who,filter){
    const history=filter==='completed',list=s.missions.filter(m=>history?['completed','archived','declined'].includes(m.status):!['completed','archived','declined'].includes(m.status)).slice().reverse();
    return `<div class="guild-intro"><span class="guild-emblem">${icon('guild')}</span><div><p>Little quests. Very good company.</p><span>Plan something, make it yours, keep the memory.</span></div></div>${tabs(history?'completed':'missions')}<div class="board-toolbar"><span>${history?'Our past adventures':list.length?list.length+' open '+(list.length===1?'mission':'missions'):'Our next adventure starts here'}</span>${b('Create a mission','open','mission-types','primary')}</div>`+(list.length?`<div class="mission-board">${list.map(m=>{const kind=M.missionKind(m),t=types[kind],p=M.progress(s,m);return `<article class="mission-pin ${kind}"><span class="pin-mark" aria-hidden="true"></span><div class="quest-type">${icon(kind)}<span>${t.title}</span><span class="quest-state ${m.status}">${statusLabel[m.status]}</span></div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><div class="quest-progress">${kind==='tasting'?`<span>${tastingProgress(m,p)}</span>`:`<span>${p.checked} / ${p.total} steps</span>`}<span>${m.people.length===2?'Together':m.people[0]===who?'For you':'For your partner'}</span></div>${missionTrack(m,p)}${b(m.status==='proposed'&&!m.accepted.includes(who)&&m.people.includes(who)?'View invitation':'Open mission','mission',m.id,'quest-open')}</article>`;}).join('')}</div>`:`<div class="board-empty">${icon(history?'journal':'tasting')}<h3>${history?'Still writing this part.':'The iced mocha quest awaits.'}</h3><p>${history?'Completed and archived missions will be kept here.':'There’s already a Starbucks memory in Tastings. Make a quest and bring that first contender along.'}</p>${history?'':b('Plan the mocha quest','template','mocha','primary')}</div>`);
  }
  function typePicker(){return `<p class="page-intro">What kind of adventure are we making?</p><div class="mission-type-list">${Object.entries(types).map(([id,t])=>`<button data-act="choose-type" data-id="${id}"><span class="type-symbol">${icon(t.icon)}</span><span><strong>${t.title}</strong><span>${t.sub}</span><small>${t.example}</small></span><span class="type-arrow" aria-hidden="true">→</span></button>`).join('')}</div><p class="soft-line template-note">Each type gives you an editable starting point. You choose the name, steps and rules.</p>`;}
  function missionForm(s,t,h){
    const {input,area,select,check,form}=h,kind=t.kind||M.missionKind(t),type=types[kind];
    let fields=`<input type="hidden" name="kind" value="${kind}"><div class="chosen-type">${icon(kind)}<span>${type.title}</span>${b('Change type','change-type','','quiet')}</div>`;
    fields+=input('Mission name','title',t.title||'','text','required maxlength="100" placeholder="Give our adventure a name"')+area('The idea','description',t.description||'',800)+select('Who is it for?','who',[['both','Both of us'],['me','Just me'],['partner','My partner']],t.who||'both');
    if(kind==='tasting')fields+=`<div class="tasting-rules"><h3>The taste test</h3>${select('How long is this quest?','goal',[['places','A set number of places'],['favourite','Until we find our favourite'],['forever','Keep exploring forever']],M.tastingGoal(t))}<p class="goal-help" data-goal-help>${goalHelp[M.tastingGoal(t)]}</p><div class="split">${select('What are we trying?','category',[['Any','Food or drinks'],['Coffee','Coffee & drinks'],['Food','Food']],t.category||'Any')}<div data-place-target>${input('Different places to try','target',t.target||3,'number','min="1" max="30" step="1" required')}</div></div>${check('Both of us rate each place','bothRate',t.bothRate!==false)}<p>Each entry keeps the place name, what we tried, and our separate scores.</p></div>`;
    else fields+='<input type="hidden" name="target" value="0">';
    fields+=area(kind==='tasting'?'Any final steps — one per line':'Steps — one per line','steps',t.steps||'',1500);
    fields+=`<details data-ending-rules><summary>More rules <span class="tiny">Optional</span></summary><div>${check('Each participant adds a completion note','evidence',!!t.evidence)}${check('The other person confirms completion','confirm',t.confirm!==false)}<div class="split">${input('Target date (optional)','due',t.due||'','date')}${select('Tradition','repeat',[['once','One adventure'],['weekly','Weekly idea'],['monthly','Monthly idea']],t.repeat||'once')}</div>${select('Complete this mission first (optional)','prerequisite',[['','No prerequisite'],...s.missions.map(m=>[m.id,m.title])],t.prerequisite||'')}</div></details><p class="soft-line">Your partner gets to accept a shared mission. Nothing is assigned without them joining.</p>`;
    return form('mission',fields,'Preview the scroll');
  }
  function tastingCard(v,who){const scored=M.people.every(p=>v.ratings[p]!==undefined);return `<article class="tasting-entry"><div class="tasting-heading"><span class="tasting-stamp">${icon('tasting')}</span><div><h3>${esc(v.venue)}</h3><p>${esc([v.area,v.item].filter(Boolean).join(' · '))}</p><small>${esc(v.day)} · ${esc(v.category)}</small></div></div><div class="tasting-scores">${M.people.map(p=>`<div><span>${p===who?'You':p==='north'?'North':'South'}</span><strong>${v.ratings[p]??'—'}<small> / 10</small></strong>${v.notes[p]?`<p>${esc(v.notes[p])}</p>`:''}${v.again?.[p]?'<small>Would order again</small>':''}</div>`).join('')}</div><div class="tasting-footer"><span>${scored?'Together: '+((v.ratings.north+v.ratings.south)/2).toFixed(1)+' / 10':v.ratings[who]===undefined?'Your opinion is still missing.':'Waiting for your partner’s opinion.'}</span>${b(v.ratings[who]===undefined?'Give your rating':'Edit your rating','rate',v.id)}</div></article>`;}
  function tastings(s,who){return tabs('tastes')+`<div class="tasting-intro"><p>Every place. Both opinions.</p><span>Tastings linked to a mission also live on its quest page.</span></div><div class="row-actions">${b('Add a tasting','open','visit-new','primary')}${b('Our favourites','open','preferences','quiet')}</div>`+s.visits.slice().reverse().map(v=>{const m=s.missions.find(m=>m.id===v.mission);return tastingCard(v,who)+(m?b('From: '+m.title,'mission',m.id,'tasting-mission-link quiet'):'');}).join('');}
  function missionTastings(s,m,who,h){
    if(M.missionKind(m)!=='tasting')return '';
    const goal=M.tastingGoal(m),visits=s.visits.filter(v=>v.mission===m.id),canAdd=m.status==='active'&&m.people.includes(who),loose=s.visits.filter(v=>!v.mission&&(!m.category||m.category==='Any'||m.category===v.category)),p=M.progress(s,m);
    return `<section class="mission-tastings"><div class="section-title"><h3>The contenders</h3><span>${tastingProgress(m,p)}</span></div>${canAdd?b('Add a tasting','visit-for',m.id,'primary'):''}<p class="soft-line goal-description">${esc(goalDescription(m))}</p>${goal==='favourite'?favouritePicker(m,visits,canAdd,h):''}${!visits.length?'<p class="soft-line">Place names, scores and notes will appear here as you try them.</p>':''}${visits.map(v=>tastingCard(v,who)).join('')}${canAdd&&loose.length?`<details class="link-tasting"><summary>Bring an earlier tasting into this quest</summary>${h.form('link-visit',`<input type="hidden" name="mission" value="${m.id}">`+h.select('Earlier tasting','visit',loose.map(v=>[v.id,v.venue+' · '+v.item])),'Link this tasting')}</details>`:''}</section>`;
  }
  function favouritePicker(m,visits,canChoose,h){
    const chosen=visits.find(v=>v.id===m.favouriteVisit),eligible=visits.filter(v=>!m.bothRate||M.people.every(p=>v.ratings[p]!==undefined));
    let html=chosen?`<div class="chosen-favourite"><span>Our favourite</span><strong>${esc(chosen.venue)}</strong><p>${esc([chosen.area,chosen.item].filter(Boolean).join(' · '))}</p></div>`:'';
    if(canChoose)html+=eligible.length?h.form('favourite',h.select('Our favourite so far','visit',[['','Choose a tasting'],...eligible.map(v=>[v.id,[v.venue,v.area,v.item].filter(Boolean).join(' · ')])],m.favouriteVisit||''),chosen?'Update our favourite':'Choose this favourite',m.id):`<p class="soft-line">${m.bothRate?'Add a tasting and both ratings':'Add a tasting'}, then choose your favourite here.</p>`;
    return `<div class="favourite-picker">${html}</div>`;
  }
  return {icon,portrait,renderPortraits,syncTastingForm,goalDescription,moodIcon,moodName,personDay,today,glance,types,template,board,typePicker,missionForm,tastingCard,tastings,missionTastings};
})();
