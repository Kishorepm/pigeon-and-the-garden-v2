/* Current regional weather, with an explicitly labelled, device-only sky preview. */
window.KingdomSky=new (class extends EventTarget{
  constructor(){
    super();this.mode='live';this.data=null;this.busy=false;this.failed=false;
    try{const saved=JSON.parse(localStorage.getItem('kingdom-weather-v2'));if(KingdomWeatherModel.valid(saved)&&KingdomWeatherModel.age(saved)<360)this.data=saved;}catch{}
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&(!this.lastAttempt||Date.now()-this.lastAttempt>900000))this.refresh();});
  }
  current(){return this.mode==='live'?(this.data&&KingdomWeatherModel.age(this.data)<360?this.data:null):KingdomWeatherModel.sample(this.mode);}
  status(){return this.mode!=='live'?'preview':!this.current()?(this.busy?'loading':'offline'):this.failed||this.data?.stale||KingdomWeatherModel.age(this.data)>60?'earlier':'current';}
  emit(){this.dispatchEvent(new Event('change'));}
  preview(mode){if(mode!=='live'&&!Object.hasOwn(KingdomWeatherModel.modes,mode))return;this.mode=mode;this.emit();if(mode==='live'&&(!this.data||this.failed))this.refresh();}
  async json(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7500);try{const r=await fetch(url,{signal:controller.signal,credentials:'omit'});if(!r.ok)throw Error('Weather unavailable');return await r.json();}finally{clearTimeout(timer);}}
  async refresh(){
    if(this.busy)return;this.busy=true;this.lastAttempt=Date.now();this.emit();
    try{
      let data;try{data=await this.json('/api/kingdom-weather');if(!KingdomWeatherModel.valid(data))throw Error('Incomplete weather');}
      catch{data=KingdomWeatherModel.normalize(await this.json(KingdomWeatherModel.url));}
      this.data=data;this.failed=data.stale===true;try{localStorage.setItem('kingdom-weather-v2',JSON.stringify(data));}catch{}
    }catch{this.failed=true;}finally{this.busy=false;this.emit();}
  }
})();

KingdomSky.panel=({form,select,button})=>{
  const sky=KingdomSky,M=KingdomWeatherModel,w=sky.current(),status=sky.status(),preview=status==='preview',light=M.daylight(sky.data);
  const time=value=>new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',hour:'numeric',minute:'2-digit'}).format(value);
  const title=preview?w.label:status==='loading'?'Finding our weather…':status==='offline'?'A little daylight.':M.modes[w.kind];
  const detail=preview?'A sky you chose, just on this device. The clock still follows Auckland.':status==='offline'?'Weather is unavailable for now. The world still follows Auckland time. Try again whenever you like.':status==='loading'?'The world follows Auckland time while we check the sky.':`Conditions from ${time(w.observedAt)} · ${M.age(w)} minutes ago. ${status==='earlier'?'These are earlier conditions; the next check may bring a fresher sky.':'The world follows this regional weather.'}`;
  return `<div class="sky-view" data-kind="${w?.kind||'cloud'}" data-light="${light.phase.toLowerCase()}" aria-hidden="true"><span class="sky-cloud"></span><span class="sky-drops"></span></div><span class="sky-mode">${preview?'SKY PREVIEW · THIS DEVICE':status==='earlier'?'EARLIER WEATHER':status==='offline'?'WEATHER OFFLINE':'FOLLOWING AUCKLAND'}</span><div class="sky-heading"><h3>${title}</h3>${!preview&&w?`<span class="sky-temperature">${w.temperature}°C</span>`:''}</div><p>${detail}</p><div class="sky-detail"><span>Time of day<strong>${light.phase}</strong></span>${!preview&&w?`<span>Wind<strong>${Math.round(w.wind)} km/h</strong></span><span>Rainfall<strong>${w.precipitation} mm</strong></span>`:''}</div><div class="row-actions">${preview?button('Follow Auckland again','sky-live','','primary'):`<button data-act="sky-refresh" ${sky.busy?'disabled':''}>${sky.busy?'Checking the sky…':'Refresh weather'}</button>`}</div><details class="sky-preview"><summary>Try a different sky</summary><p>See how the kingdom feels in rain, mist or even snow. This is a visual preview; it changes no shared data.</p>${form('sky',select('Choose a sky','sky',Object.entries(M.modes),preview?sky.mode:'rain'),'Preview this sky')}</details><p class="sky-source">Regional model weather from <a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Open-Meteo ↗</a>, checked every 15 minutes while the app is open. Conditions may differ at your doorstep. No device location is requested.</p>`;
};

