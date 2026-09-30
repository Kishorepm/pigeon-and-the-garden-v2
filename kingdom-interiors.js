/* Orthographic cutaway rooms: small pixel textures, depth sorting and local light.
   The outdoor Canvas renderer and its touch controls are deliberately shared. */
window.KingdomInteriors=class {
  constructor(scene,reduced){
    this.s=scene;this.reduced=reduced;this.active=false;this.objects=[];this.route=null;this.seated=false;this.fireLit=true;
    this.abort=new AbortController();const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:this.abort.signal});
    this.hud=document.getElementById('room-hud');this.brewHUD=document.getElementById('brew-hud');
    on(document.getElementById('room-exit'),'click',()=>this.exit());
    on(document.getElementById('room-guide'),'click',()=>{document.getElementById('toast').hidden=true;KingdomUI.open('room-guide');});
    on(window,'kingdom-room-use',e=>{if(this.active)this.approach(this.room.stations.find(st=>st.id===e.detail));});
    on(window,'keydown',e=>{if(e.code==='Escape'&&this.active&&!document.getElementById('book').open&&document.getElementById('explorer').hidden){e.preventDefault();this.brewing?this.closeBrew():this.exit();}});
    on(window,'blur',()=>this.stopPour());on(document,'visibilitychange',()=>this.stopPour());
    on(window,'kingdom-menu',()=>this.closeBrew());on(window,'kingdom-dialog',()=>{if(document.getElementById('book').open||document.getElementById('credits').open)this.closeBrew();});
    on(document.getElementById('brew-close'),'click',()=>this.closeBrew());
    on(document.getElementById('brew-again'),'click',()=>this.beginBrew());
    const pour=document.getElementById('brew-pour');
    on(pour,'pointerdown',e=>{if(e.button!==0||this.brewDone||!this.brewing)return;e.preventDefault();pour.setPointerCapture(e.pointerId);this.pouring=true;});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])on(pour,event,e=>this.stopPour(event==='pointerup'));
    on(pour,'keydown',e=>{if(['Space','Enter'].includes(e.code)&&!e.repeat&&!this.brewDone){e.preventDefault();this.pouring=true;}});
    on(pour,'keyup',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();this.stopPour(true);}});
    on(pour,'blur',()=>this.stopPour());
    scene.events.once('shutdown',()=>{this.exit();this.abort.abort();});
  }
  has(id){return !!KingdomInteriorModel.rooms[id];}
  add(object){this.objects.push(object);return object;}
  image(key,frame,x,y,depth=y){return this.add(this.s.add.image(x,y,key,frame).setOrigin(.5,1).setDepth(depth));}
  texture(key,w,h,draw){
    if(this.s.textures.exists(key))return key;
    const t=this.s.textures.createCanvas(key,w,h),c=t.context;c.imageSmoothingEnabled=false;draw(c,(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);});t.refresh();return key;
  }
  frames(){
    const definitions={
      'room-bed':{slate:[256,0,64,96],sage:[384,0,64,96]},
      'room-seat':{slate:[128,0,64,32],sage:[192,0,64,32],guild:[0,0,64,32],castle:[64,0,64,32],'slate-front':[128,18,64,14],'sage-front':[192,18,64,14],'guild-front':[0,18,64,14],'castle-front':[64,18,64,14]},
      'room-desk':{desk:[96,0,96,64]},'room-fire':{hearth:[0,0,96,96]},
      'room-shelf':{shelf:[0,32,64,32]},'room-chest':{chest:[0,0,32,32]},
      'room-mirror':{mirror:[0,0,64,64]},'room-painting':{park:[0,32,32,32],bay:[64,32,32,32]},
      'room-throne':{throne:[0,0,32,80]},'room-rug':{slate:[0,0,160,64],sage:[0,64,160,64]}
    };
    for(const [key,frames] of Object.entries(definitions)){const t=this.s.textures.get(key);for(const [name,box] of Object.entries(frames))if(!t.has(name))t.add(name,0,...box);}
  }
  enter(id){
    if(!this.has(id)||!KingdomUI.store.actor)return;
    if(this.active)this.exit(false);
    const s=this.s;s.life?.end();s.life?.clearReveal();s.cancelTravel();s.controls.reset();s.view.cancel();s.experience.dismiss(true);s.overview=false;s.poiLabels.forEach(t=>t.setVisible(false));
    this.room=KingdomInteriorModel.rooms[id];KingdomUI.room=this.room;this.id=id;this.returnPoint=[...KingdomPaths.nodes[KingdomPaths.places[id].node]];this.outdoorNavigation=s.navigation;
    this.exterior=new Map(s.children.list.map(o=>[o,o.visible]));this.active=true;this.route=null;this.fireLit=true;this.seated=false;
    this.exterior.forEach((_,o)=>{if(o!==s.active)o.setVisible(false);});s.active.setVisible(true).setPosition(0,116);s.setStride(s.active,'up',false);
    if(s.night)s.night.hidden=true;
    s.navigation=KingdomNavigation.create(this.room.obstacles,6,{bounds:KingdomInteriorModel.bounds,buildings:[],water:false,cell:8});
    this.frames();this.build();this.hud.hidden=false;document.getElementById('room-name').textContent=this.room.name;document.getElementById('room-copy').textContent=this.room.subtitle;
    document.querySelector('.adventure').classList.add('is-indoors');this.camera(true);this.light();this.reflect();
    KingdomSound?.place('indoor');document.getElementById('location').textContent=this.room.name;
    if(!this.reduced())s.cameras.main.fadeIn(350,23,44,35);
    try{const key='kingdom-room-seen:'+id;if(!localStorage.getItem(key)){KingdomUI.toast('Tap an object to walk over and use it. The door leads back outside.');localStorage.setItem(key,'seen');}}catch{}
    s.controls.nearbyId=null;this.nearby();
  }
  exteriorChange(fn){
    if(!this.active)return fn();
    this.exterior.forEach((visible,o)=>{if(o.active)o.setVisible(visible);});
    try{return fn();}finally{
      for(const o of this.s.children.list){if(!this.objects.includes(o)&&o!==this.s.active){this.exterior.set(o,o.visible);o.setVisible(false);}}
      this.s.active.setVisible(true);
    }
  }
  exit(restore=true){
    if(!this.active)return;const s=this.s;this.closeBrew();this.stand();this.route=null;this.active=false;
    this.objects.forEach(o=>o.destroy());this.objects=[];this.exterior.forEach((visible,o)=>{if(o.active)o.setVisible(visible);});this.exterior=null;
    this.flames=null;this.cup=null;this.throneDisplay=null;this.keepsakeDisplay=null;this.seatFront=null;this.petSprites=[];KingdomUI.room=null;
    s.navigation=this.outdoorNavigation;s.active.setPosition(...this.returnPoint);s.active.setVisible(true);s.setStride(s.active,'down',false);
    this.hud.hidden=true;document.querySelector('.adventure').classList.remove('is-indoors');if(s.night)s.night.hidden=false;
    s.controls.reset();s.controls.nearbyId=null;s.view.cancel();s.cameras.main.setBounds(-600,-770,2060,2390);s.cameras.main.useBounds=true;
    if(restore){s.view.apply();s.updateClock();KingdomSound?.place(this.id);document.getElementById('location').textContent=KingdomPaths.places[this.id].name;if(!this.reduced())s.cameras.main.fadeIn(280,23,44,35);}
  }
  build(){
    const s=this.s,theme=this.room.theme,stone=theme==='slate'||theme==='castle';
    this.add(s.add.rectangle(0,0,3600,3600,0x233a30).setDepth(-6000));
    const shell=this.texture('room-shell-'+theme,368,408,(c,r)=>{
      // The room stands above its shadow. The open front keeps the player visible.
      r('#132a24',0,23,368,385);r('#20362d',3,18,362,387);r('#394438',7,365,354,32);r('#68705a',12,358,344,32);r('#a39b76',12,358,344,3);
      r('#8e805c',16,82,336,277);const wood=s.textures.get('room-wood').getSourceImage();
      c.save();c.beginPath();c.rect(24,88,320,268);c.clip();for(let y=88;y<356;y+=32)for(let x=24;x<344;x+=32)c.drawImage(wood,stone?0:64,stone?96:0,32,32,x,y,32,32);c.restore();
      r('#182d2544',24,88,320,11);r('#172a2433',24,88,9,268);r('#e8d7a318',336,88,8,268);
      const wall=s.textures.get('walls').getSourceImage();for(let x=16;x<352;x+=32)for(let y=14;y<86;y+=32)c.drawImage(wall,stone?32:128,32,32,32,x,y,32,32);
      r(stone?'#899581':'#c5ae79',16,18,336,7);r('#d4c89a',16,16,336,3);r('#5e6147',16,82,336,9);r('#a4a076',16,82,336,3);
      for(const x of [16,76,284,344]){r('#504b36',x,18,7,72);r('#9a8156',x+1,20,2,64);}
      // Side walls are cut lower at the front, with visible stone thickness.
      for(const x of [12,344]){r('#535f4b',x,87,12,270);r('#a8aa82',x,87,12,4);r('#79866a',x+2,92,8,262);for(let y=104;y<352;y+=16)r('#52654e',x+2,y,8,2);}
      [16,230].forEach(x=>{r('#655c40',x,354,x===16?122:122,13);r('#c1ae78',x,354,122,3);});
      r('#554c37',144,354,80,19);for(let y=354;y<372;y+=6){r('#b7a06a',144,y,80,2);r('#7f704e',146,y+2,76,3);}
      r('#beac76',12,386,344,2);r('#394333',12,388,344,5);
    });
    this.image(shell,null,0,184,-1200);
    // Soft shadows are baked into small alpha textures, not full-screen filters.
    const glow=this.texture('room-warm-light',128,128,c=>{const g=c.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'#ffc98780');g.addColorStop(.4,'#ffc98732');g.addColorStop(1,'#ffc98700');c.fillStyle=g;c.fillRect(0,0,128,128);});
    this.floorLight=this.add(s.add.image(0,-97,glow).setScale(1.7,.8).setDepth(-900));
    this.windowLight=this.add(s.add.graphics().setDepth(-850));
    this.image('room-rug',theme==='sage'?'sage':'slate',0,48,-1000).setAlpha(.85);
    this.weatherWindows=this.add(s.add.graphics().setDepth(-700));
    this.windowTrim=this.add(s.add.graphics().setDepth(-650));
    for(const x of [-115,115]){
      const g=this.windowTrim;g.fillStyle(0x4b523c).fillRect(x-24,-189,48,48).fillStyle(0xb9a578).fillRect(x-25,-142,50,5).fillStyle(0xddcca0).fillRect(x-22,-188,44,3);
      g.fillStyle(0x806a46).fillRect(x-23,-188,4,45).fillRect(x+19,-188,4,45).fillRect(x-2,-188,4,45).fillRect(x-22,-166,44,3);
      const curtain=theme==='sage'?0x859b77:theme==='castle'?0xa58564:0x6a8591;
      g.fillStyle(curtain).fillRect(x-30,-188,7,42).fillRect(x+23,-188,7,42).fillStyle(0xc8b780).fillRect(x-29,-161,7,3).fillRect(x+23,-161,7,3);
    }
    this.shadow=this.add(s.add.graphics().setDepth(-800));
    this.hints=[];
    if(['north','south'].includes(this.id)){
      this.furniture('room-bed',theme,-113,-40,54,83);this.furniture('room-desk','desk',104,-23,70,38);
      this.image('room-shelf','shelf',111,-121,-120);this.books(91,-126,7);this.image('room-chest','chest',-139,6);
      this.image('room-mirror','mirror',-58,-89,-88).setScale(.64);
      this.image('room-painting','park',-53,-160,-119);this.image('room-painting','bay',-16,-160,-119);
      this.paper(98,-47);this.image('flowerpots','pot',137,-26,-22);
      this.furniture('room-seat',theme,-86,63,66,32);this.seatFront=this.image('room-seat',theme+'-front',-86,63,1000).setVisible(false);
      this.counter(105,73,theme);this.keepsakes(111,-128);
      this.details(theme);
      if(this.id==='south')this.makePets();
    }else if(this.id==='inn'){
      this.board(-98,-121);this.counter(104,-94,'guild');this.furniture('table','table',0,15,84,44);this.paper(-8,-13);this.paper(15,-11);
      this.furniture('room-seat','guild',-98,80,62,26);this.seatFront=this.image('room-seat','guild-front',-98,80,1000).setVisible(false);this.counter(106,80,'guild');
      this.image('room-shelf','shelf',-108,48,48);this.books(-131,42,8);
      this.details(theme);
    }else{
      this.throneDisplay=this.furniture('room-throne','throne',0,-95,72,33);this.image('room-rug','sage',0,-47,-999).setScale(.38,1.8);
      this.furniture('room-desk','desk',-114,-82,58,44).setScale(.65);this.furniture('room-desk','desk',114,-82,60,44).setScale(.65);this.keepsakes(116,-97);
      this.image('room-painting','park',-132,-102,-81);this.image('room-painting','bay',-103,-103,-81);this.paper(-115,-94);
      this.furniture('room-seat','castle',-82,64,63,28);this.seatFront=this.image('room-seat','castle-front',-82,64,1000).setVisible(false);this.image('room-chest','chest',98,63);this.image('flowerpots','pot',130,64);
      this.banner(-58,-165);this.banner(58,-165);
      this.details(theme);
    }
    if(this.id!=='castle'){
      this.furniture('room-fire','hearth',0,-110,86,18);this.flames=this.add(s.add.graphics().setDepth(-109));this.embers=this.add(s.add.graphics().setDepth(-108));
      this.image('room-shelf','shelf',0,-167,-109).setScale(.7);this.image('flowerpots','pot',-22,-169,-108);this.books(6,-172,4);
    }
    this.dust=this.add(s.add.graphics().setDepth(1100));this.marker=this.add(s.add.graphics().setDepth(-600));
    for(const station of this.room.stations){
      const [x,y]=station.point,[hx,hy,w,h]=this.hit(station);const hint=this.add(s.add.text(hx,hy-h/2-3,'✦',{fontFamily:'Pixelify Sans',fontSize:'11px',color:'#f4dca0'}).setOrigin(.5).setDepth(1200).setVisible(false));this.hints.push({station,hint});
      const zone=this.add(s.add.zone(hx,hy,w,h).setDepth(1000).setInteractive({useHandCursor:true}));
      zone.on('pointerdown',()=>s.worldAction(()=>this.approach(station)));
      zone.on('pointerover',()=>hint.setVisible(true));zone.on('pointerout',()=>hint.setVisible(false));
    }
    this.add(s.add.text(0,164,'OUTSIDE ↓',{fontFamily:'Pixelify Sans',fontSize:'9px',color:'#d9c899'}).setOrigin(.5).setDepth(500));
  }
  furniture(key,frame,x,y,w,h){this.shadow.fillStyle(0x182d23,.25).fillEllipse(x+4,y+3,w+10,h*.65);return this.image(key,frame,x,y);}
  hit(st){
    const home={hearth:[0,-157,92,82],mirror:[-58,-112,42,45],desk:[104,-54,96,54],letters:[-139,-10,34,32],memories:[-35,-176,74,32],keepsakes:[111,-137,66,37],seat:[-86,48,64,32],brew:[105,46,70,54],pets:[-112,103,80,35],exit:[0,143,80,34]};
    const guild={...home,board:[-98,-155,80,68],tasting:[104,-121,70,54],plans:[0,-15,64,60],seat:[-98,65,64,32],brew:[106,53,70,54]};
    const castle={throne:[0,-132,45,80],memories:[-114,-105,62,50],keepsakes:[114,-105,62,50],seat:[-82,49,64,32],capsules:[98,47,38,35],exit:home.exit};
    return (this.id==='inn'?guild:this.id==='castle'?castle:home)[st.id]||[...st.point,44,44];
  }
  details(theme){
    // Small signs of real life, rather than filling the floor with obstacles.
    const g=this.add(this.s.add.graphics().setDepth(-600)),sage=theme==='sage';
    if(theme==='sage'||theme==='slate'){
      this.image('flowerpots','pot',144,126,126).setScale(.9);this.image('plants','fern',144,123,123).setScale(.65);
      g.fillStyle(sage?0xc6a074:0x819787).fillRect(-158,-39,14,2).fillRect(-158,-39,2,22).fillRect(-158,-19,14,2);
      g.fillStyle(0x726146).fillRect(-159,-1,15,2).fillStyle(0xb89a63).fillRect(-155,-11,9,10).fillStyle(0xcba676).fillRect(-154,-10,7,2);
      // The flowers and the famously disputed green shirt from date one.
      const keeps=this.add(this.s.add.graphics().setDepth(-20));keeps.fillStyle(0x647d50).fillRect(124,-57,2,10).fillRect(130,-60,2,13).fillStyle(0xe8c4aa).fillRect(121,-61,7,5).fillRect(127,-64,7,5);
      if(!sage){g.fillStyle(0x354b3d).fillRect(-143,-31,14,10).fillRect(-147,-30,5,5).fillRect(-129,-30,5,5).fillStyle(0x6b7b4d).fillRect(-139,-31,5,2);}
      else{g.fillStyle(0xbfaf78).fillRect(-157,-15,9,2).fillStyle(0xd3c38e).fillRect(-157,-21,3,6);}
    }
    if(theme==='guild'){
      this.books(-132,42,8);this.paper(126,-116);
      const placard=this.add(this.s.add.text(-98,-113,'OUR NEXT ADVENTURE',{fontFamily:'Pixelify Sans',fontSize:'5px',color:'#ccb785'}).setOrigin(.5).setDepth(-110));
    }
    // Tiny wall sconces, with warm pools on the floor below.
    for(const x of [-148,148]){g.fillStyle(0x7f6846).fillRect(x-2,-157,5,13).fillStyle(0xc9aa71).fillRect(x-4,-155,9,8).fillStyle(0xf8dca0).fillRect(x-1,-155,3,7);this.add(this.s.add.image(x,-128,'room-warm-light').setScale(.65,.8).setAlpha(.3).setDepth(-840));}
  }
  books(x,y,count){
    const g=this.add(this.s.add.graphics().setDepth(y+3)),colours=[0x557275,0x9a614e,0xd3b57b,0x6c865f,0x9f9680];
    for(let i=0;i<count;i++){const h=8+i%3*2;g.fillStyle(0x443e30).fillRect(x+i*4,y-h,4,h).fillStyle(colours[i%5]).fillRect(x+i*4,y-h,3,h).fillStyle(0xe1c68e).fillRect(x+i*4,y-3,3,1);}
  }
  paper(x,y){const g=this.add(this.s.add.graphics().setDepth(y+20));g.fillStyle(0x453e2b,.25).fillRect(x-9,y-9,19,13).fillStyle(0xf1dfb5).fillRect(x-9,y-11,18,12).fillStyle(0xb09b71);for(let i=0;i<3;i++)g.fillRect(x-6,y-8+i*3,11-i*2,1);g.fillStyle(0x925b4a).fillRect(x+4,y-3,3,3);}
  counter(x,y,theme){
    this.shadow.fillStyle(0x192d24,.28).fillEllipse(x+3,y+3,68,17);
    const key=this.texture('room-counter-'+theme,70,54,(c,r)=>{r('#423e2f',3,19,64,34);r('#8d704b',5,21,60,31);r('#b99a62',5,20,60,3);[8,38].forEach(x=>{r('#685a40',x,25,25,22);r('#ad8d57',x+2,27,21,18);r('#ded0a0',x+18,34,2,2);});r('#584b33',0,15,70,8);r('#cebb86',0,15,70,3);r('#685746',7,0,14,15);r('#be9c64',9,3,10,8);r('#d6c393',33,8,8,8);r('#efe1b4',34,8,6,2);r('#99744e',35,12,5,3);r('#e2d0a0',54,5,8,11);r('#776044',55,7,6,1);});
    this.image(key,null,x,y);this.cup=this.add(this.s.add.graphics().setDepth(y+1));
  }
  board(x,y){
    const key=this.texture('room-mission-board',80,68,(c,r)=>{r('#433e2d',0,0,80,68);r('#a38a56',2,2,76,64);r('#6d6846',6,6,68,57);[[10,13],[39,11],[24,37],[55,35]].forEach(([x,y],i)=>{r('#f0dcad',x,y,21,23);r('#cfb687',x+2,y+2,17,2);r('#9e8b64',x+4,y+8,13,1);r('#9e8b64',x+4,y+12,11,1);r('#95614c',x+9,y+16,5,4);});r('#d1b577',0,0,80,3);});this.image(key,null,x,y);
  }
  banner(x,y){const g=this.add(this.s.add.graphics().setDepth(-110));g.fillStyle(0x554c37).fillRect(x-13,y-31,26,4).fillStyle(0x896453).fillRect(x-11,y-27,22,48).fillTriangle(x-11,y+21,x+11,y+21,x,y+30).fillStyle(0xdcc08a).fillRect(x-2,y-20,4,28).fillRect(x-7,y-12,14,4);}
  keepsakes(x,y){
    const crown=this.add(this.s.add.graphics().setDepth(y+30));crown.fillStyle(0xd7b86e).fillRect(x-17,y-5,17,5).fillTriangle(x-17,y-5,x-18,y-15,x-10,y-8).fillTriangle(x-10,y-8,x-8,y-17,x,y-5);
    const lantern=this.add(this.s.add.graphics().setDepth(y+30));lantern.fillStyle(0x997850).fillRect(x+10,y-19,13,20).fillStyle(0xf0d394).fillRect(x+13,y-16,7,13).fillStyle(0xffe9ab).fillRect(x+15,y-14,2,9);
    this.keepsakeDisplay={crown,lantern};
  }
  makePets(){
    const s=this.s;this.petSprites=[];
    const rug=this.add(s.add.graphics().setDepth(-950));rug.fillStyle(0x9ba080).fillEllipse(-112,110,80,29).fillStyle(0xc4bda0).fillEllipse(-112,108,72,22);
    for(const [name,x,y] of [['Ruby',-136,111],['Topaz',-111,113],['Mini',-87,111]]){
      const source=s.residents.find(p=>p.petName===name),key=source?.body?.texture.key;if(!key)continue;
      const pet=this.image(key,source.body.frame.name,x,y).setScale(.9);this.petSprites.push(pet);
      if(name==='Ruby'){const g=this.add(s.add.graphics().setDepth(y+1));g.fillStyle(0xae4d40).fillRect(x-7,y-11,3,9).fillRect(x-6,y-6,11,2);}
      if(name==='Mini'){const g=this.add(s.add.graphics().setDepth(y+1));g.fillStyle(0x8f6643).fillRect(x-6,y-13,5,3).fillRect(x+2,y-8,3,3);}
    }
  }
  reflect(){
    if(!this.active)return;const state=KingdomUI.store.view();
    for(const [id,sprite] of Object.entries(this.keepsakeDisplay||{}))sprite.setVisible(state.placements[id]===this.id);
    this.throneDisplay?.setVisible(state.placements.throne===this.id);
  }
  light(time=0){
    if(!this.active)return;
    const g=this.weatherWindows,sky=KingdomSky.current(),night=this.s.isNight;g.clear();
    this.windowLight.clear();for(const x of [-115,115])this.windowLight.fillStyle(night?0x90b5c8:0xf3ddb0,night?.025:.075).fillPoints([{x:x-18,y:-134},{x:x+18,y:-134},{x:x+55,y:-28},{x:x-5,y:-28}],true);
    for(const x of [-115,115]){
      g.fillStyle(night?0x304753:0xabc5c5).fillRect(x-19,-185,38,42).fillStyle(night?0x233f36:0x6b8a64).fillRect(x-19,-157,38,14);
      for(let i=0;i<3;i++)g.fillStyle(night?0x263e39:0x789261).fillTriangle(x-19+i*15,-153,x-10+i*15,-173+i*3,x-2+i*15,-153);
      if(night)g.fillStyle(0xe7ddbc).fillRect(x+7,-180,5,5);
      if(['rain','storm','drizzle'].includes(sky?.kind))for(let i=0;i<8;i++){const yy=-183+((i*7+(this.reduced()?0:time/90))%35);g.fillStyle(0xd1dfd6,.6).fillRect(x-17+(i*11)%32,yy,1,4);}
    }
    this.floorLight?.setAlpha(this.fireLit?(.75+(this.reduced()?0:Math.sin(time/740)*.05)):.15);
    if(this.flames){const f=this.flames;f.clear();if(this.fireLit){const flick=this.reduced()?0:Math.floor(time/280)%3;f.fillStyle(0x683e2a).fillRect(-21,-125,42,3);for(let i=0;i<9;i++){const h=5+(i*7+flick*3)%15;f.fillStyle(0xc47838).fillRect(-18+i*4,-126-h,4,h).fillStyle(0xe9b75d).fillRect(-18+i*4,-126-h+4,3,Math.max(2,h-4)).fillStyle(0xf8d98a).fillRect(-18+i*4,-129,2,3);}f.fillStyle(0x553b29).fillRect(-19,-124,19,3).fillRect(3,-126,17,3);}}
    this.dust.clear();if(!this.reduced())for(let i=0;i<7;i++){const x=-80+(i*31)%164,y=-130+((time/85+i*19)%110);this.dust.fillStyle(0xf5dfac,.12).fillRect(x,y,1,1);}
  }
  camera(snap=false){
    const s=this.s,w=s.scale.width,h=s.scale.height;
    if(snap||!this.cameraLayout||this.cameraLayout.w!==w||this.cameraLayout.h!==h){const top=w>=800?84:Math.max(180,this.hud.getBoundingClientRect().bottom+10),bottom=h<580?94:136;this.cameraLayout={w,h,top,safeHeight:Math.max(160,h-top-bottom)};}
    const {top,safeHeight}=this.cameraLayout,fit=Math.min((w-24)/368,safeHeight/408,1.85),zoom=Math.max(w>h&&h<580?.85:.45,fit)*s.view.factor;
    if(Math.abs(s.cameras.main.zoom-zoom)>.0001)s.cameras.main.setZoom(zoom);s.cameras.main.useBounds=false;
    const visibleW=w/zoom,visibleH=safeHeight/zoom;
    const x=visibleW>=368?0:Phaser.Math.Clamp(s.active.x,-184+visibleW/2,184-visibleW/2);
    const y=visibleH>=408?-18:Phaser.Math.Clamp(s.active.y-34,-224+visibleH/2,184-visibleH/2);
    // The camera follows the same invisible anchor as outdoors. Keep it above the dock.
    s.cameraPoint.x=x;s.cameraPoint.y=y+(h/2-(top+safeHeight/2))/zoom;
    if(snap||this.reduced())s.cameras.main.centerOn(s.cameraPoint.x,s.cameraPoint.y);
    if(snap)s.view.reflect();return true;
  }
  walkTo(point,station=null){
    this.stand();if(this.brewing)this.closeBrew();
    const points=this.s.navigation.route([this.s.active.x,this.s.active.y],point);
    if(!points){KingdomUI.toast('Walk on the floor, or tap an object to use it.');return;}
    this.s.controls.reset();this.route={points,index:0,station};this.marker.clear().lineStyle(1,0xe8ca88,.65).strokeEllipse(...point,14,6);
    if(this.reduced()){this.s.active.setPosition(...points.at(-1));this.route=null;this.marker.clear();if(station)this.use(station);this.camera(true);}
  }
  approach(station){if(!station||!this.active||!this.s.canWalk())return;this.walkTo(station.point,station);}
  nearby(){
    if(this.brewing)return null;
    if(this.seated)return {id:'room-stand',name:this.sitStation.name,action:'Stand up'};
    let best=null,distance=Infinity;
    for(const st of this.room.stations){const d=Math.hypot(this.s.active.x-st.point[0],this.s.active.y-st.point[1]);if(d<35&&d<distance){best={...st,id:'room-'+st.id};distance=d;}}
    return best;
  }
  interact(){if(this.seated){this.stand();return;}const st=this.nearby();if(st)this.use(this.room.stations.find(p=>'room-'+p.id===st.id));}
  use(st){
    if(!st)return;this.route=null;this.marker.clear();this.s.controls.reset();this.s.setStride(this.s.active,'up',false);
    if(st.kind==='exit')this.exit();
    else if(st.kind==='panel')KingdomUI.open(st.panel);
    else if(st.kind==='fire'){this.fireLit=!this.fireLit;KingdomSound.effect('fire');KingdomUI.toast(this.fireLit?'The hearth is warm again.':'A quiet moment, with the embers low.');this.light();}
    else if(st.kind==='sit'){this.seated=true;this.sitStation=st;this.sitReturn=[...st.point];this.s.active.setPosition(st.point[0],this.seatFront.y+3);this.s.setStride(this.s.active,'down',false);this.s.active.shadow?.setVisible(false);this.seatFront.setVisible(true);KingdomUI.toast('Stay a while. Walk or press E when you’re ready.');}
    else if(st.kind==='brew')this.beginBrew();
    if(this.active)this.s.active.setDepth(this.s.active.y);
    this.s.controls.nearbyId=null;
  }
  stand(){if(!this.seated)return;this.seated=false;this.s.active.setPosition(...this.sitReturn);this.seatFront?.setVisible(false);this.s.active.shadow?.setVisible(true);this.s.controls.nearbyId=null;}
  beginBrew(){
    this.s.controls.reset();this.route=null;this.brewing=true;this.brewDone=false;this.pouring=false;this.pourTime=0;this.brewHUD.hidden=false;
    document.getElementById('toast').hidden=true;
    document.querySelector('.adventure').classList.add('is-brewing');document.getElementById('brew-pour').hidden=false;document.getElementById('brew-again').hidden=true;
    document.getElementById('brew-title').textContent='A little iced mocha';document.getElementById('brew-copy').textContent='Hold to pour. Release when the drink reaches the golden band.';this.paintBrew();
  }
  stopPour(finish=false){
    const wasPouring=this.pouring;this.pouring=false;
    if(!finish||!wasPouring||!this.brewing||this.brewDone||this.pourTime<.05)return;
    this.brewDone=true;const fill=KingdomInteriorModel.pour(this.pourTime);document.getElementById('brew-title').textContent=KingdomInteriorModel.result(fill);
    document.getElementById('brew-copy').textContent='Your cup is on the counter. A little ritual, just for this visit.';document.getElementById('brew-pour').hidden=true;document.getElementById('brew-again').hidden=false;
    this.cup?.clear().fillStyle(0xe3d5b5).fillRect(2,-38,8,11).fillStyle(0x896345).fillRect(3,-34,6,6).fillStyle(0xf0e5c5).fillRect(3,-37,6,2);this.cup?.setPosition(105,this.id==='inn'?80:73);KingdomSound.effect('return');
  }
  paintBrew(){const fill=KingdomInteriorModel.pour(this.pourTime);document.getElementById('brew-fill').style.height=(fill*100)+'%';document.getElementById('brew-meter').setAttribute('aria-valuenow',String(Math.round(fill*100)));}
  closeBrew(){this.stopPour();this.brewing=false;this.brewHUD.hidden=true;document.querySelector('.adventure').classList.remove('is-brewing');this.s.controls.reset();this.s.controls.nearbyId=null;}
  cancelTravel(){this.route=null;this.marker?.clear();}
  update(time,dt,canWalk){
    const s=this.s;if(this.brewing){if(!canWalk)this.stopPour();if(this.pouring){this.pourTime+=dt;this.paintBrew();if(this.pourTime>=2.8)this.stopPour(true);}}
    const input=this.brewing?{x:0,y:0,fast:false}:s.controls.sample(),before=[s.active.x,s.active.y];let direction=s.active.direction;
    if(canWalk&&!this.brewing&&(input.x||input.y)){this.stand();this.cancelTravel();const speed=input.fast?105:73;s.active.setPosition(...s.navigation.move(s.active.x,s.active.y,input.x*speed*dt,input.y*speed*dt));direction=Math.abs(input.x)>Math.abs(input.y)?input.x>0?'right':'left':input.y>0?'down':'up';}
    else if(canWalk&&this.route){const route=this.route,p=route.points[route.index],dx=p[0]-s.active.x,dy=p[1]-s.active.y,d=Math.hypot(dx,dy),step=Math.min(d,73*dt);if(d){s.active.x+=dx/d*step;s.active.y+=dy/d*step;direction=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}if(d<=step){route.index++;if(route.index===route.points.length){this.cancelTravel();if(route.station)this.use(route.station);}}}
    if(!this.active)return;
    const distance=Math.hypot(s.active.x-before[0],s.active.y-before[1]);s.walkDistance+=distance;s.setStride(s.active,direction,distance>.02&&canWalk);
    s.active.setDepth(s.active.y);this.camera(false);if(distance>.02&&Math.floor(s.walkDistance/24)!==s.lastFoot){s.lastFoot=Math.floor(s.walkDistance/24);KingdomSound.step();}
    const nearby=this.nearby();s.controls.nearby(nearby);const location=document.getElementById('location');if(location.textContent!==this.room.name)location.textContent=this.room.name;
    this.hints.forEach(({station,hint})=>hint.setVisible(!this.brewing&&!this.seated&&nearby?.id==='room-'+station.id&&station.kind!=='exit'));
    if(canWalk&&input.y>0&&Math.abs(s.active.x)<33&&s.active.y>132){this.exit();return;}
    if(!this.lastLight||time-this.lastLight>85){this.lastLight=time;this.light(time);}
  }
};
