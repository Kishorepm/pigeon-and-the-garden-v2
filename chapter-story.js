window.extendChapterStory=function(Journey,h){
  const {$,copy,action,focusAction,routes,START,WALK,reduced,cameraFollow}=h,C=window.Chapter,KEY=document.documentElement.dataset.chapterStorage||'our-kingdom-stop02-v1';
  const baseStart=Journey.prototype.start;
  const isLocal=['localhost','127.0.0.1','::1'].includes(location.hostname);
  const safeRead=()=>{try{return C.restore(JSON.parse(localStorage.getItem(KEY)));}catch{return C.initial();}};
  const links=(entries)=>{const row=document.createElement('div');row.className='little-links';entries.forEach(([label,fn])=>{const b=document.createElement('button');b.className='secondary';b.textContent=label;b.onclick=fn;row.append(b);});$('actions').append(row);};
  Object.assign(Journey.prototype,{
    save(){try{localStorage.setItem(KEY,JSON.stringify(this.plan));return true;}catch{return false;}},
    screen(phase,title,line,step,speaker='YOUR KNIGHT · STILL IN TRAINING'){
      this.phase=phase;document.querySelector('.dialogue').classList.remove('review','letter');document.documentElement.dataset.scene=phase;if(!reduced()){const panel=document.querySelector('.dialogue');panel.getAnimations().forEach(a=>a.cancel());panel.animate([{opacity:.65,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});}copy(speaker,title,line,step);$('hint').textContent='OUR LITTLE ADVENTURE · STOP 02';$('landmark').classList.add('away');
      const descriptions={itinerary:'The pigeon has returned to the princess at the castle with the proposed date details. Her knight is away making arrangements.',completed:'The princess and her knight are together at the castle after their second date. A newly earned crown sits beside the inherited throne.',arriving:'Her knight walks through the castle gate to join the princess.',welcome:'The princess and her knight stand together beside the inherited throne, ready to plan their next date.',review:'The princess is home at the castle with her written plan. Her knight has left to make arrangements, and the pigeon will carry her reply.',waiting:'The princess stays at the castle while the pigeon flies after her knight with the plan.',food:'At the village inn’s noticeboard, the pair consider food ideas for their next date.',drinks:'Two iced drinks appear as a visual promise beside the inn. They are added to the future date plan.',day:'The pair pause on a timber lookout beside the river to choose a day.',time:'The pair pause on the riverside lookout to choose a preferred time.',map:'An overview of the kingdom: the castle at its heart, Ambury memories to the west, the pond, the village and the looping route home.'};
      if(phase==='memory')descriptions.memory='A small woodland clearing west of the castle marks the first-date memories at Ambury.';if(phase==='pets')descriptions.pets='A closer view of a castle resident. Use the named pet buttons to explore the animals at home.';if(!this.editing&&descriptions[phase])$('world').setAttribute('aria-label',descriptions[phase]);
    },
    start(){
      if(!this.plan)this.plan=safeRead();document.querySelector('.dialogue').classList.remove('review','letter');document.documentElement.dataset.scene='start';
      const config=this.cache.json.get('chapter-config');this.config=C.validConfig(config)?config:{stage:'inviting',revision:'stop02-1',itinerary:null};
      this.cameras.main.useBounds=true;this.resize();this.cameras.main.startFollow(this.cameraPoint,true,.09,.09);this.mapLabels?.forEach(x=>x.destroy());this.mapLabels=[];
      this.finishCast(false);this.tweens.killTweensOf(this.pigeon);baseStart.call(this);this.knight.setVisible(false);this.knightAway=true;this.basket.setVisible(false);this.basketGlow.setVisible(false);this.pigeon.setVisible(true).setAlpha(1);this.letterProp.setPosition(355,391).setDepth(392).setVisible(false);this.planTable.setVisible(false);this.setHourLight('',true);this.night.setAlpha(0);this.packing.setPosition(915,723).setScale(1).setAlpha(1).setVisible(false);this.crown.setVisible(this.config.stage==='completed');this.editing=false;
      if(C.ready(this.plan))this.setHourLight(this.plan.time,true);$('hint').textContent='A LITTLE MORE OF OUR STORY';$('map-open').onclick=()=>this.openMap();
      if(this.config.stage==='completed'){this.showCompleted();return;}
      if(this.config.stage==='proposed'){this.showItinerary();this.pigeon.setPosition(180,240);this.castMove(this.pigeon,[[290,310],[368,389]],()=>this.letterProp.setVisible(true),170);return;}
      if(this.plan.status==='sent'&&C.ready(this.plan)){this.waiting();return;}
      copy('A FAMILIAR PAIR OF WINGS',C.ready(this.plan)?'Your little plan is still here.':'Ruby’s spotted a familiar visitor.',C.ready(this.plan)?'Your knight is finding the next stop. The pigeon is ready for any little changes.':'The throne is right where you left it. And someone has sent the pigeon back.','01 / 06');
      action(C.ready(this.plan)?'Continue our little plan':'Open the pigeon’s letter',()=>C.ready(this.plan)?this.review():this.readLetter());
      links(C.ready(this.plan)?[['Read the invitation again',()=>this.readLetter()],['Meet the residents',()=>this.petTour()]]:[['Meet the residents',()=>this.petTour()],['Our first chapter',()=>this.openMemory()]]);
      this.phase='start';$('world').setAttribute('aria-label',C.ready(this.plan)?'The princess is home with her pets and the pigeon. Her knight is away arranging the next date.':'At her unfinished castle, the princess and her pets greet a returning pigeon. Her knight has not arrived yet.');this.frameParty(true);
      if(!C.ready(this.plan)){this.pigeon.setPosition(180,240);this.castMove(this.pigeon,[[290,310],[368,389]],()=>{this.letterProp.setVisible(true);},170);}
      else this.pigeon.setPosition(368,389);
    },
    readLetter(){
      this.finishCast();this.letterProp.setVisible(false);
      this.screen('letter','Another assignment for this pigeon?','Last time you sent him back, we ended up at Ambury. I was hoping we could give him another assignment. A second adventure, with you.','STOP 02 · AN INVITATION','A NOTE FROM YOUR KNIGHT');
      document.querySelector('.dialogue').classList.add('letter');
      action('Let’s open the next chapter',()=>this.knightArrival());action('Let me wander the castle first',()=>this.start(),'secondary');this.frameParty(true);focusAction();
    },
    knightArrival(){
      this.screen('arriving','Someone’s waiting at the gate.','An empty basket. A slightly better plan. Your knight has arrived.','01 / 06');this.knight.setPosition(496,520).setVisible(true);this.knightAway=false;this.gate.setAlpha(0);
      this.castMove(this.knight,[[464,478],[464,398],[390,424]],()=>{
        this.basket.setVisible(true);this.basketGlow.setVisible(true);this.screen('welcome','I’ve remembered two things.','Food. And those iced drinks. Shall we work out what our next adventure could look like?','01 / 06');action('Pick up the basket',()=>this.collect());focusAction();
      },145);
      if(this.castMotion)action('Meet your knight',()=>this.finishCast(),'secondary');
    },
    collect(){
      if(this.phase!=='welcome')return;this.screen('collecting','This time, we make a little plan.','You choose the kind of adventure. I’ll take care of finding somewhere.','01 / 06');
      this.move([[395,429]],()=>{this.phase='basket';this.basket.setVisible(false);this.basketGlow.setVisible(false);this.carry.setVisible(true);$('inventory').hidden=false;$('inventory').textContent='✓ Basket packed. Finally.';this.screen('basket','Shall we go a little further?','Same princess. Slightly more prepared knight. A new bit of the map.','01 / 06');action('Follow the pigeon',()=>this.depart());focusAction();},70);
      if(this.travel)action('Skip the little walk',()=>this.finishTravel(),'secondary');
    },
    depart(){if(this.phase!=='basket')return;this.screen('travelling','The rest of the map awaits.','Follow the path. I’ll carry the basket.','02 / 06');this.move(WALK,()=>this.crossroads(),115);if(this.travel)action('Skip to the crossroads',()=>this.finishTravel(),'secondary');},
    crossroads(){
      this.screen('crossroads','Let me come your way.','You came my way last time. Where would you like our next adventure to start?','02 / 06');if(!this.editing){$('location').textContent='The little crossroads';$('world').setAttribute('aria-label','The pair have crossed the river to a village crossroads. The inn waits ahead; the path home remains behind them.');}$('inventory').hidden=true;
      $('actions').className='routes';routes.forEach((r,i)=>action(r.label,()=>this.choose(i),'choice',r.detail));this.frameParty(reduced());focusAction();
    },
    choose(index){
      if(this.phase!=='crossroads')return;const key=['near','middle','pickup','yours'][index];C.choose(this.plan,'travel',key);this.plan.status='draft';this.save();
      this.routeMarker.clear().setVisible(true).lineStyle(3,0xf9e5a0,.6).beginPath().moveTo(816,744).lineTo(...routes[index].point).strokePath();
      if(key==='near'){this.screen('range','Your side of the kingdom.','I’ll come to your side around Waiuku. We’ll find somewhere that suits us, after we know what sounds good.','02 / 06');action(this.editing?'Keep this choice':'Find a little time for us',()=>this.afterTravel());links([['Choose another route',()=>this.crossroads()]]);}
      else this.range();
    },
    range(){
      const pickup=this.plan.travel==='pickup';this.screen('range',pickup?'How big a little adventure?':'How much driving feels comfortable?',pickup?'I’ll come to you. You choose the pace.':'Roughly how long would you be happy driving one way? We’ll use this to choose somewhere sensible.','02 / 06');
      $('actions').className='routes';Object.entries(C.ranges[this.plan.travel]).forEach(([key,label])=>action(label,()=>{C.choose(this.plan,'range',key);this.save();this.afterTravel();},'choice'));links([['Back to the crossroads',()=>this.crossroads()]]);focusAction();
    },
    afterTravel(){
      if(this.editing){this.editing=false;this.review();return;}
      const points=this.plan.travel==='pickup'?[[968,744],[1018,790],[926,804],[816,816],[816,910],[838,973]]:[[816,816],[816,910],[838,973]];
      this.journeyTo(points,'Let’s find a little room in the week.','The pigeon knows a quiet lookout. A good place to begin a plan.',()=>this.day(),'The riverside lookout');
    },
    journeyTo(points,title,line,done,place){
      this.screen('walking',title,line,'→');if(place)$('location').textContent=place;this.move(points,done,135);if(this.travel)action('Skip the walk',()=>this.finishTravel(),'secondary');
    },
    food(){
      this.screen('food','What sounds good this time?','A few possibilities on the inn’s noticeboard. Pick what sounds like us; I’ll find the actual place.','04 / 06');if(!this.editing)$('location').textContent='The little inn';
      $('actions').className='routes';Object.entries(C.activities(this.plan)).forEach(([key,label])=>action(label,()=>{C.choose(this.plan,'activity',key);this.plan.status='draft';this.save();this.packing.setVisible(true);this.blanket.setVisible(key==='picnic');if(this.editing){this.editing=false;this.review();}else this.drinkStop();},'choice'));focusAction();
    },
    drinkStop(){
      this.screen('drinks','Two iced drinks. Finally.','Two very overdue drinks, written into the plan. The basket gets its proper outing on our date.','04 / 06','THE KNIGHT HAS REMEMBERED');
      this.drinks.setVisible(true);if(!reduced())this.tweens.add({targets:this.drinks,y:{from:-14,to:0},alpha:{from:0,to:1},duration:500,ease:'Sine.easeOut'});
      $('inventory').hidden=false;$('inventory').textContent='✓ Food + two overdue iced drinks';
      action('Take our little plan home',()=>this.headHome());
      links([['Change the outing',()=>this.food()]]);focusAction();
    },
    day(){
      this.screen('day','When shall we make it happen?','Choose a day that might work. We’ll settle the exact place and time together.','03 / 06');$('inventory').hidden=true;if(!this.editing)$('location').textContent='The riverside lookout';
      const wrap=document.createElement('div');wrap.className='date-choice';const label=document.createElement('label');label.htmlFor='outing-day';label.textContent='A day that suits you';const input=document.createElement('input');input.type='date';input.id='outing-day';input.min=C.today();if(C.validDay(this.plan.day)&&this.plan.day!=='flexible')input.value=this.plan.day;wrap.append(label,input);$('actions').append(wrap);
      const error=document.createElement('p');error.className='field-error';error.setAttribute('role','alert');$('actions').append(error);
      action('That day looks good',()=>{if(!C.validDay(input.value)||input.value==='flexible'){error.textContent='Choose today or a later date, or we can arrange it by text.';input.focus();return;}C.choose(this.plan,'day',input.value);this.save();this.afterDay();});
      action('Let’s choose a day by text',()=>{C.choose(this.plan,'day','flexible');this.save();this.afterDay();},'secondary');focusAction();
    },
    afterDay(){if(this.editing){this.editing=false;this.review();}else this.timeChoice();},
    timeChoice(){
      this.screen('time','And your kind of hour?','A morning together, a relaxed lunch, a slow afternoon, or something towards evening?','03 / 06');$('actions').className='routes';
      Object.entries(C.options.time).forEach(([key,label])=>action(label,()=>{C.choose(this.plan,'time',key);this.plan.status='draft';this.save();this.setHourLight(key,reduced());if(this.editing){this.editing=false;this.review();}else this.journeyTo([[816,910],[816,816],[880,772],[926,744]],'A few delicious possibilities.','Let’s see what the little inn has on its noticeboard.',()=>this.food(),'The little inn');},'choice'));focusAction();
    },
    headHome(){
      this.screen('returning','That’s the beginning of a plan.','Let’s take it home. We can choose the actual place after this.','05 / 06');
      this.move([[1018,790],[1002,890],[964,1048],[840,1048],[760,1048],[688,1048],[624,1048],[552,1048],[496,1048],[448,900],[496,700],[496,512],[464,490],[464,398],[400,398],[350,410]],()=>this.home(),180);
      if(this.travel)action('Return to the castle',()=>this.finishTravel(),'secondary');
    },
    home(){
      this.screen('home','Back with something to look forward to.','The throne is already yours. The crown can wait until we’ve actually had our next adventure.','05 / 06');$('location').textContent='Home, with a little plan';$('inventory').hidden=true;
      this.carry.setVisible(false);this.packing.setVisible(false);this.planTable.setVisible(true);this.letterProp.setPosition(300,432).setDepth(461).setVisible(true);this.crown.setVisible(false);
      $('world').setAttribute('aria-label','Back at the castle, a little written plan lies beside the inherited throne. The next crown is still unearned.');
      action('Leave the finding-a-place part with me',()=>this.knightDeparture());focusAction();
    },
    knightDeparture(){
      this.screen('knight-leaving','I’ll take it from here.','I’ll find somewhere that fits. Check our little plan, then send the pigeon after me.','05 / 06');
      this.pigeon.setPosition(368,389);this.knightAway=true;this.gate.setAlpha(0);
      this.castMove(this.knight,[[400,398],[464,398],[464,478],[496,520],[540,554]],()=>{this.knight.setVisible(false);this.review();},160);
      if(this.castMotion)action('Wave your knight off',()=>this.finishCast(),'secondary');
    },
    review(){
      if(!C.ready(this.plan)){this.screen('review','A little detail is still missing.','Let’s finish the plan before sending the pigeon.','06 / 06');action('Finish our choices',()=>{if(!C.options.travel[this.plan.travel])this.crossroads();else if(!C.ranges[this.plan.travel]?.[this.plan.range])this.range();else if(!C.validDay(this.plan.day))this.day();else if(!this.plan.time)this.timeChoice();else this.food();});return;}
      this.finishCast(false);this.knight.setVisible(false);this.knightAway=true;this.planTable.setVisible(true);this.letterProp.setPosition(300,432).setDepth(461).setVisible(true);this.pigeon.setPosition(368,389).setVisible(true);
      this.screen('review','A little note for your knight.','He’s off to make arrangements. Send the pigeon after him with your choices.','06 / 06','A REPLY FROM THE CASTLE');$('location').textContent='Our little plan';document.querySelector('.dialogue').classList.add('review');
      const dl=document.createElement('dl');dl.className='plan-details';C.rows(this.plan).forEach(([label,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;dl.append(dt,dd);});$('actions').append(dl);
      const details=document.createElement('details');details.className='plan-note';const summary=document.createElement('summary');summary.textContent='Anything else I should know?';const note=document.createElement('textarea');note.maxLength=300;note.rows=2;note.setAttribute('aria-label','An optional note about our outing');note.placeholder='A preference, a must-have, or something to avoid…';note.value=this.plan.note;note.oninput=()=>{this.plan.note=note.value;this.save();};details.append(summary,note);$('actions').append(details);
      if(isLocal)$('hint').textContent='LOCAL PREVIEW · SAVES ON THIS DEVICE';action('Send with the pigeon',()=>this.sendPlan());links([['Change details',()=>this.editPlan()],['Not this time',()=>this.decline()]]);focusAction();
    },
    editPlan(){
      this.screen('editing','A little adjustment?','Change any part of the plan. The other choices will stay put.','06 / 06');$('actions').className='routes';[['Where & travel',()=>this.crossroads()],['The outing',()=>this.food()],['The day',()=>this.day()],['The time',()=>this.timeChoice()]].forEach(([label,fn])=>action(label,()=>{this.editing=true;fn();},'choice'));action('Back to our plan',()=>this.review(),'secondary');action('Clear choices and start again',()=>{this.plan=C.initial();this.save();this.start();},'secondary');focusAction();
    },
    async sendPlan(){
      if(this.sending||!C.ready(this.plan))return;this.sending=true;const button=$('actions').querySelector('.primary');button.disabled=true;button.textContent='The pigeon is getting ready…';
      try{
        if(!isLocal){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice:'sealed',picks:C.payload(this.plan),updated:this.plan.status==='sent'}),signal:controller.signal});if(!r.ok)throw new Error('not received');}finally{clearTimeout(timer);}}
        this.plan.status=isLocal?'draft':'sent';const stored=this.save();this.waiting(isLocal,stored);
      }catch{this.screen('send-error','The pigeon needs another moment.','Your choices are still here. Try again, or copy the plan and send it by text.','06 / 06');action('Try sending again',()=>this.sendPlan());action('Copy our plan',()=>this.copyPlan(),'secondary');}
      finally{this.sending=false;}
    },
    waiting(local=false,stored=true){
      this.screen('waiting',local?'A little plan, ready to share.':'The pigeon has your plan.',local?(stored?'Your draft is saved on this device. Copy it to share, or keep exploring the kingdom.':'This browser couldn’t save the draft. Copy it before leaving this page.'):'I’ll find somewhere that fits and come back with the details. No need to choose the whole map today.','STOP 02 · TAKING SHAPE','THE PIGEON KNOWS THE WAY');
      this.knight.setVisible(false);this.knightAway=true;this.letterProp.setVisible(false);this.carry.setVisible(false);action('Look at our little kingdom',()=>this.openMap());links([['Copy our plan',()=>this.copyPlan()],['Change the plan',()=>this.review()]]);this.frameParty(reduced());focusAction();
      this.castMove(this.pigeon,[[470,355],[610,250],[800,140]],()=>this.pigeon.setVisible(false),245);
    },
    async copyPlan(){
      const text=this.config.stage==='proposed'?this.itineraryText():C.text(this.plan);
      try{await navigator.clipboard.writeText(text);$('hint').textContent='COPIED · READY TO SHARE BY TEXT';}catch{const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.rows=6;area.setAttribute('aria-label','Select and copy our date plan');$('actions').append(area);area.focus();area.select();$('hint').textContent='SELECT THE PLAN TO COPY IT';}
    },
    decline(){this.screen('decline','We can leave this chapter open.','No problem. The castle and its slightly opinionated residents will still be here.','ANOTHER DAY');action('Back to the kingdom',()=>this.start());action('Actually, show me the plan',()=>this.review(),'secondary');},
    snapshotPanel(){return {worldLabel:$('world').getAttribute('aria-label'),phase:this.phase,title:$('line-title').textContent,line:$('line').textContent,speaker:$('speaker').textContent,progress:$('progress').textContent,hint:$('hint').textContent,nodes:[...$('actions').childNodes],className:$('actions').className,review:document.querySelector('.dialogue').classList.contains('review'),letter:document.querySelector('.dialogue').classList.contains('letter'),point:{...this.cameraPoint},zoom:this.cameras.main.zoom};},
    restorePanel(s){this.screen(s.phase,s.title,s.line,s.progress,s.speaker);$('hint').textContent=s.hint;$('world').setAttribute('aria-label',s.worldLabel);$('actions').className=s.className;$('actions').replaceChildren(...s.nodes);document.querySelector('.dialogue').classList.toggle('review',s.review);document.querySelector('.dialogue').classList.toggle('letter',s.letter);this.cameras.main.useBounds=true;this.cameras.main.setZoom(s.zoom);Object.assign(this.cameraPoint,s.point);this.cameras.main.startFollow(this.cameraPoint,true,cameraFollow,cameraFollow);focusAction();},
    lookAt(x,y){const panel=document.querySelector('.dialogue').offsetTop,cam=this.cameras.main;this.cameraPoint.x=x;this.cameraPoint.y=y+(this.scale.height/2-(100+panel)/2)/cam.zoom;if(reduced())cam.centerOn(this.cameraPoint.x,this.cameraPoint.y);},
    petTour(){this.petReturn=this.snapshotPanel();this.showResident(this.ruby,true);},
    showResident(p,force=false){
      if(!force&&!['start','home','pets','waiting','completed'].includes(this.phase))return;
      if(this.phase!=='pets'&&!force)this.petReturn=this.snapshotPanel();
      this.screen('pets',p.petName,p.description,'AT HOME IN THE KINGDOM','THE CASTLE RESIDENTS');
      const pets=[this.ruby,this.topaz,this.mini,this.ducks[0],this.ducks[1],this.ducks[2],this.ducks[3],this.residents[3],this.residents.at(-1)];
      const row=document.createElement('div');row.className='pet-list';pets.forEach(q=>{const b=document.createElement('button');b.textContent=q===this.ducks[3]?'8 ducklings':q.petName;b.setAttribute('aria-pressed',String(q===p));b.onclick=()=>this.showResident(q,true);row.append(b);});$('actions').append(row);action('Back to our adventure',()=>this.restorePanel(this.petReturn));this.lookAt(p.x,p.y);focusAction();
    },
    openMemory(){
      if(!['start','home','waiting','memory'].includes(this.phase))return;if(this.phase!=='memory')this.memoryReturn=this.snapshotPanel();
      const memories=[['Ambury, our first chapter.','A walk, flowers and a few little gifts. You spotted things I would have walked straight past.'],['A very sharp lookout.','You spotted everything. I mostly spotted you spotting everything.'],['Still calling it green?','Dark green. Apparently this was a more complicated question than I’d prepared for.']];let index=0;
      const show=()=>{this.screen('memory',...memories[index],'DATE 1 · ALREADY OURS','A LITTLE MEMORY');action(index<2?'Another little memory':'Back to the castle',()=>{if(index<2){index++;show();}else this.restorePanel(this.memoryReturn);});action('Back to our adventure',()=>this.restorePanel(this.memoryReturn),'secondary');this.lookAt(-210,380);};show();
    },
    openReward(){if(!['start','home','waiting','completed'].includes(this.phase))return;const saved=this.snapshotPanel();this.screen('memory',this.config.stage==='completed'?'A crown, and another memory.':'One adventure at a time.',this.config.stage==='completed'?'The next piece of the kingdom belongs here now.':'The throne came from our first date. This cushion can wait for the next chapter to actually happen.','THE CASTLE IS GROWING');action('Back to the kingdom',()=>this.restorePanel(saved));this.lookAt(383,350);},
    openMap(){
      if(this.castMotion?.actor===this.pigeon)this.finishCast();if(this.travel||this.castMotion||this.phase==='map')return;const saved=this.snapshotPanel();this.screen('map','We don’t need the whole map yet.','One place to come home to. One new adventure ahead.','OUR LITTLE KINGDOM');action('Back to where we were',()=>{this.mapLabels.forEach(x=>x.destroy());this.mapLabels=[];this.restorePanel(saved);});
      const cam=this.cameras.main,z=Math.min(this.scale.width/1650,(document.querySelector('.dialogue').offsetTop-95)/1450,.65);cam.stopFollow();cam.useBounds=false;cam.setZoom(z);cam.centerOn(350,450+(this.scale.height/2-(95+document.querySelector('.dialogue').offsetTop)/2)/z);
      this.mapLabels=[];[[-210,380,'Ambury · 01'],[350,300,'Our castle'],[870,710,'Next adventure · 02'],[35,690,'The pond'],[40,-220,'Unexplored']].forEach(([x,y,text])=>{const t=this.add.text(x,y,text,{fontFamily:'Pixelify Sans',fontSize:'12px',color:'#fff0c5',backgroundColor:'#2f4936',padding:{x:5,y:4}}).setOrigin(.5).setScale(1/z).setDepth(5000);this.mapLabels.push(t);});focusAction();
    },
    itineraryText(){const i=this.config.itinerary;return 'OUR NEXT STOP\n'+i.venue+'\n'+(i.address||'')+'\n'+C.dayLabel(i.day)+' · '+i.time+'\n'+(i.meeting||'')+'\n'+(i.note||'');},
    showItinerary(){
      const i=this.config.itinerary;this.screen('itinerary','The pigeon brought the details.','A place, a time, and something to look forward to. Does this work for you?','STOP 02 · READY WHEN YOU ARE');document.querySelector('.dialogue').classList.add('review');
      const dl=document.createElement('dl');dl.className='plan-details';[['Where',i.venue],['Address',i.address],['When',C.dayLabel(i.day)+' · '+i.time],['Meeting',i.meeting],['A little note',i.note]].filter(([,v])=>v).forEach(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);});$('actions').append(dl);
      const map=document.createElement('a');map.className='secondary map-link';map.textContent='Open the place in Maps';map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(i.venue+' '+(i.address||''));map.target='_blank';map.rel='noopener';$('actions').append(map);
      action('That sounds lovely',()=>this.confirmItinerary());action('Can we adjust something?',()=>{this.screen('adjust','Of course. What shall we change?','Copy the details and tell me what would suit you better. We’ll work it out together.','STOP 02');action('Copy the details',()=>this.copyPlan());action('Back to the proposed plan',()=>this.showItinerary(),'secondary');},'secondary');this.frameParty(true);focusAction();
    },
    async confirmItinerary(){
      if(this.sending)return;this.sending=true;const b=$('actions').querySelector('.primary');b.disabled=true;
      try{if(!isLocal){const r=await fetch('/api/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({choice:'sealed',picks:{date:'Date 2 itinerary confirmed',place:this.config.itinerary.venue,day:C.dayLabel(this.config.itinerary.day),hour:this.config.itinerary.time}}),signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('not received');}
        this.plan.status='confirmed';this.save();this.screen('confirmed',isLocal?'Confirmation preview.':'It’s a date.','The crown can wait. First, we have an adventure to go on.','STOP 02 · SEE YOU SOON');action('Look around the kingdom',()=>this.openMap());action('Read the details again',()=>this.showItinerary(),'secondary');
      }catch{this.screen('send-error','Let’s confirm by text.','The pigeon couldn’t quite get through. Your plan is still here to copy and share.','STOP 02');action('Copy the details',()=>this.copyPlan());action('Try again',()=>this.showItinerary(),'secondary');}finally{this.sending=false;}
    },
    showCompleted(){this.knight.setVisible(true);this.knightAway=false;this.screen('completed','Another memory. Another piece of home.',typeof this.config.memory==='string'?this.config.memory:'The crown has found its place. The next chapter can stay unwritten for a little while.','STOP 02 · A MEMORY NOW');this.crown.setVisible(true);action('Look at our little kingdom',()=>this.openMap());links([['Visit the residents',()=>this.petTour()],['Remember Ambury',()=>{this.phase='home';this.openMemory();}]]);this.lookAt(350,385);}
  });
};