window.KingdomAtmosphere=class{
  constructor(scene,reduced){
    this.s=scene;this.reduced=reduced;this.time=0;this.lastFrame=performance.now();this.tone=scene.add.graphics().setScrollFactor(0).setDepth(3800);this.air=scene.add.graphics().setScrollFactor(0).setDepth(4100);this.ground=scene.add.graphics().setDepth(4);
    this.level=0;this.apply=()=>{const w=KingdomSky.current();scene.weather=w;scene.wet=['rain','storm'].includes(w?.kind);scene.updateClock();KingdomSound.weather(w||false);this.reflect();};
    KingdomSky.addEventListener('change',this.apply);this.apply();KingdomSky.refresh();
    this.timer=setInterval(()=>{if(!document.hidden)KingdomSky.refresh();},900000);
    scene.events.once('shutdown',()=>{KingdomSky.removeEventListener('change',this.apply);clearInterval(this.timer);});
  }
  reflect(){
    const w=KingdomSky.current(),status=KingdomSky.status(),el=document.getElementById('realm-weather');
    el.textContent=status==='preview'?'Preview · '+w.label:status==='loading'?'Finding our weather…':status==='offline'?'Daylight only · weather offline':`${w.temperature}° · ${w.label}${status==='earlier'?' · earlier':''}`;
    document.getElementById('weather-open').dataset.mode=status;
  }
  update(){
    // Atmosphere follows elapsed time, independently of the capped walking
    // timestep. A slow renderer must not turn a short sky fade into a long wait.
    const now=performance.now(),dt=Math.min(1,Math.max(0,(now-this.lastFrame)/1000));this.lastFrame=now;
    const s=this.s,cam=s.cameras.main,w=KingdomSky.current(),still=this.reduced()||document.hidden||document.getElementById('book').open||document.getElementById('credits').open;
    if(!still)this.time+=dt;const t=this.time,width=cam.width,height=cam.height,type=w?.kind||'clear';
    for(const g of [this.air,this.tone])g.setPosition(width/2-width/(2*cam.zoom),height/2-height/(2*cam.zoom)).setScale(1/cam.zoom).clear();this.ground.clear();
    const wanted=({clear:.005,cloud:.055,rain:.09,storm:.15,fog:.06,snow:.055})[type];this.level+=(wanted-this.level)*(this.reduced()?1:1-Math.exp(-dt*.7));
    this.tone.fillStyle(type==='fog'?0xc9d3bd:0x183840,this.level).fillRect(0,0,width,height);
    if(w&&w.cloud>15&&type!=='fog'){
      const speed=3+Math.min(w.wind,50)*.25;
      for(let i=0;i<4;i++){const x=((i*251+t*speed)%(width+440))-220,y=height*(.14+i*.24);this.tone.fillStyle(0x274247,.025+w.cloud*.00025).fillEllipse(x,y,290,65).fillEllipse(x+84,y-20,235,78);}
    }
    if(type==='fog')for(let i=0;i<5;i++){const x=((i*137+t*5)%(width+350))-175;this.air.fillStyle(0xdbe1cf,.085).fillEllipse(x,height*(.14+i*.2),width*.8,65).fillEllipse(x+100,height*(.14+i*.2)+14,width*.75,41);}
    if(['rain','storm','snow'].includes(type)){
      const count=this.reduced()?12:Math.round((width<600?45:78)*(type==='storm'?1.25:1));
      const speed=type==='snow'?23:type==='storm'?230:155,wind=-Math.sin((w.direction||0)*Math.PI/180)*Math.min(w.wind,55)*1.1;
      for(let i=0;i<count;i++){
        const x=((i*83+t*wind)%(width+50)+width+50)%(width+50)-25,y=(i*137+t*speed)%(height+25)-12;
        if(type==='snow')this.air.fillStyle(0xe7eee1,.65).fillRect(Math.round(x+Math.sin(t+i)*5),Math.round(y),i%3?2:3,2);
        else this.air.lineStyle(i%4?1:2,0xc1dbda,this.reduced()?.25:.4).lineBetween(Math.round(x),Math.round(y),Math.round(x+wind*.04),Math.round(y+7+i%5));
      }
      if(type!=='snow'){
        const cx=Math.round(s.active.x/80)*80,cy=Math.round(s.active.y/80)*80;
        for(let i=0;i<16;i++){const x=cx-190+(i*73)%370,y=cy-180+(i*97)%350;if(!s.navigation.walkable(x,y))continue;
          const cycle=(t*1.5+i*.37)%1;this.ground.fillStyle(0x657f76,.15).fillEllipse(x,y,12+i%3*5,4+i%3);
          if(!this.reduced())this.ground.lineStyle(1,0xd3e0c5,(1-cycle)*.3).strokeEllipse(x,y,4+cycle*12,2+cycle*4);
        }
      }
    }
    // Sparse wind-borne leaves give dry weather movement too. No flashing lightning.
    if(!this.reduced()&&w?.wind>=16&&type!=='snow'&&type!=='fog')for(let i=0;i<7;i++){
      const x=(i*131+t*(15+w.wind))%(width+40)-20,y=height*.2+(i*107)%(height*.65)+Math.sin(t+i)*10;
      this.air.fillStyle(0xccba79,.45).fillRect(Math.round(x),Math.round(y),4,2);
    }
  }
};
