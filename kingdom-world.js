/* An explorable extension of the existing LPC kingdom, sharing its art and renderer. */
window.extendLivingKingdom=function(Journey,{reduced}){
  const P=KingdomPaths,$=id=>document.getElementById(id),baseVillage=Journey.prototype.makeVillage,baseGround=Journey.prototype.makeGround;
  const nearest=(x,y)=>Object.keys(P.nodes).reduce((a,b)=>Math.hypot(x-P.nodes[a][0],y-P.nodes[a][1])<Math.hypot(x-P.nodes[b][0],y-P.nodes[b][1])?a:b);
  Object.assign(Journey.prototype,{
    makeGround(){baseGround.call(this);this.children.list.forEach(o=>{if(o.texture?.key==='grass-block')o.setDepth(-5000);if(o.texture?.key==='world-ground')o.setDepth(-4999);});},
    paintChapterGround(c,path,terrain){
      P.edges.forEach(([a,b])=>path([P.nodes[a],P.nodes[b]],a.includes('north')||b.includes('north')?43:50));
      c.fillStyle='#6d8e4b';c.beginPath();c.ellipse(55,674,113,82,0,0,Math.PI*2);c.fill();
      c.fillStyle='#b8b282';c.beginPath();c.ellipse(55,674,100,70,0,0,Math.PI*2);c.fill();
      const tile=document.createElement('canvas');tile.width=tile.height=32;tile.getContext('2d').drawImage(terrain,32,352,32,32,0,0,32,32);c.fillStyle=c.createPattern(tile,'repeat');c.beginPath();c.ellipse(55,671,91,62,0,0,Math.PI*2);c.fill();
      [[350,-70,180,80],[180,1080,200,95],[-165,771,115,73],[1040,810,150,105]].forEach(([x,y,w,h])=>{c.fillStyle='#a6ad71';c.fillRect(x-w/2,y-h/2,w,h);c.fillStyle='#c4bb87';c.fillRect(x-w/2+7,y-h/2+7,w-14,h-14);});
      c.fillStyle='#a7b777';for(let i=0;i<80;i++){const x=-230+(i*59)%470,y=945+(i*31)%210;if(Math.hypot(x-180,y-1120)>100)c.fillRect(x,y,3,3);}
    },
    makeVillage(){baseVillage.call(this);},
    signpost(x,y,label,right){
      const word=label==='HOME'?'CASTLE':label==='THE LONG WAY'?'SOUTH':label;
      const g=this.add.graphics().setDepth(y);g.fillStyle(0x574b32).fillRect(x-2,y-33,5,34);const w=Math.max(54,word.length*6+12);g.fillStyle(0x584c31).fillRect(x-w/2-1,y-46,w+2,19);g.fillStyle(0xbca570).fillRect(x-w/2,y-45,w,16);g.fillStyle(0xd8c089).fillRect(x-w/2+1,y-44,w-2,2);
      this.add.text(x,y-42,word,{fontFamily:'Pixelify Sans',fontSize:'9px',color:'#36452e'}).setOrigin(.5,0).setDepth(y+1);
    },
    makeForest(){
      const rng=new Phaser.Math.RandomDataGenerator(['our-three-chapters']);
      const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Phaser.Math.Clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
      const clear=(x,y)=>P.edges.some(([a,b])=>distance(x,y,P.nodes[a],P.nodes[b])<65)||(x>165&&x<550&&y>110&&y<510)||(x>190&&x<505&&y<110)||(x>50&&x<310&&y>870)||(x>820&&x<1090&&y>460&&y<850)||(x<185&&x>-290&&y>580&&y<870)||(x>554&&x<695);
      for(let i=0;i<240;i++){const x=rng.between(-400,1250),y=rng.between(-240,1340);if(clear(x,y))continue;this.add.ellipse(x,y-3,52,19,0x294d30,.12).setDepth(-4000);this.prop('trees',i%6===0?'pine':i%3?'oak':'oak2',x,y).setFlipX(i%2===0);}
      for(let i=0;i<200;i++){const x=rng.between(-350,1220),y=rng.between(-220,1320);if(clear(x,y))continue;this.prop(i%5?'plants':'wildflowers',i%5?(i%3?'bush':'fern'):'white',x,y);}
    },
    cottage(key,x,y,north){
      const tex=this.textures.createCanvas(key,192,196),c=tex.context;c.imageSmoothingEnabled=false;
      const wall=this.textures.get('walls').getSourceImage();c.fillStyle='#29472b38';c.fillRect(13,167,177,21);
      c.save();c.beginPath();c.rect(25,95,142,79);c.clip();for(let yy=82;yy<170;yy+=32)for(let xx=26;xx<166;xx+=32)c.drawImage(wall,32,32,32,32,xx,yy,32,32);c.restore();
      c.fillStyle=north?'#a29d7c':'#d0bc88';c.fillRect(25,105,142,66);c.fillStyle='#68745219';for(let i=0;i<95;i++)c.fillRect(28+(i*23)%132,109+(i*17)%59,2,1);c.fillStyle='#514936';[26,91,162].forEach(xx=>c.fillRect(xx,94,5,81));[108,145,170].forEach(yy=>c.fillRect(26,yy,140,4));
      c.fillStyle='#3a4737';c.fillRect(78,126,32,49);c.fillStyle='#866b46';c.fillRect(82,129,24,45);c.fillStyle='#b89d62';for(let xx=83;xx<106;xx+=6)c.fillRect(xx,129,1,44);c.fillStyle='#e6cd85';c.fillRect(101,149,3,3);
      [43,127].forEach(xx=>{c.fillStyle='#4c533a';c.fillRect(xx,118,26,26);c.fillStyle='#e6c378';c.fillRect(xx+3,121,20,20);c.fillStyle='#716044';c.fillRect(xx+12,121,2,20);c.fillRect(xx+3,130,20,2);});
      // Match the inn's hipped roof and shingle scale; retain each home's trim colour.
      const tile=document.createElement('canvas');tile.width=tile.height=24;tile.getContext('2d').drawImage(this.textures.get('roof').getSourceImage(),424,72,24,24,0,0,24,24);
      c.save();c.beginPath();c.moveTo(10,106);c.lineTo(37,37);c.lineTo(154,37);c.lineTo(182,106);c.closePath();c.fillStyle=c.createPattern(tile,'repeat');c.fill();c.fillStyle=north?'#48675240':'#b48b4926';c.fill();c.strokeStyle='#4d4935';c.lineWidth=4;c.stroke();c.restore();c.fillStyle='#beaa70';c.fillRect(37,35,117,3);
      c.fillStyle='#4c5036';c.fillRect(9,103,175,7);c.fillStyle='#c4b27c';c.fillRect(12,103,169,2);c.fillStyle='#66664c';c.fillRect(143,40,18,46);c.fillStyle='#909174';c.fillRect(140,37,24,7);c.fillStyle='#53553f';c.fillRect(81,176,31,7);c.fillStyle='#b7b08b';c.fillRect(76,180,41,5);
      if(!north){c.fillStyle='#6a8450';c.fillRect(40,145,35,8);c.fillRect(120,145,38,8);c.fillStyle='#d5c4a4';[[44,142],[56,139],[68,143],[126,143],[139,140],[149,143]].forEach(([xx,yy])=>c.fillRect(xx,yy,5,5));}
      tex.refresh();this.add.image(x,y,key).setOrigin(.5,1).setDepth(y);this.signpost(x+95,y+29,north?'NORTH':'SOUTH',true);
      const box=this.add.graphics().setDepth(y+22);box.fillStyle(0x5b4d32).fillRect(x-79,y-10,4,29);box.fillStyle(north?0x627761:0xa17858).fillRect(x-89,y-23,23,15);box.fillStyle(0xe7d2a1).fillRect(x-85,y-20,14,8);box.lineStyle(1,0x957f52).lineBetween(x-85,y-20,x-78,y-15).lineBetween(x-78,y-15,x-71,y-20);
      for(const xx of [-125,130]){this.prop('flowerpots','pot',x+xx,y+8);this.prop('wildflowers','white',x+xx,y+9);}
      this.homeDetails??={};const home=north?'north':'south';
      const flag=this.add.graphics().setDepth(y+30);flag.fillStyle(0x8d564a).fillRect(x-70,y-35,3,18).fillRect(x-67,y-35,10,7);flag.setVisible(false);
      const flowers=this.prop('flowers','flowers',x-42,y+24).setVisible(false),lantern=this.add.circle(x,y-40,24,0xffdf9c,.055).setDepth(y+1);
      this.homeDetails[home]={flag,flowers,lantern};
      this.add.zone(x-78,y-10,36,48).setInteractive({useHandCursor:true}).on('pointerdown',()=>{if(!$('book').open)KingdomUI.open('post');});
      this.add.zone(x,y-55,200,170).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit(north?'north':'south'));
      this.smokePuffs??=[];for(let i=0;i<3;i++)this.smokePuffs.push({shape:this.add.rectangle(x+57,y-163-i*13,9+i*3,9+i*3,0xe8e5c6,.18).setDepth(y+1),x:x+57,y:y-163-i*13,i});
    },
    makeChapterWorld(){
      this.cottage('north-cottage',350,-85,true);this.cottage('south-cottage',180,1070,false);
      this.add.image(624,1024,'bridge-floor','deck').setOrigin(.5,0).setDepth(1);this.add.image(624,992,'bridge','rear').setOrigin(.5,0).setDepth(1011);this.add.image(624,1016,'bridge','front').setOrigin(.5,0).setDepth(1070);
      this.residents=[];this.buildPets();
      this.ducks=this.ducks.filter(d=>{if(d.petName==='Pearl'){d.destroy();return false;}d.kind=d.petName.startsWith('Duckling')?'duckling':'duck';return true;});
      this.ducks.forEach(d=>{d.description=d.petName==='Dil'?'Dil, keeping a watchful eye on the little ones.':d.kind==='duckling'?'One of the original eight little ducklings.':'At home on the pond.';});
      const little=this.add.image(58,692,'duckling0').setScale(.48).setOrigin(.5,1).setDepth(692);little.kind='duckling';little.petName='Little Duckling';little.home={x:58,y:692};this.ducks.push(little);little.setInteractive({useHandCursor:true}).on('pointerdown',()=>KingdomUI.open('residents'));
      const spots={Ruby:[215,1110],Topaz:[128,1040],Mini:[234,1048]};this.residents.forEach(p=>{const xy=spots[p.petName]||[165+(this.residents.indexOf(p)-3)*24,1190];p.setPosition(...xy);p.home={x:xy[0],y:xy[1]};});
      this.memorial();this.makeMountains();this.makeDwarf();this.makeKeepsakes();
      this.add.zone(350,350,250,170).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit('castle'));
      this.add.zone(940,638,195,130).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit('inn'));
      this.add.zone(55,675,160,100).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit('pond'));
      this.night=document.createElement('div');this.night.className='realm-light';$('world').append(this.night);
      this.lamps=[];[[398,417],[541,428],[723,581],[917,712],[329,-60],[209,1100],[1020,806],[-184,761]].forEach(([x,y])=>{this.prop('lamps','lamp',x,y);const halo=this.add.circle(x,y-37,29,0xffd683,.09).setDepth(3900);this.lamps.push(halo);});
      this.rain=this.add.graphics().setScrollFactor(0).setDepth(4200);
      this.destinationMarker=this.add.graphics().setDepth(6);
      this.poiLabels=[];Object.entries(P.places).forEach(([id,p])=>{const [x,y]=P.nodes[p.node];const t=this.add.text(x,y+35,p.name.toUpperCase(),{fontFamily:'Pixelify Sans',fontSize:'11px',color:'#f8edc7',backgroundColor:'#294932df',padding:{x:7,y:5}}).setOrigin(.5).setDepth(4500).setVisible(false).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit(id));this.poiLabels.push(t);});
    },
    makeCinema(){},
    memorial(){
      const g=this.add.graphics().setDepth(778);g.fillStyle(0x66785c).fillRect(-250,752,190,8);g.fillStyle(0x7c8e64).fillRect(-251,749,192,5);g.fillStyle(0x64795c).fillRect(-250,682,6,71).fillRect(-64,682,6,71);g.fillStyle(0x9d9f7d).fillRoundedRect(-190,700,39,49,9);g.fillStyle(0xc6c7a4).fillRoundedRect(-186,702,31,43,7);g.lineStyle(2,0x879573).lineBetween(-181,714,-161,714);g.fillStyle(0x59794f).fillRect(-185,745,34,5);
      this.add.text(-170,724,'PEARL',{fontFamily:'Pixelify Sans',fontSize:'7px',color:'#56664e'}).setOrigin(.5).setDepth(779);
      [-226,-117,-203,-89].forEach((x,i)=>this.prop('wildflowers','white',x,738+i%2*14));
      g.fillStyle(0x695d3b).fillRect(-244,795,55,6).fillRect(-240,800,4,15).fillRect(-199,800,4,15).fillRect(-244,780,55,6);g.fillStyle(0xaf9765).fillRect(-244,780,55,2).fillRect(-244,794,55,2);
      this.add.zone(-166,740,190,150).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit('memorial'));
      this.signpost(-108,830,'PEARL',false);
    },
    makeMountains(){
      // A single small, jagged ridge texture: facets, scree and foothills at the LPC pixel scale.
      const t=this.textures.createCanvas('kingdom-ridges',768,320),c=t.context,rng=new Phaser.Math.RandomDataGenerator(['north-ridges']);
      const shape=points=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
      const outline=[[0,230],[28,196],[54,204],[88,148],[102,160],[128,106],[145,124],[164,98],[188,46],[210,87],[222,80],[258,144],[286,108],[304,126],[338,60],[355,85],[368,58],[404,123],[424,136],[443,114],[480,183],[514,154],[538,181],[564,136],[604,180],[638,168],[678,222],[728,198],[768,243],[768,318],[0,318]];
      shape(outline);c.fillStyle='#748675';c.fill();c.save();c.clip();
      const facets=[[[188,46],[180,142],[222,206],[266,248],[210,87]],[[368,58],[352,161],[390,196],[445,242],[404,123]],[[128,106],[119,175],[163,210],[187,262],[164,98]],[[286,108],[272,178],[313,206],[342,273],[304,126]],[[564,136],[550,208],[585,246],[636,264],[604,180]],[[54,204],[70,255],[118,289],[102,160]],[[728,198],[715,252],[759,278],[768,243]]];
      facets.forEach((f,i)=>{shape(f);c.fillStyle=i%2?'#4f6a5b':'#536c5c';c.fill();});
      // Broken strata and small mineral flecks keep the rock readable close up.
      for(let i=0;i<1900;i++){const x=rng.between(0,767),y=rng.between(70,304);c.fillStyle=['#8c9a804f','#344e4538','#a4ae8f38'][i%3];c.fillRect(x-x%2,y-y%2,rng.pick([2,4,6]),2);}
      for(let i=0;i<46;i++){const x=rng.between(0,750),y=rng.between(142,270);c.fillStyle='#3f5c4b55';for(let n=0;n<rng.between(3,8);n++)c.fillRect(x+n*4,y+n*2,6,2);}
      c.fillStyle='#bac1a2';[[188,46],[368,58],[338,60]].forEach(([x,y])=>{shape([[x,y],[x-8,y+19],[x-2,y+15],[x+4,y+23],[x+9,y+19]]);c.fill();});
      for(let y=253;y<320;y+=2){c.fillStyle=['#56714e','#526e49','#4c6846'][Math.floor((y-253)/24)];for(let x=0;x<768;x+=4){const edge=254+Math.sin(x*.04)*9+Math.sin(x*.093)*4;if(y>edge)c.fillRect(x,y,4,2);}}
      c.restore();t.refresh();
      this.add.image(348,-315,'kingdom-ridges').setOrigin(.5,1).setDepth(-3000);this.add.image(-276,-248,'kingdom-ridges').setOrigin(.5,1).setFlipX(true).setDepth(-3001);
      for(let i=0;i<22;i++){const x=-380+i*58,y=-286+Math.sin(i*.7)*30;this.prop('trees',i%3?'pine':'oak2',x,y).setDepth(y);}
      this.add.text(550,-390,'BEYOND, SOMEDAY',{fontFamily:'Pixelify Sans',fontSize:'12px',color:'#e2ddbc',backgroundColor:'#405d43',padding:{x:8,y:5}}).setOrigin(.5).setDepth(1);
    },
    makeDwarf(){
      this.prop('table','table',1045,821);this.prop('crates','crate',1115,824);this.prop('barrels','barrel',1090,788);
      const t=this.textures.createCanvas('keeper',32,44),c=t.context;const r=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
      r('#273e32',5,37,9,5);r('#273e32',20,37,8,5);r('#98634b',7,22,20,16);r('#b48759',6,21,5,11);r('#b48759',26,21,4,11);r('#92735e',10,8,17,18);r('#c6a079',11,9,14,16);r('#57684b',8,3,20,8);r('#8b9b6b',11,1,13,4);r('#c7c4a0',7,18,23,11);r('#c7c4a0',10,29,17,5);r('#d9d2ac',13,32,10,5);r('#3d4030',12,13,3,3);r('#3d4030',22,13,3,3);r('#a67e59',17,17,5,4);r('#d0ad66',14,27,9,3);t.refresh();this.keeper=this.add.image(1045,787,'keeper').setOrigin(.5,1).setDepth(787);
      this.scales=this.add.container(1027,781).setDepth(835);const g=this.add.graphics();g.fillStyle(0x796138).fillRect(-2,-33,4,37).fillRect(-14,3,28,4);g.lineStyle(2,0xc4a15d).lineBetween(-22,-29,22,-29).lineBetween(-17,-29,-17,-12).lineBetween(17,-29,17,-12);g.fillStyle(0xcfb473).fillTriangle(-26,-12,-8,-12,-17,-6).fillTriangle(8,-12,26,-12,17,-6);this.scales.add(g);
      this.add.zone(1040,788,140,100).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.visit('dwarf'));this.signpost(1123,870,'THE LEDGER',false);
    },
    makeKeepsakes(){
      const crown=this.add.graphics();crown.fillStyle(0x70582d).fillRect(-12,-8,25,9);crown.fillStyle(0xd6b367).fillPoints([{x:-12,y:-5},{x:-14,y:-20},{x:-5,y:-13},{x:0,y:-23},{x:5,y:-13},{x:14,y:-20},{x:12,y:-5}],true);crown.fillStyle(0x9f6552).fillRect(-2,-12,4,4);
      const lantern=this.add.graphics();lantern.fillStyle(0x80683d).fillRect(-10,-28,20,3).fillRect(-10,-5,20,4).fillRect(-8,-25,3,20).fillRect(6,-25,3,20);lantern.fillStyle(0xf1ce7c).fillRect(-4,-23,10,18);lantern.fillStyle(0xffedb0).fillRect(-1,-21,3,14);lantern.lineStyle(2,0x80683d).strokeRect(-4,-35,9,7);
      this.keepsakeSprites={crown,lantern};this.placeKeepsakes(KingdomModel.initial());
    },
    placeKeepsakes(s){
      if(!this.keepsakeSprites)return;
      const slots={castle:[386,370],north:[419,-59],south:[245,1085]};
      for(const [id,sprite] of Object.entries(this.keepsakeSprites)){const [x,y]=slots[s.placements[id]]||slots.castle;sprite.setPosition(x+(id==='lantern'?36:0),y).setDepth(y+1);}
      const throneAt=s.placements.throne==='castle'?[331,374]:[(slots[s.placements.throne]||slots.castle)[0]-70,(slots[s.placements.throne]||slots.castle)[1]];
      this.throne?.setPosition(...throneAt).setDepth(throneAt[1]);
      if(this.ducks?.length)this.ducks.at(-1).petName=s.duckName||'Little Duckling';
      for(const [home,decor] of Object.entries(this.homeDetails||{})){
        decor.flag.setVisible(s.letters.some(l=>l.to===home&&!l.read));
        decor.flowers.setVisible(s.gestures.some(g=>g.to===home&&g.kind==='Flowers'));
        const mood=s.moods[KingdomModel.day()+':'+home];decor.lantern.setFillStyle(({Content:0xebcd87,Excited:0xe7af60,Tender:0xcaa0ac,Tired:0xa3b4cc,Low:0x9facd2,Overwhelmed:0xa4b8a8})[mood?.mood]||0xe3cda1,mood ? .16 : .055);
      }
      if(this.awardCount!==undefined&&s.awards.length>this.awardCount&&!reduced())this.tweens.add({targets:this.scales,angle:{from:-5,to:5},duration:260,yoyo:true,repeat:2,onComplete:()=>this.scales.setAngle(0)});
      this.awardCount=s.awards.length;
    },
    showResident(){KingdomUI.open('residents');},
    start(){
      this.phase='living';this.node='castle';this.walkDistance=0;this.travel=null;this.overview=false;this.hero.setPosition(180,1120);this.knight.setPosition(350,-35);this.active=this.knight;
      this.viewportObserver=new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width),height=Math.round(entry.contentRect.height);if(width>0&&height>0&&(width!==this.scale.width||height!==this.scale.height))this.scale.resize(width,height);});this.viewportObserver.observe($('world'));this.events.once('shutdown',()=>this.viewportObserver.disconnect());
      this.viewportObserver=new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width),height=Math.round(entry.contentRect.height);if(width>0&&height>0&&(width!==this.scale.width||height!==this.scale.height))this.scale.resize(width,height);});this.viewportObserver.observe($('world'));this.events.once('shutdown',()=>this.viewportObserver.disconnect());
      this.basket.setVisible(false);this.basketGlow.setVisible(false);this.carry.setVisible(false);this.gate.setAlpha(0);this.pigeon.setPosition(300,416);
      this.cameraPoint.x=350;this.cameraPoint.y=320;this.cameras.main.centerOn(350,320);this.cameras.main.setBounds(-600,-770,2060,2390);
      window.addEventListener('kingdom-identity',e=>this.identity(e.detail));window.addEventListener('kingdom-travel',e=>this.visit(e.detail));window.addEventListener('kingdom-overview',()=>this.showOverview());window.addEventListener('kingdom-data',e=>this.placeKeepsakes(e.detail));
      window.addEventListener('kingdom-dialog',()=>{this.input.enabled=false;setTimeout(()=>{this.input.enabled=!$('book').open&&!$('credits').open;},250);});
      $('arrive').onclick=()=>this.finishTravel();this.input.on('pointerdown',pointer=>{if(!this.overview||$('book').open)return;const pt=this.cameras.main.getWorldPoint(pointer.x,pointer.y);const id=Object.keys(P.places).sort((a,b)=>{const A=P.nodes[P.places[a].node],B=P.nodes[P.places[b].node];return Math.hypot(pt.x-A[0],pt.y-A[1])-Math.hypot(pt.x-B[0],pt.y-B[1]);})[0];this.visit(id);});
      if(KingdomUI.store.actor)this.identity(KingdomUI.store.actor);this.placeKeepsakes(KingdomUI.store.view());this.updateClock();this.clockTimer=this.time.addEvent({delay:30000,loop:true,callback:()=>this.updateClock()});this.loadWeather();
      this.time.addEvent({delay:1800000,loop:true,callback:()=>this.loadWeather()});
    },
    identity(who){this.travel=null;this.active=who==='north'?this.knight:this.hero;this.node=who;this.active.setPosition(...P.nodes[who]);this.overview=false;this.resize();this.frameParty(true);$('location').textContent=who==='north'?'North · your little home':'South · your little home';$('travel-note').hidden=true;},
    resize(){if(!this.cameras)return;const width=this.scale.width,height=this.scale.height,cam=this.cameras.main;cam.setSize(width,height);cam.useBounds=!this.overview;if(this.overview){cam.setZoom(Math.min((width-48)/1670,(height-180)/2150));}else cam.setZoom(width>=1000?1.75:width>=600?1.45:1.22);},
    showOverview(){this.overview=true;this.resize();this.poiLabels.forEach(t=>t.setVisible(true).setScale(Math.min(2.2,1/this.cameras.main.zoom)));this.cameraPoint.x=400;this.cameraPoint.y=430;this.cameras.main.centerOn(400,430);},
    visit(id){
      if($('book').open||$('credits').open)return;if(!$('welcome').hidden)$('welcome').hidden=true;const p=P.places[id];if(!p)return;
      if(!KingdomUI.store.actor){this.cameraPoint.x=P.nodes[p.node][0];this.cameraPoint.y=P.nodes[p.node][1]-60;this.overview=false;this.resize();this.cameras.main.centerOn(this.cameraPoint.x,this.cameraPoint.y);$('location').textContent=p.name;KingdomUI.open('login');return;}
      this.overview=false;this.poiLabels.forEach(t=>t.setVisible(false));this.resize();const start=this.travel?nearest(this.active.x,this.active.y):this.node;
      const ids=P.route(start,p.node);if(!this.travel&&ids[0]===this.node)ids.shift();
      this.travel={ids,index:0,destination:id};this.destinationMarker.clear().lineStyle(2,0xf2da92,.7).strokeEllipse(...P.nodes[p.node],38,15);
      $('location').textContent='On the way to '+p.name;$('travel-label').textContent=p.name+' · taking the little path';$('travel-note').hidden=false;
      if(!ids.length||reduced())this.finishTravel();
    },
    finishTravel(){if(!this.travel)return;const id=this.travel.destination,p=P.places[id];this.travel=null;this.node=p.node;this.active.setPosition(...P.nodes[this.node]);this.setStride(this.active,'down',false);this.frameParty(true);this.destinationMarker.clear();$('travel-note').hidden=true;$('location').textContent=p.name;KingdomSound?.place(id);KingdomUI.open(p.panel);},
    frameParty(snap=false){if(!this.active||this.overview)return;this.cameraPoint.x=this.active.x;this.cameraPoint.y=this.active.y-65;if(snap)this.cameras.main.centerOn(this.cameraPoint.x,this.cameraPoint.y);},
    setStride(p,dir,moving){const row=8+['up','left','down','right'].indexOf(dir),frame=row*13+(moving&&!reduced()?1+Math.floor(this.walkDistance/7)%8:0);p.parts.forEach(s=>{s.stop();s.setFrame(frame);});p.direction=dir;p.walking=moving;},
    updateClock(){
      const now=new Date(),parts=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',hour:'numeric',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),hour=Number(parts.find(p=>p.type==='hour').value);
      $('realm-time').textContent=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',weekday:'short',hour:'numeric',minute:'2-digit'}).format(now);
      let dark=hour<6||hour>=20?.23:hour<8||hour>=18?.10:0;const w=this.weather;
      if(w?.sunrise&&w?.sunset){const minute=hour*60+Number(parts.find(p=>p.type==='minute').value);const parse=x=>Number(x.slice(11,13))*60+Number(x.slice(14,16));const rise=parse(w.sunrise),set=parse(w.sunset);dark=minute<rise||minute>set?.23:Math.min(minute-rise,set-minute)<60?.09:0;}
      if(this.night)this.night.style.opacity=dark;this.lamps?.forEach(l=>l.setAlpha(dark>.1?.18:.035));this.isNight=dark>.1;
    },
    async loadWeather(){try{const r=await fetch('/api/kingdom-weather');if(!r.ok)throw Error();const w=await r.json();this.weather=w;this.wet=w.rain;const stale=Date.now()-Date.parse(w.at)>3600000;$('realm-weather').textContent=`${w.temperature}° · ${w.label}${stale?' · earlier conditions':''}`;this.updateClock();KingdomSound?.weather(w.rain);}catch{$('realm-weather').textContent='Auckland time · weather unavailable';this.wet=false;}},
    update(time,delta){
      this.input.enabled=!$('book').open&&!$('credits').open;if(!this.active)return;const dt=Math.min(delta,50)/1000;
      if(this.travel){const t=this.travel,target=P.nodes[t.ids[t.index]];if(!target){this.finishTravel();return;}const dx=target[0]-this.active.x,dy=target[1]-this.active.y,d=Math.hypot(dx,dy),step=80*dt;
        if(d<=step){this.active.setPosition(...target);this.node=t.ids[t.index];t.index++;if(t.index>=t.ids.length){this.finishTravel();return;}}
        else{this.active.x+=dx/d*step;this.active.y+=dy/d*step;this.walkDistance+=step;const dir=Math.abs(dx)>Math.abs(dy)*1.1?(dx>0?'right':'left'):Math.abs(dy)>Math.abs(dx)*1.1?(dy>0?'down':'up'):this.active.direction;this.setStride(this.active,dir,true);if(Math.floor(this.walkDistance/28)!==this.lastFoot){this.lastFoot=Math.floor(this.walkDistance/28);KingdomSound?.step();}}
        this.frameParty();
      }
      this.hero.setDepth(this.hero.y);this.knight.setDepth(this.knight.y);
      if(!reduced()){
        this.residents?.forEach((p,i)=>{const move=!this.isNight&&((time/1000+i*2.1)%19)<3;if(p.kind==='hens'||p.kind==='hens-eat'){p.x=p.home.x+(move?Math.sin(time/800+i)*8:0);p.body.setTexture(move?'hens':'hens-eat',4+(move?Math.floor(time/240)%4:Math.floor(time/700+i)%4));}else if(p.petName==='Ruby'){p.body.setFrame(move?4+Math.floor(time/210)%3:4);p.x=p.home.x+(move?Math.sin(time/1500)*9:0);}else p.body.y=Math.round(Math.sin(time/2000+i)*.4);p.setDepth(p.y);});
        this.ducks?.forEach((d,i)=>{d.x=d.home.x+Math.sin(time/5000+i*.7)*14;d.y=d.home.y+Math.cos(time/7000+i*.6)*5;d.setTexture(d.kind+Math.floor(time/650+i)%2).setDepth(d.y);d.setFlipX(Math.cos(time/5000+i*.7)<0);});
        this.smokePuffs?.forEach(({shape,x,y,i})=>{const t=(time/7000+i/3)%1;shape.setPosition(x+Math.sin(t*3)*8,y-t*20).setAlpha((1-t)*.18);});
      }
      const cam=this.cameras.main;this.rain?.setPosition(cam.width/2-cam.width/(2*cam.zoom),cam.height/2-cam.height/(2*cam.zoom)).setScale(1/cam.zoom).clear();if(this.wet&&!reduced()){this.rain.lineStyle(1,0xc6e0d1,.25);for(let i=0;i<50;i++){const x=(i*79+time*.01)%this.scale.width,y=(i*137+time*.13)%this.scale.height;this.rain.lineBetween(x,y,x-3,y+8);}}
    }
  });
};
