/* Connected Stop 02 world. Chapter behaviour is supplied by chapter-story.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const STORY_MOTION_SCALE=.68;
  const CAMERA_FOLLOW=.065;
  let reduced = preference.matches;
  let scene;
  const routes = [
    {label:'Come to my side', detail:'A little closer to home', title:'Your side of the kingdom.', line:'You made the trip last time. This time, I’ll come to your side around Waiuku. We’ll find somewhere for food and those overdue iced drinks.', point:[816,836]},
    {label:'Meet in the middle', detail:'A little journey each', title:'Somewhere in the middle.', line:'A little drive each, then a proper catch-up over food. The next part will help us choose how far feels comfortable.', point:[960,744]},
    {label:'Pick me up', detail:'For a scenic little drive', title:'One little road trip.', line:'I’ll come to you. We can take the scenic way, with food and an iced drink on the itinerary this time.', point:[960,744]},
    {label:'I’ll come your way', detail:'Only if you feel like it', title:'A return to my side.', line:'If you’re up for the drive, I’d love that. We’ll make room for the bits we missed: actual food, iced drinks, and time together.', point:[816,836]}
  ];
  function copy(speaker,title,line,progress) {
    $('speaker').textContent=speaker; $('line-title').textContent=title; $('line').textContent=line;
    $('progress').textContent=progress; $('actions').replaceChildren(); $('actions').className='';
  }
  function action(label,fn,kind='primary',detail) {
    const button=document.createElement('button'); button.className=kind;
    const text=document.createElement('span');text.textContent=label;button.append(text);
    if(detail){const small=document.createElement('small');small.textContent=detail;button.append(small);}
    button.addEventListener('click',fn);$('actions').append(button);return button;
  }
  function focusAction(){requestAnimationFrame(()=>$('actions').querySelector('button')?.focus({preventScroll:true}));}
  function fail(){ $('loading').hidden=false; $('loading').replaceChildren(); const p=document.createElement('span');p.textContent='The garden didn’t finish opening.';$('loading').append(p);const b=document.createElement('button');b.className='primary';b.textContent='Try again';b.onclick=()=>location.reload();$('loading').append(b); }
  function updateMotion(){ $('motion').setAttribute('aria-pressed',String(reduced));$('motion').setAttribute('aria-label',reduced?'Enable full animation':'Reduce animation');if(scene){scene.tweens.timeScale=reduced?0:1;if(reduced&&scene.travel)scene.finishTravel();if(reduced&&scene.castMotion)scene.finishCast();document.documentElement.dataset.motion=reduced?'reduced':'full';} }
  $('motion').onclick=()=>{reduced=!reduced;updateMotion();};
  preference.addEventListener('change',e=>{reduced=e.matches;updateMotion();});updateMotion();
  $('credits-open').onclick=()=>{$('credits').showModal();if(scene)scene.scene.pause();};
  $('credits-close').onclick=()=>$('credits').close();
  $('credits').addEventListener('close',()=>{if(scene)scene.scene.resume();});
  if(!window.Phaser){fail();return;}
  const TILE=32,W=1280,H=1344;
  const START={x:350,y:410};
  const WALK=[[400,398],[464,398],[464,475],[496,512],[544,552],[624,552],[704,552],[756,612],[816,682],[816,744]];
  class Journey extends Phaser.Scene {
    constructor(){super('journey');this.travel=null;this.phase='loading';this.walkClock=0;this.eventSerial=0;}
    preload(){
      const scenery=['terrain','trees','plants','flowers','wildflowers','rocks','bridge','bridge-floor','castle','walls','roof','doors','doorframe','fence','signs','floor','baskets','barrels','crates','ladder','lumber','table','flowerpots','lamps'];
      scenery.forEach(k=>this.load.image(k,'game-art/lpc/'+k+'.png'));
      this.load.json('chapter-config',document.documentElement.dataset.chapterConfig||'chapter-plan.json');
      this.preloadChapter?.();
      this.load.image('throne','art-throne-gilded.png');
      this.layers={her:['her-body','her-shoes','her-skirt','her-dress','her-hair'],him:['him-body','him-legs','him-shoes','him-chest','him-arms','him-beard','him-hair']};
      Object.values(this.layers).flat().forEach(k=>this.load.spritesheet(k,'game-art/characters/'+k+'.png',{frameWidth:64,frameHeight:64}));
      this.load.on('progress',n=>$('load-progress').textContent=Math.round(n*100)+'%');
      this.load.on('loaderror',()=>{this.loadFailed=true;});
    }
    create(){
      if(this.loadFailed){fail();return;}
      try{
      scene=this;
      this.makeFrames();this.makeGround();this.makeKingdom();this.makeVillage();this.makeForest();this.makeAtmosphere();
      this.makeChapterWorld?.();this.makeCinema?.();
      this.hero=this.person('her',START.x,START.y);this.knight=this.person('him',START.x+38,START.y+14);
      this.pigeon=this.makeBird(412,445);this.pigeon.setDepth(448);
      this.basket=this.prop('baskets','basket',411,428);
      this.basketGlow=this.add.ellipse(411,426,34,15,0xffdf82,.25).setDepth(2);
      this.tweens.add({targets:this.basketGlow,alpha:.07,scale:1.2,duration:900,yoyo:true,repeat:-1});
      this.carry=this.prop('baskets','basket',0,0).setScale(.7).setVisible(false);
      this.cameraPoint={x:390,y:360};
      this.cameras.main.setBounds(-1024,-1024,W+2048,H+2048).setRoundPixels(true).startFollow(this.cameraPoint,true,CAMERA_FOLLOW,CAMERA_FOLLOW);
      this.resize();this.scale.on('resize',()=>this.resize());
      this.cameras.main.fadeIn(reduced?0:650,31,50,35);
      this.start();updateMotion();$('loading').hidden=true;
      }catch(error){console.error('Kingdom scene could not start:',error);this.scene.pause();fail();}
    }
    frame(texture,name,x,y,w=32,h=32){this.textures.get(texture).add(name,0,x,y,w,h);}
    makeFrames(){
      this.frame('terrain','grass',96,32);this.frame('terrain','dirt',96,128);this.frame('terrain','water',32,352);
      this.frame('trees','oak',128,256,96,128);this.frame('trees','oak2',224,256,96,128);this.frame('trees','pine',128,384,96,128);this.frame('trees','small',0,480,64,96);
      this.frame('castle','brick',224,192,96,64);this.frame('castle','top',224,160,96,32);this.frame('castle','tower',320,160,96,96);this.frame('castle','arch',128,160,96,64);this.frame('castle','banner',416,224,32,64);this.frame('castle','bars',0,64,32,32);
      this.frame('bridge-floor','deck',128,0,96,48);this.frame('bridge','rear',224,0,96,48);this.frame('bridge','front',224,48,96,48);
      this.frame('baskets','basket',0,32);this.frame('plants','bush',0,0);this.frame('plants','fern',64,0);this.frame('flowers','flowers',0,0);this.frame('wildflowers','white',0,0,32,32);
      this.frame('rocks','rock',0,0,64,64);this.frame('fence','horizontal',32,0,64,32);this.frame('signs','sign',0,0,32,32);
      this.frame('barrels','barrel',0,0,32,48);this.frame('crates','crate',0,0);this.frame('ladder','ladder',0,0,32,64);this.frame('lumber','planks',0,0,64,32);this.frame('table','table',0,0,64,64);this.frame('flowerpots','pot',0,0);this.frame('lamps','lamp',0,0,32,64);this.frame('walls','warm',32,32);this.frame('floor','paving',32,32);
      Object.values(this.layers).flat().forEach(key=>{
        ['up','left','down','right'].forEach((dir,i)=>this.anims.create({key:key+'-'+dir,frames:this.anims.generateFrameNumbers(key,{start:(8+i)*13+1,end:(8+i)*13+8}),frameRate:9,repeat:-1}));
      });
    }
    makeGround(){
      this.frame('terrain','kingdom-grass',96,32);
      // Reuse one small grass texture: a 7000px TileSprite allocates a
      // 49-million-pixel canvas, beyond the canvas budget on iPhones.
      const grass=this.textures.createCanvas('grass-block',512,512),gc=grass.context;
      const grassSource=this.textures.get('terrain').getSourceImage();
      for(let y=0;y<512;y+=32)for(let x=0;x<512;x+=32)gc.drawImage(grassSource,96,32,32,32,x,y,32,32);
      grass.refresh();
      for(let y=-3000;y<4000;y+=512)for(let x=-3000;x<4000;x+=512)this.add.image(x,y,'grass-block').setOrigin(0).setDepth(-1);
      const tx=this.textures.createCanvas('world-ground',W+512,H+320),c=tx.context,terrain=this.textures.get('terrain').getSourceImage();
      c.translate(512,320);
      for(let y=-320;y<H;y+=32)for(let x=-512;x<W;x+=32)c.drawImage(terrain,96,32,32,32,x,y,32,32);
      const dirt=document.createElement('canvas');dirt.width=dirt.height=32;dirt.getContext('2d').drawImage(terrain,96,128,32,32,0,0,32,32);
      const path=(points,width)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.strokeStyle='#71813c';c.stroke();c.lineWidth=width-8;c.strokeStyle=c.createPattern(dirt,'repeat');c.stroke();};
      path([[350,360],[350,410],...WALK,[816,980]],64);path([[816,744],[1056,744],[1160,824]],64);
      this.paintChapterGround?.(c,path,terrain);
      // Grass-edged water tiles form a continuous river through the whole map.
      for(let y=-320;y<H;y+=32){c.drawImage(terrain,0,352,32,32,576,y,32,32);c.drawImage(terrain,32,352,32,32,608,y,32,32);c.drawImage(terrain,64,352,32,32,640,y,32,32);}
      const paving=this.textures.get('floor').getSourceImage();
      for(let y=320;y<432;y+=32)for(let x=256;x<416;x+=32)c.drawImage(paving,32,32,32,32,x,y,32,32);
      // Small worn paving stones soften the courtyard into the woodland path.
      c.fillStyle='#c1bc86';[[420,435],[395,443],[440,454],[490,495],[721,575],[743,602]].forEach(([x,y])=>c.fillRect(x,y,12,6));
      tx.refresh();this.add.image(-512,-320,'world-ground').setOrigin(0).setDepth(0);
      this.add.image(624,528,'bridge-floor','deck').setOrigin(.5,0).setDepth(1);
      this.add.image(624,496,'bridge','rear').setOrigin(.5,0).setDepth(515);
      this.add.image(624,520,'bridge','front').setOrigin(.5,0).setDepth(574);
    }
    prop(texture,frame,x,y){return this.add.image(x,y,texture,frame).setOrigin(.5,1).setDepth(y);}
    makeKingdom(){
      for(let x=256;x<=448;x+=96){this.prop('castle','brick',x,320);this.prop('castle','top',x,256);}
      this.prop('castle','tower',208,334);this.prop('castle','tower',496,334);
      this.prop('castle','banner',242,330);this.prop('castle','banner',444,330);
      this.add.image(331,374,'throne').setOrigin(.5,1).setDisplaySize(49,65).setDepth(374);
      this.prop('castle','brick',208,400);this.prop('castle','top',208,336);
      this.prop('castle','arch',464,459);
      this.gate=this.prop('castle','bars',464,454).setDisplaySize(38,38).setDepth(460);
      this.prop('ladder','ladder',493,389);this.prop('lumber','planks',432,360);this.prop('crates','crate',470,364);
      this.prop('lumber','planks',254,457);this.prop('crates','crate',279,439);
      this.prop('plants','bush',246,393);this.prop('flowers','flowers',294,372);
      this.prop('lamps','lamp',407,461);
      this.add.ellipse(407,451,43,24,0xffe7a0,.12).setDepth(3);
    }
    makeVillage(){
      // A small inn assembled from LPC masonry and textured shingles.
      const tx=this.textures.createCanvas('inn',208,210),c=tx.context;
      const wall=this.textures.get('walls').getSourceImage(),roof=this.textures.get('roof').getSourceImage();
      c.fillStyle='#2a3c2840';c.fillRect(12,186,190,17);
      for(let y=100;y<192;y+=32)for(let x=24;x<184;x+=32)c.drawImage(wall,32,32,32,32,x,y,32,32);
      c.fillStyle='#423b2c';c.fillRect(91,135,34,59);c.fillStyle='#9c7545';c.fillRect(94,138,28,56);c.fillStyle='#d0b376';c.fillRect(115,164,3,4);
      [40,143].forEach(x=>{c.fillStyle='#454b33';c.fillRect(x,136,27,31);c.fillStyle='#d8c78b';c.fillRect(x+3,139,21,24);c.fillStyle='#796d41';c.fillRect(x+12,139,3,24);c.fillRect(x+3,149,21,3);});
      const shingle=document.createElement('canvas');shingle.width=shingle.height=24;shingle.getContext('2d').drawImage(roof,424,72,24,24,0,0,24,24);
      c.save();c.beginPath();c.moveTo(12,126);c.lineTo(39,46);c.lineTo(163,46);c.lineTo(196,126);c.closePath();c.fillStyle=c.createPattern(shingle,'repeat');c.fill();c.lineWidth=5;c.strokeStyle='#514529';c.stroke();c.restore();
      c.fillStyle='#d2b26d';c.fillRect(81,48,40,5);c.fillStyle='#403c2b';c.fillRect(131,22,20,40);c.fillStyle='#908365';c.fillRect(128,21,26,8);
      c.fillStyle='#eee1b0';c.fillRect(30,118,150,17);c.fillStyle='#5a784b';for(let x=30;x<180;x+=24)c.fillRect(x,118,12,17);c.fillStyle='#5c4b32';c.fillRect(29,136,3,56);c.fillRect(178,136,3,56);
      tx.refresh();this.inn=this.add.image(940,700,'inn').setOrigin(.5,1).setDepth(699);
      this.prop('barrels','barrel',1036,695);this.prop('flowerpots','pot',859,699);this.prop('table','table',909,733);
      this.add.text(940,629,'THE LITTLE INN',{fontFamily:'Pixelify Sans',fontSize:'9px',color:'#ede4b9',backgroundColor:'#4b5133',padding:{x:5,y:3}}).setOrigin(.5).setDepth(701);
      this.signpost(778,743,'HOME',false);this.signpost(862,814,'THE LONG WAY',true);
      [[716,676],[746,676],[1072,708],[1104,708],[736,844],[768,844],[864,884],[896,884]].forEach(([x,y])=>this.prop('fence','horizontal',x,y));
      this.prop('flowerpots','pot',848,755);this.prop('flowers','flowers',861,861);
      this.routeMarker=this.add.graphics().setDepth(5).setVisible(false);
    }
    signpost(x,y,label,right){
      const g=this.add.graphics().setDepth(y);
      g.fillStyle(0x51462d).fillRect(x-2,y-35,5,35);
      g.fillStyle(0x7f693e).fillRect(x-1,y-34,2,32);
      const w=label.length>5?70:42,left=x-w/2;
      g.fillStyle(0x443f2a).fillRect(left-1,y-47,w+2,19);
      g.fillStyle(0xb4995a).fillRect(left,y-46,w,16);
      g.fillStyle(0xd0b877).fillRect(left+1,y-45,w-2,2);
      g.fillStyle(0xb4995a).fillTriangle(right?left+w:left,y-46,right?left+w+8:left-8,y-38,right?left+w:left,y-30);
      this.add.text(x,y-43,label,{fontFamily:'Pixelify Sans',fontSize:'8px',color:'#343e29'}).setOrigin(.5,0).setDepth(y+1);
    }
    makeForest(){
      const rand=Phaser.Math.RND;rand.sow(['a-little-further-02']);
      const trees=[[155,220],[240,195],[337,190],[426,179],[532,215],[112,319],[132,420],[185,513],[238,565],[330,583],[392,608],[468,634],[506,724],[525,838],[464,934],[381,897],[288,795],[193,705],[110,624],[681,254],[708,365],[744,444],[806,400],[886,455],[980,450],[1092,508],[1138,599],[1170,711],[1112,861],[1054,923],[949,982],[745,986],[714,901],[711,800],[713,1135],[492,1112],[514,1250],[907,1223],[1065,1150]];
      trees.filter(([x,y])=>!(y>870&&y<1110&&x>320&&x<970)).forEach(([x,y],i)=>{this.add.ellipse(x,y-5,70,25,0x294b27,.18).setDepth(1);this.prop('trees',i%5===0?'pine':i%2?'oak':'oak2',x,y).setFlipX(i%3===0);});
      const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Phaser.Math.Clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
      const paths=[[[350,350],[350,410]],[[350,410],WALK[0]],...WALK.slice(1).map((p,i)=>[WALK[i],p]),[[816,744],[816,980]],[[816,744],[1160,744]]];
      for(let i=0;i<310;i++){
        const x=rand.between(64,W-64),y=rand.between(150,H-64);
        if(Math.pow((x-55)/125,2)+Math.pow((y-660)/105,2)<1||x>557&&x<690||x>175&&x<550&&y<490||x>830&&x<1055&&y>480&&y<755||y>860&&y<1120&&x>300&&x<1030||paths.some(([a,b])=>distance([x,y],a,b)<48))continue;
        const kind=i%7===0?'flowers':i%9===0?'wildflowers':'plants';this.prop(kind,kind==='plants'?(i%3?'bush':'fern'):kind==='flowers'?'flowers':'white',x,y).setAlpha(.9);
      }
      [[556,448],[686,419],[552,624],[689,668],[552,837],[688,903]].forEach(([x,y])=>this.prop('plants','fern',x,y));
    }
    makeAtmosphere(){
      this.ripples=[];
      for(let i=0;i<27;i++){const ripple=this.add.rectangle(592+(i%3)*19,65+i*47,8+(i%2)*4,1,0xb4e2ce,.24).setDepth(2);this.ripples.push(ripple);this.tweens.add({targets:ripple,y:ripple.y+18,alpha:.05,duration:1900+(i%4)*400,yoyo:true,repeat:-1});}
      this.motes=[];for(let i=0;i<22;i++){const mote=this.add.rectangle(240+(i*89)%850,240+(i*131)%880,2,2,0xffefba,.5).setDepth(2000);this.motes.push(mote);this.tweens.add({targets:mote,x:mote.x+18,y:mote.y-24,alpha:.1,duration:3400+i*91,yoyo:true,repeat:-1});}
    }
    person(who,x,y){
      const p=this.add.container(x,y);p.shadow=this.add.ellipse(0,-3,25,9,0x1b3028,.24);p.add(p.shadow);
      p.parts=this.layers[who].map(key=>{const s=this.add.sprite(0,0,key,10*13).setOrigin(.5,1);if(key==='her-skirt')s.setTint(0x99a977);p.add(s);return s;});p.direction='down';p.walking=false;p.setDepth(y);return p;
    }
    pose(p,dir,moving){if(p.direction===dir&&p.walking===moving)return;p.direction=dir;p.walking=moving;p.parts.forEach(s=>{if(moving&&!reduced)s.play(s.texture.key+'-'+dir,true);else{s.stop();s.setFrame((8+['up','left','down','right'].indexOf(dir))*13);}});}
    makeBird(x,y){
      const g=this.make.graphics({x:0,y:0,add:false});g.fillStyle(0x263b37);g.fillRect(6,10,13,7);g.fillStyle(0x899e9a);g.fillRect(5,7,13,8);g.fillStyle(0xc6cfbe);g.fillRect(14,3,7,9);g.fillStyle(0x46645c);g.fillRect(12,10,6,4);g.fillStyle(0x24382d);g.fillRect(18,5,2,2);g.fillStyle(0xd5a35c);g.fillRect(21,8,4,2);g.fillRect(9,16,2,3);g.fillRect(15,16,2,3);g.fillStyle(0xece0af);g.fillRect(18,11,9,6);g.lineStyle(1,0x9a8552);g.lineBetween(18,11,22,14);g.lineBetween(22,14,27,11);g.generateTexture('pigeon',30,22);g.destroy();
      return this.add.image(x,y,'pigeon').setOrigin(.5,1);
    }
    resize(){const width=this.scale.width;this.cameras.main.setZoom(width>=850?1.65:width>=600?1.3:1);}
    frameParty(snap=false){
      const cam=this.cameras.main;
      const panelTop=document.querySelector('.dialogue').offsetTop;
      const safeY=Math.min(this.scale.height*.48,(105+panelTop)/2);
      this.cameraPoint.x=this.hero.x+10;
      this.cameraPoint.y=this.hero.y+(this.scale.height/2-safeY)/cam.zoom;
      if(snap)cam.centerOn(this.cameraPoint.x,this.cameraPoint.y);
    }
    start(){
      this.phase='start';this.travel=null;this.eventSerial++;this.hero.setPosition(START.x,START.y);this.knight.setPosition(START.x+38,START.y+14);this.pose(this.hero,'down',false);this.pose(this.knight,'left',false);this.pigeon.setPosition(412,445);this.cameraPoint.x=390;this.cameraPoint.y=360;this.cameras.main.centerOn(390,360);
      this.gate.setPosition(464,454).setAlpha(1);this.basket.setVisible(true);this.basketGlow.setVisible(true);this.carry.setVisible(false);this.routeMarker.setVisible(false);$('inventory').hidden=true;$('landmark').className='landmark';$('landmark').innerHTML='<span>WHERE WE LEFT OFF</span><strong>A throne. A beginning.</strong>';$('location').textContent='The unfinished kingdom';$('hint').textContent='PLAYABLE PREVIEW · THE FIRST FEW STEPS';
      $('world').setAttribute('aria-label','An unfinished stone castle in a forest. A princess and her knight stand beside her golden throne. A basket waits by the gate.');
      copy('YOUR KNIGHT · STILL IN TRAINING','Your throne’s still here.','The kingdom’s a work in progress. So is my plan to actually get us food this time.','I / III');
      action('Pick up the picnic basket',()=>this.collect());
    }
    collect(){
      if(this.phase!=='start')return;this.phase='collecting';$('landmark').classList.add('away');
      copy('ONE SMALL PIECE OF UNFINISHED BUSINESS','Food. This time, actual food.','And those iced drinks we never got. I remembered.','I / III');
      this.move([[395,429]],()=>{this.phase='basket';this.basket.setVisible(false);this.basketGlow.setVisible(false);this.carry.setVisible(true);$('inventory').hidden=false;copy('THE PIGEON HAS A NEW ASSIGNMENT','Shall we go a little further?','Same princess. Slightly more prepared knight. A whole new bit of the map.','I / III');action('Follow the pigeon',()=>this.depart());focusAction();},70);
      if(this.travel)action('Skip the little walk',()=>this.finishTravel(),'secondary');
    }
    depart(){
      if(this.phase!=='basket')return;this.phase='travelling';
      copy('NEXT STOP · SOMEWHERE TOGETHER','The rest of the map awaits.','Follow the path. I’ll carry the basket.','II / III');
      this.move(WALK,()=>this.crossroads(),90);if(this.travel)action('Skip to the crossroads',()=>this.finishTravel(),'secondary');
    }
    move(points,done,speed=85){
      this.travel={points:points.map(([x,y])=>({x,y})),index:0,done,speed:speed*STORY_MOTION_SCALE};
      if(reduced)this.finishTravel();
    }
    finishTravel(){
      if(!this.travel)return;const t=this.travel,last=t.points.at(-1);this.travel=null;this.hero.setPosition(last.x,last.y);this.knight.setPosition(last.x+30,last.y+15);this.pigeon.setPosition(last.x+38,last.y-31);this.pose(this.hero,'down',false);this.pose(this.knight,'down',false);if(last.y>490)this.gate.setAlpha(0);t.done();this.frameParty(true);
    }
    crossroads(){
      this.phase='crossroads';this.pose(this.hero,'right',false);this.pose(this.knight,'left',false);$('location').textContent='The little crossroads';$('inventory').hidden=true;$('hint').textContent='PLAYABLE PREVIEW · THE FIRST FEW STEPS';
      $('world').setAttribute('aria-label','The pair have crossed the river and reached a sunny village crossroads. A little inn waits beside a path branching towards home and a longer drive.');
      copy('YOUR KNIGHT · WITH A BETTER PLAN','Let me come your way.','You came my way last time. Where would you like our next little adventure to start?','III / III');
      $('actions').className='routes';routes.forEach((route,i)=>action(route.label,()=>this.choose(i),'choice',route.detail));this.frameParty(reduced);focusAction();
    }
    choose(index){
      if(this.phase!=='crossroads')return;this.phase='choosing';const route=routes[index];copy('A NEW PATH OPENS',route.title,route.line,'III / III');
      this.routeMarker.clear().setVisible(true).lineStyle(3,0xf9e5a0,.6).beginPath().moveTo(816,744).lineTo(...route.point).strokePath();
      this.move([route.point],()=>{this.phase='complete';copy('TO BE CONTINUED · STOP 02',route.title,route.line,'III / III');$('hint').textContent='NEXT: FOOD, ICED DRINKS & A NEW CASTLE ADDITION';action('Try another path',()=>{this.hero.setPosition(816,744);this.knight.setPosition(846,759);this.pigeon.setPosition(854,713);this.cameraPoint.x=826;this.cameraPoint.y=659;this.routeMarker.setVisible(false);this.crossroads();});action('Replay from the throne',()=>{this.start();focusAction();},'secondary');focusAction();},100);
      if(this.travel)action('Skip ahead',()=>this.finishTravel(),'secondary');
    }
    update(time,delta){
      if(!this.hero)return;const dt=Math.min(delta,50)/1000;
      if(this.travel){
        const t=this.travel,target=t.points[t.index],dx=target.x-this.hero.x,dy=target.y-this.hero.y,d=Math.hypot(dx,dy),step=t.speed*dt;
        if(d<=step){this.hero.setPosition(target.x,target.y);t.index++;if(t.index===t.points.length){this.travel=null;this.pose(this.hero,this.hero.direction,false);this.pose(this.knight,this.knight.direction,false);t.done();}}
        else{this.hero.x+=dx/d*step;this.hero.y+=dy/d*step;this.pose(this.hero,Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up',true);}
        const inGate=this.hero.x>423&&this.hero.x<510&&this.hero.y<522;
        const hx=this.hero.x+(inGate?0:28),hy=this.hero.y+(inGate?(dy<0?27:-27):16),kx=hx-this.knight.x,ky=hy-this.knight.y,kd=Math.hypot(kx,ky);
        if(kd>3){const ks=Math.min(kd,t.speed*dt*1.08);this.knight.x+=kx/kd*ks;this.knight.y+=ky/kd*ks;this.pose(this.knight,Math.abs(kx)>Math.abs(ky)?kx>0?'right':'left':ky>0?'down':'up',true);}
        this.pigeon.x=Phaser.Math.Linear(this.pigeon.x,this.hero.x+35,.035);this.pigeon.y=Phaser.Math.Linear(this.pigeon.y,this.hero.y-29,.035);this.pigeon.setFlipX(dx<0);this.pigeon.setAngle(Math.sin(time/100)*4);
        this.frameParty();
        if(this.hero.x>440&&this.hero.y>395&&this.gate.alpha===1){this.gate.alpha=.99;if(reduced)this.gate.setAlpha(0);else this.tweens.add({targets:this.gate,y:422,alpha:0,duration:450});}
        if(this.phase==='travelling'){
          if(this.hero.x>704&&$('location').textContent!=='A village around the bend')$('location').textContent='A village around the bend';
          else if(this.hero.x>585&&this.hero.x<=704&&$('location').textContent!=='Over the little river'){$('location').textContent='Over the little river';$('line-title').textContent='A little further than last time.';$('line').textContent='Same company. New scenery. The pigeon appears to know the way.';}
          else if(this.hero.x<=585&&$('location').textContent!=='Beyond the castle gate')$('location').textContent='Beyond the castle gate';
        }
      }else {this.pigeon.setAngle(0);if(this.knight.walking&&!this.castMotion)this.pose(this.knight,this.knight.direction,false);if(!['start','pets','memory','map','completed'].includes(this.phase))this.frameParty();}
      this.hero.setDepth(this.hero.y);this.knight.setDepth(this.knight.y);this.pigeon.setDepth(this.pigeon.y);
      this.carry.setPosition(this.knight.x+16,this.knight.y-5).setDepth(this.knight.y+1);
      this.updateChapter?.(time,dt,reduced);this.updateCinema?.(time,dt,reduced);
    }
  }
  window.extendChapterWorld?.(Journey);
  window.extendChapterCinema?.(Journey);
  window.extendChapterStory?.(Journey,{$,copy,action,focusAction,routes,START,WALK,reduced:()=>reduced,cameraFollow:CAMERA_FOLLOW});
  new Phaser.Game({type:Phaser.AUTO,parent:'world',backgroundColor:'#60912f',pixelArt:true,roundPixels:true,antialias:false,scale:{mode:Phaser.Scale.RESIZE,width:document.querySelector('.adventure').clientWidth,height:document.querySelector('.adventure').clientHeight},scene:Journey,audio:{noAudio:true},render:{powerPreference:'low-power'},banner:false});
})();
