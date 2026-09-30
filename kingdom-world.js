/* An explorable extension of the existing LPC kingdom, sharing its art and renderer. */
window.extendLivingKingdom=function(Journey,{reduced}){
  const P=KingdomPaths,$=id=>document.getElementById(id),baseVillage=Journey.prototype.makeVillage,baseGround=Journey.prototype.makeGround,basePreload=Journey.prototype.preloadChapter;
  Object.assign(Journey.prototype,{
    preloadChapter(){basePreload?.call(this);this.load.image('cliffs','game-art/lpc/cliffs.png');},
    makeGround(){baseGround.call(this);this.children.list.forEach(o=>{if(o.texture?.key==='grass-block')o.setDepth(-5000);if(o.texture?.key==='world-ground')o.setDepth(-4999);});},
    paintChapterGround(c,path,terrain){
      // Replace the invitation's old routes and draw the whole network in two
      // passes. Junctions share their dirt fill instead of leaving round seams.
      const grass=document.createElement('canvas');grass.width=grass.height=32;grass.getContext('2d').drawImage(terrain,96,32,32,32,0,0,32,32);
      c.fillStyle=c.createPattern(grass,'repeat');c.fillRect(-512,-320,1792,1664);
      const dirt=document.createElement('canvas');dirt.width=dirt.height=32;dirt.getContext('2d').drawImage(terrain,96,128,32,32,0,0,32,32);
      c.lineCap=c.lineJoin='round';
      for(const [width,colour] of [[57,'#788949'],[49,c.createPattern(dirt,'repeat')]]){
        c.beginPath();P.edges.forEach(([a,b])=>{c.moveTo(...P.nodes[a]);c.lineTo(...P.nodes[b]);});c.lineWidth=width;c.strokeStyle=colour;c.stroke();
      }
      c.fillStyle='#6d8e4b';c.beginPath();c.ellipse(55,674,113,82,0,0,Math.PI*2);c.fill();
      c.fillStyle='#b8b282';c.beginPath();c.ellipse(55,674,100,70,0,0,Math.PI*2);c.fill();
      const tile=document.createElement('canvas');tile.width=tile.height=32;tile.getContext('2d').drawImage(terrain,32,352,32,32,0,0,32,32);c.fillStyle=c.createPattern(tile,'repeat');c.beginPath();c.ellipse(55,671,91,62,0,0,Math.PI*2);c.fill();
      [[350,-70,180,80],[180,1080,200,95],[-165,771,115,73],[1040,810,150,105],[940,723,240,64]].forEach(([x,y,w,h])=>{
        c.fillStyle='#a6ad71';c.fillRect(x-w/2,y-h/2+8,w,h-16);c.fillRect(x-w/2+8,y-h/2,w-16,h);
        c.fillStyle='#bbb28a';c.fillRect(x-w/2+9,y-h/2+12,w-18,h-24);
        c.fillStyle='#d3c8a0';for(let yy=y-h/2+16;yy<y+h/2-12;yy+=13)for(let xx=x-w/2+14;xx<x+w/2-18;xx+=18)c.fillRect(xx,yy,14,8);
      });
      c.fillStyle='#a7b777';for(let i=0;i<80;i++){const x=-230+(i*59)%470,y=945+(i*31)%210;if(Math.hypot(x-180,y-1120)>100)c.fillRect(x,y,3,3);}
    },
    makeVillage(){
      baseVillage.call(this);
      const tex=this.textures.get('inn'),c=tex.context;
      c.save();c.beginPath();c.moveTo(14,125);c.lineTo(40,48);c.lineTo(163,48);c.lineTo(194,125);c.closePath();c.clip();c.fillStyle='#344f5ca8';c.fillRect(12,45,188,88);c.restore();
      c.fillStyle='#4c4935';c.fillRect(29,118,151,18);c.fillStyle='#c6ab6c';c.fillRect(30,118,149,3);c.fillStyle='#776748';c.fillRect(31,133,147,3);
      c.fillStyle='#d7bc78';c.beginPath();c.moveTo(104,63);c.lineTo(114,70);c.lineTo(112,85);c.lineTo(104,91);c.lineTo(96,85);c.lineTo(94,70);c.closePath();c.fill();c.fillStyle='#42584e';c.fillRect(102,71,4,12);c.fillRect(98,75,12,3);tex.refresh();
      this.children.list.filter(o=>o.type==='Text'&&o.text==='THE LITTLE INN').forEach(o=>o.destroy());
      this.add.text(940,615,'THE GUILD HALL',{fontFamily:'Pixelify Sans',fontSize:'10px',color:'#eedbb0',backgroundColor:'#4c4935',padding:{x:6,y:4}}).setOrigin(.5).setDepth(701);
      const banners=this.add.graphics().setDepth(703);
      [879,1000].forEach(x=>{banners.fillStyle(0x7a5843).fillRect(x-12,624,27,4);banners.fillStyle(0x91604e).fillRect(x-9,628,22,40).fillTriangle(x-9,668,x+13,668,x+2,678);banners.fillStyle(0xd6b571).fillRect(x,635,4,21).fillRect(x-5,642,14,4);});
      const board=this.textures.createCanvas('guild-board',64,76),p=board.context;p.imageSmoothingEnabled=false;
      const r=(colour,x,y,w,h)=>{p.fillStyle=colour;p.fillRect(x,y,w,h);};
      r('#3d4930',5,24,54,36);r('#594b33',7,23,50,34);r('#a18b5b',9,25,46,3);r('#68553a',9,57,5,19);r('#68553a',50,57,5,19);
      r('#4b4a35',2,20,60,6);r('#71815b',7,15,50,5);r('#8b9b6c',12,11,40,4);
      [[13,32,15,18],[34,30,17,22]].forEach(([x,y,w,h],i)=>{r('#d7c399',x+1,y+2,w,h);r('#efe0b8',x,y,w,h);r('#98734d',x+6,y+2,3,3);r('#b5a178',x+3,y+8,w-6,1);r('#b5a178',x+3,y+12,w-7,1);if(i)r('#8b6752',x+6,y+16,5,3);});board.refresh();
      this.add.image(821,707,'guild-board').setOrigin(.5,1).setDepth(707);
      this.add.zone(821,674,64,76).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('inn')));
    },
    signpost(x,y,label,right){
      const word=label==='HOME'?'CASTLE':label==='THE LONG WAY'?'SOUTH':label;
      const g=this.add.graphics().setDepth(y);g.fillStyle(0x574b32).fillRect(x-2,y-33,5,34);const w=Math.max(54,word.length*6+12);g.fillStyle(0x584c31).fillRect(x-w/2-1,y-46,w+2,19);g.fillStyle(0xbca570).fillRect(x-w/2,y-45,w,16);g.fillStyle(0xd8c089).fillRect(x-w/2+1,y-44,w-2,2);
      this.add.text(x,y-42,word,{fontFamily:'Pixelify Sans',fontSize:'9px',color:'#36452e'}).setOrigin(.5,0).setDepth(y+1);
    },
    makeForest(){
      const rng=new Phaser.Math.RandomDataGenerator(['our-three-chapters']);
      const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Phaser.Math.Clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
      const clear=(x,y)=>P.edges.some(([a,b])=>distance(x,y,P.nodes[a],P.nodes[b])<65)||(x>165&&x<550&&y>110&&y<510)||(x>190&&x<505&&y<110)||(x>50&&x<310&&y>870)||(x>820&&x<1090&&y>460&&y<850)||(x<185&&x>-290&&y>580&&y<870)||(x>554&&x<695)||(x>290&&x<545&&y>1080)||(x>265&&x<445&&y>445&&y<655);
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
      this.add.zone(x-78,y-10,36,48).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>KingdomUI.open('post')));
      this.add.zone(x,y-55,200,170).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit(north?'north':'south')));
      this.smokePuffs??=[];for(let i=0;i<3;i++)this.smokePuffs.push({shape:this.add.rectangle(x+57,y-163-i*13,9+i*3,9+i*3,0xe8e5c6,.18).setDepth(y+1),x:x+57,y:y-163-i*13,i});
    },
    makeChapterWorld(){
      this.cottage('north-cottage',350,-85,true);this.cottage('south-cottage',180,1070,false);
      this.add.image(624,1024,'bridge-floor','deck').setOrigin(.5,0).setDepth(1);this.add.image(624,992,'bridge','rear').setOrigin(.5,0).setDepth(1011);this.add.image(624,1016,'bridge','front').setOrigin(.5,0).setDepth(1070);
      this.residents=[];this.buildPets();
      this.ducks=this.ducks.filter(d=>{if(d.petName==='Pearl'){d.destroy();return false;}d.kind=d.petName.startsWith('Duckling')?'duckling':'duck';return true;});
      this.ducks.forEach(d=>{d.description=d.petName==='Dil'?'Dil, keeping a watchful eye on the little ones.':d.kind==='duckling'?'One of the original eight little ducklings.':'At home on the pond.';});
      const little=this.add.image(58,692,'duckling0').setScale(.48).setOrigin(.5,1).setDepth(692);little.kind='duckling';little.petName='Little Duckling';little.home={x:58,y:692};this.ducks.push(little);little.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>KingdomUI.open('residents')));
      const spots={Ruby:[215,1110],Topaz:[128,1040],Mini:[234,1048]};this.residents.forEach(p=>{const xy=spots[p.petName]||[165+(this.residents.indexOf(p)-3)*24,1190];p.setPosition(...xy);p.home={x:xy[0],y:xy[1]};});
      this.memorial();this.makeMountains();this.makeDwarf();this.makeKeepsakes();
      this.add.zone(350,350,250,170).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('castle')));
      this.add.zone(940,638,195,130).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('inn')));
      this.add.zone(55,675,160,100).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('pond')));
      this.night=document.createElement('div');this.night.className='realm-light';$('world').append(this.night);
      this.lamps=[];[[398,417],[541,428],[723,581],[917,712],[329,-60],[209,1100],[1020,806],[-184,761]].forEach(([x,y])=>{this.prop('lamps','lamp',x,y);const halo=this.add.circle(x,y-37,29,0xffd683,.09).setDepth(3900);this.lamps.push(halo);});
      this.destinationMarker=this.add.graphics().setDepth(6);
      this.poiLabels=[];Object.entries(P.places).forEach(([id,p])=>{const [x,y]=P.nodes[p.node];const t=this.add.text(x,y+35,p.name.toUpperCase(),{fontFamily:'Pixelify Sans',fontSize:'11px',color:'#f8edc7',backgroundColor:'#294932df',padding:{x:7,y:5}}).setOrigin(.5).setDepth(4500).setVisible(false).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit(id)));this.poiLabels.push(t);});
    },
    makeCinema(){},
    memorial(){
      const g=this.add.graphics().setDepth(778);g.fillStyle(0x66785c).fillRect(-250,752,190,8);g.fillStyle(0x7c8e64).fillRect(-251,749,192,5);g.fillStyle(0x64795c).fillRect(-250,682,6,71).fillRect(-64,682,6,71);g.fillStyle(0x9d9f7d).fillRoundedRect(-190,700,39,49,9);g.fillStyle(0xc6c7a4).fillRoundedRect(-186,702,31,43,7);g.lineStyle(2,0x879573).lineBetween(-181,714,-161,714);g.fillStyle(0x59794f).fillRect(-185,745,34,5);
      this.add.text(-170,724,'PEARL',{fontFamily:'Pixelify Sans',fontSize:'7px',color:'#56664e'}).setOrigin(.5).setDepth(779);
      [-226,-117,-203,-89].forEach((x,i)=>this.prop('wildflowers','white',x,738+i%2*14));
      g.fillStyle(0x695d3b).fillRect(-244,795,55,6).fillRect(-240,800,4,15).fillRect(-199,800,4,15).fillRect(-244,780,55,6);g.fillStyle(0xaf9765).fillRect(-244,780,55,2).fillRect(-244,794,55,2);
      this.add.zone(-166,740,190,150).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('memorial')));
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
      this.add.zone(1040,788,140,100).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.worldAction(()=>this.visit('dwarf')));this.signpost(1123,870,'THE LEDGER',false);
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
      this.awardCount=s.awards.length;this.life?.refresh(s);
    },
    worldAction(action){const run=()=>{if(!$('book').open&&!$('credits').open&&$('explorer').hidden)action();};if(this.view)this.view.guard(run);else run();},
    showResident(p){this.worldAction(()=>{if(!this.life?.game)KingdomUI.open(p?.petName==='Ruby'?'ruby':'residents');});},
    start(){
      this.phase='living';this.node='castle';this.walkDistance=0;this.travel=null;this.overview=false;this.hero.setPosition(180,1120);this.knight.setPosition(350,-35);this.active=this.knight;
      this.viewportObserver=new ResizeObserver(([entry])=>{const width=Math.round(entry.contentRect.width),height=Math.round(entry.contentRect.height);if(width>0&&height>0&&(width!==this.scale.width||height!==this.scale.height))this.scale.resize(width,height);});this.viewportObserver.observe($('world'));this.events.once('shutdown',()=>this.viewportObserver.disconnect());
      this.basket.setVisible(false);this.basketGlow.setVisible(false);this.carry.setVisible(false);this.gate.setAlpha(0);this.pigeon.setPosition(300,416);
      this.cameraPoint.x=350;this.cameraPoint.y=320;this.cameras.main.centerOn(350,320);this.cameras.main.setBounds(-600,-770,2060,2390);
      this.cameras.main.setLerp(.16,.16);
      this.controls=new KingdomControls({allowed:()=>this.canWalk(),interact:()=>this.interactNearby()});
      this.view=new KingdomView.Controls(this);
      this.life=new KingdomLifeWorld(this,reduced);
      this.experience=new KingdomExperience(this);this.scenery=new KingdomScenery(this,reduced);
      const obstacles=[];
      this.children.list.forEach(o=>{
        const key=o.texture?.key;
        if(key==='trees')obstacles.push({type:'circle',x:o.x,y:o.y-6,r:11});
        if(['table','barrels','crates','fence','guild-board'].includes(key)){
          const w=key==='table'?o.displayWidth-10:key==='fence'?o.displayWidth:key==='guild-board'?48:20,h=key==='fence'||key==='guild-board'?7:13;
          obstacles.push({type:'rect',x:o.x-w/2,y:o.y-h,w,h});
        }
      });
      this.navigation=KingdomNavigation.create([...obstacles,...this.scenery.obstacles]);
      const abort=new AbortController(),on=(name,fn)=>window.addEventListener(name,fn,{signal:abort.signal});
      on('kingdom-identity',e=>this.identity(e.detail));on('kingdom-travel',e=>this.visit(e.detail));on('kingdom-overview',()=>this.showOverview());on('kingdom-data',e=>{this.placeKeepsakes(e.detail);if(!KingdomUI.store.actor)this.cancelTravel();});
      on('kingdom-dialog',()=>{if($('book').open||$('credits').open){this.controls.reset();this.input.enabled=false;}});
      on('blur',()=>{this.cancelTravel();this.setStride(this.active,this.active.direction,false);});
      this.events.once('shutdown',()=>{abort.abort();this.controls.destroy();});
      $('arrive').onclick=()=>this.finishTravel();
      this.input.on('pointerdown',(pointer,objects)=>{
        if(!$('welcome').hidden||!this.canWalk()||pointer.event?.target!==this.game.canvas)return;
        const pt=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
        if(objects.length&&!this.life.game)return;
        this.worldAction(()=>{if(!this.canWalk())return;if(this.life.game){this.life.toss(pt);return;}
        if(this.overview){const id=Object.keys(P.places).sort((a,b)=>{const A=P.nodes[P.places[a].node],B=P.nodes[P.places[b].node];return Math.hypot(pt.x-A[0],pt.y-A[1])-Math.hypot(pt.x-B[0],pt.y-B[1]);})[0];this.visit(id);}
        else this.walkTo([pt.x,pt.y]);});
      });
      if(KingdomUI.store.actor)this.identity(KingdomUI.store.actor);this.placeKeepsakes(KingdomUI.store.view());this.updateClock();this.clockTimer=setInterval(()=>{if(!document.hidden)this.updateClock();},30000);this.events.once('shutdown',()=>clearInterval(this.clockTimer));this.atmosphere=new KingdomAtmosphere(this,reduced);
    },
    canWalk(){return !!KingdomUI.store.actor&&!$('book').open&&!$('credits').open&&$('explorer').hidden&&!document.hidden;},
    cancelTravel(){if(this.life)this.life.pending=false;this.travel=null;this.destinationMarker.clear();$('travel-note').hidden=true;},
    identity(who){this.life?.end();this.cancelTravel();this.controls?.reset();this.setStride(this.active,'down',false);this.active=who==='north'?this.knight:this.hero;this.node=who;this.active.setPosition(...P.nodes[who]);this.leaveOverview();this.setStride(this.active,'down',false);this.frameParty(true);$('location').textContent=who==='north'?'North · your little home':'South · your little home';},
    resize(){
      if(!this.cameras)return;const width=this.scale.width,height=this.scale.height,cam=this.cameras.main;cam.setSize(width,height);cam.useBounds=!this.overview;
      if(this.overview){cam.setZoom(Math.min((width-48)/1670,(height-180)/2150));cam.centerOn(400,430);}
      else if(this.view)this.view.apply();else{cam.setZoom(KingdomView.base(width));this.frameParty(true);}
    },
    leaveOverview(){this.overview=false;this.poiLabels.forEach(t=>t.setVisible(false));this.resize();},
    showOverview(){this.life?.end();this.cancelTravel();this.controls?.reset();this.setStride(this.active,this.active.direction,false);this.overview=true;this.resize();this.poiLabels.forEach(t=>t.setVisible(true).setScale(Math.min(2.2,1/this.cameras.main.zoom)));this.cameraPoint.x=400;this.cameraPoint.y=430;this.cameras.main.centerOn(400,430);},
    visit(id){
      if($('book').open||$('credits').open)return;if(this.life?.game)this.life.end();if(!$('welcome').hidden)$('welcome').hidden=true;const p=P.places[id];if(!p)return;
      if(!KingdomUI.store.actor){this.cameraPoint.x=P.nodes[p.node][0];this.cameraPoint.y=P.nodes[p.node][1]-60;this.overview=false;this.resize();this.cameras.main.centerOn(this.cameraPoint.x,this.cameraPoint.y);$('location').textContent=p.name;KingdomUI.open('login');return;}
      this.walkTo(P.nodes[p.node],id);
    },
    walkTo(point,destination=null){
      const points=this.navigation.route([this.active.x,this.active.y],point);
      if(!points){KingdomUI.toast('That spot is out of reach. Try a clear patch of ground.');return;}
      this.controls.reset();this.leaveOverview();this.frameParty();this.travel={points,index:0,destination};
      this.destinationMarker.clear().lineStyle(2,0xf2da92,.85).strokeEllipse(...point,26,11);
      const place=P.places[destination];$('location').textContent=place?'On the way to '+place.name:'A little wander';
      $('travel-label').textContent=place?place.name+' · walk to take over':'Following your footsteps';$('travel-note').hidden=!place;
      if(reduced())this.finishTravel();
    },
    finishTravel(){
      if(!this.travel)return;const play=this.life?.pending&&this.travel.destination==='ruby';const {destination,points}=this.travel,p=P.places[destination];this.active.setPosition(...points.at(-1));this.cancelTravel();
      this.setStride(this.active,this.active.direction,false);this.frameParty(reduced());
      if(play){this.life.startPlay();return;}
      if(p){this.node=p.node;$('location').textContent=p.name;KingdomSound?.place(destination);KingdomUI.open(p.panel);}
    },
    nearbyPlace(){
      if(this.life?.game)return this.life.nearby();if(this.life?.revealTime)return {id:'restoration',name:'Our growing castle',action:'Back to my footsteps'};
      const actions={garden:'Our memory garden',ruby:'Play with Ruby',north:'Check in today',south:'Check in today',castle:'Our growing castle',inn:'Mission board',dwarf:'Visit the keeper',pond:'Meet the residents',memorial:'Remember Pearl'};
      let best=null,distance=Infinity;
      for(const [id,p] of Object.entries(P.places)){const [x,y]=P.nodes[p.node],d=Math.hypot(this.active.x-x,this.active.y-y);if(d<72&&d<distance){best={...p,id,action:actions[id]};distance=d;}}
      const boardDistance=Math.hypot(this.active.x-821,this.active.y-746);if(boardDistance<55&&boardDistance<distance){best={id:'guild-board',name:'The guild noticeboard',panel:'missions',action:'Read the board'};distance=boardDistance;}
      for(const pet of this.residents||[]){const d=Math.hypot(this.active.x-pet.x,this.active.y-pet.y);if(d<42&&d<distance){best={id:pet.petName,name:pet.petName,panel:pet.petName==='Ruby'?'ruby':'residents',action:pet.petName==='Ruby'?'Play fetch':'Say hello'};distance=d;}}
      return best;
    },
    interactNearby(){
      if(!this.canWalk())return;if(this.life?.revealTime){this.life.clearReveal();return;}if(this.life?.game){this.life.toss();return;}const place=this.nearbyPlace();if(!place)return;
      this.cancelTravel();this.controls.reset();this.setStride(this.active,this.active.direction,false);KingdomSound?.place(place.id);KingdomUI.open(place.panel);
    },
    frameParty(snap=false){if(!this.active||this.overview)return;if(this.life?.camera(snap))return;if(this.life?.revealTime){if(snap)this.cameras.main.centerOn(350,380);return;}const lead=this.scale.width<600&&this.scale.height<780?-12:55;this.cameraPoint.x=this.active.x;this.cameraPoint.y=this.active.y-lead;if(snap||reduced())this.cameras.main.centerOn(this.cameraPoint.x,this.cameraPoint.y);},
    setStride(p,dir,moving){
      if(!p)return;const row=8+['up','left','down','right'].indexOf(dir),frame=row*13+(moving&&!reduced()?1+Math.floor(this.walkDistance/6)%8:0);
      if(p.strideFrame!==frame){p.parts.forEach(s=>{s.stop();s.setFrame(frame);});p.strideFrame=frame;}
      p.direction=dir;p.walking=moving;
    },
    updateClock(){
      const now=Date.now(),light=KingdomWeatherModel.daylight(KingdomSky.data,now);
      $('realm-time').textContent=new Intl.DateTimeFormat('en-NZ',{timeZone:'Pacific/Auckland',weekday:'short',hour:'numeric',minute:'2-digit'}).format(now);
      if(this.night){this.night.style.opacity=light.dark;this.night.style.background=light.tint;}
      this.lamps?.forEach(l=>l.setAlpha(light.dark>.1?.18:.035));this.isNight=light.night;this.life?.refresh(KingdomUI.store.view());this.atmosphere?.reflect();
    },
    update(time,delta){
      this.input.enabled=!$('book').open&&!$('credits').open;if(!this.active)return;const dt=Math.min(delta,50)/1000,canWalk=this.canWalk();
      this.controls.show(!!KingdomUI.store.actor&&this.input.enabled);
      const input=this.controls.sample(),before=[this.active.x,this.active.y];let direction=this.active.direction;
      if(canWalk&&(input.x||input.y)){
        this.cancelTravel();if(this.overview){this.leaveOverview();this.frameParty(true);}
        const speed=input.fast?116:84;this.active.setPosition(...this.navigation.move(...before,input.x*speed*dt,input.y*speed*dt));
        direction=Math.abs(input.x)>Math.abs(input.y)?input.x>0?'right':'left':input.y>0?'down':'up';
      }else if(canWalk&&this.travel&&!this.overview){
        const t=this.travel,target=t.points[t.index],dx=target[0]-this.active.x,dy=target[1]-this.active.y,d=Math.hypot(dx,dy),step=Math.min(d,80*dt);
        if(d>0){this.active.x+=dx/d*step;this.active.y+=dy/d*step;direction=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
        if(d<=step){t.index++;if(t.index>=t.points.length)this.finishTravel();}
      }
      this.life?.update(dt,canWalk,input);
      const distance=Math.hypot(this.active.x-before[0],this.active.y-before[1]);this.walkDistance+=distance;
      this.setStride(this.active,direction,distance>.02&&this.canWalk());
      if(distance>.02){this.frameParty();if(Math.floor(this.walkDistance/24)!==this.lastFoot){this.lastFoot=Math.floor(this.walkDistance/24);KingdomSound?.step();}}
      const nearby=this.overview?null:this.nearbyPlace();this.controls.nearby(nearby);if(this.life?.game)$('interact').disabled=this.life.game.phase!=='ready';
      if(!this.travel&&canWalk)$('location').textContent=this.overview?'Our little kingdom':nearby?.name||'Wandering the kingdom';
      this.hero.setDepth(this.hero.y);this.knight.setDepth(this.knight.y);
      if(!reduced()){
        this.residents?.forEach((p,i)=>{if(p.petName==='Ruby'&&this.life?.game)return;const move=!this.isNight&&((time/1000+i*2.1)%19)<3;if(p.kind==='hens'||p.kind==='hens-eat'){p.x=p.home.x+(move?Math.sin(time/800+i)*8:0);p.body.setTexture(move?'hens':'hens-eat',4+(move?Math.floor(time/240)%4:Math.floor(time/700+i)%4));}else if(p.petName==='Ruby'){p.body.setFrame(move?4+Math.floor(time/210)%3:4);p.x=p.home.x+(move?Math.sin(time/1500)*9:0);}else p.body.y=Math.round(Math.sin(time/2000+i)*.4);p.setDepth(p.y);});
        this.ducks?.forEach((d,i)=>{d.x=d.home.x+Math.sin(time/5000+i*.7)*14;d.y=d.home.y+Math.cos(time/7000+i*.6)*5;d.setTexture(d.kind+Math.floor(time/650+i)%2).setDepth(d.y);d.setFlipX(Math.cos(time/5000+i*.7)<0);});
        this.smokePuffs?.forEach(({shape,x,y,i})=>{const t=(time/7000+i/3)%1;shape.setPosition(x+Math.sin(t*3)*8,y-t*20).setAlpha((1-t)*.18);});
      }
      this.atmosphere?.update();
      this.scenery?.update(time,canWalk);
    }
  });
};
