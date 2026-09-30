/* A scenery pass at the LPC pixel scale. Existing licensed tiles provide the
   masonry, plants and cliffs; architectural details are original canvas art. */
window.KingdomScenery=class {
  constructor(scene,reduced){
    this.s=scene;this.reduced=reduced;this.clock=0;this.last=performance.now();this.nextFrame=0;
    this.home('north-cottage',true);this.home('south-cottage',false);this.guild();this.landscape();this.castle();
    this.water=scene.add.graphics().setDepth(2);this.fireflies=scene.add.graphics().setDepth(1350);
    this.route=scene.add.graphics().setDepth(3);this.routeSignature='';
    this.butterflies=[[270,1180],[380,485],[-185,773],[24,601],[466,203],[880,861]];
  }
  home(key,north){
    const s=this.s,t=s.textures.get(key),c=t.context;c.clearRect(0,0,192,196);c.imageSmoothingEnabled=false;
    const r=(colour,x,y,w,h)=>{c.fillStyle=colour;c.fillRect(x,y,w,h);};
    const shape=(points,colour)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=colour;c.fill();};
    r('#29472b38',14,172,174,15);r('#414b3a',23,97,146,79);
    // Exposed masonry retains its actual artist-authored stone detail.
    c.save();c.beginPath();c.rect(27,100,138,73);c.clip();
    const stone=s.textures.get('walls').getSourceImage();for(let y=100;y<174;y+=32)for(let x=26;x<165;x+=32)c.drawImage(stone,north?32:128,32,32,32,x,y,32,32);c.restore();
    if(!north){r('#e0cda4',28,103,136,31);r('#c3af86',28,132,136,2);}
    r('#b8b395',25,97,4,75);r('#687563',161,98,6,76);r('#444b38',24,173,145,4);
    for(let y=146;y<175;y+=10){r('#8d947a',29,y,132,1);for(let x=34+(y%3)*6;x<158;x+=23)r('#69755f',x,y+1,1,8);}
    // Two roof facets, staggered shingles and a small dormer: distinct homes,
    // consistent line weight and enough material detail for a closer camera.
    const roof=[[10,104],[38,40],[148,40],[182,104]],base=north?'#52636a':'#9b704b';shape(roof,base);
    c.save();c.beginPath();roof.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    const colours=north?['#566870','#657780','#4b5d63','#71828a']:['#a47c50','#b48b5c','#916541','#c19768'];
    for(let y=41,row=0;y<105;y+=6,row++)for(let x=-10+(row%2)*6;x<200;x+=12){r(colours[(x+row*3+200)%4],x,y,11,5);r(north?'#839397':'#ccb07c',x+1,y,9,1);r(north?'#3b5058':'#735338',x+11,y,1,6);}
    shape([[135,40],[148,40],[182,104],[141,104]],north?'#2d444955':'#69463155');c.restore();
    r('#3b493b',8,104,176,6);r(north?'#aab8ab':'#d5b580',11,104,170,2);r('#b5ac82',36,37,114,3);
    // A deep-set arched door with inset panels and a stone threshold.
    shape([[76,174],[76,137],[80,128],[88,121],[102,121],[111,128],[115,137],[115,174]],'#454d3c');
    shape([[80,174],[80,137],[85,130],[90,126],[101,126],[108,132],[111,138],[111,174]],north?'#766044':'#966b48');
    [84,98].forEach(x=>{r('#443f2e',x,140,10,23);r(north?'#ac8c61':'#bb9363',x+1,141,8,1);r('#524c36',x,151,10,1);});r('#dfc583',106,154,3,3);
    r('#899280',73,176,44,4);r('#c7c2a0',68,180,54,4);r('#797f65',71,184,48,2);
    [40,128].forEach(x=>{
      r('#424b39',x-2,116,27,31);r('#ad9c70',x,116,23,2);r('#ead199',x+2,119,19,23);r('#ffe9b2',x+3,120,2,9);
      r('#695c43',x+10,119,2,24);r('#695c43',x+2,128,19,2);r('#867654',x-1,146,25,3);
      [x-9,x+24].forEach(xx=>{r(north?'#50685e':'#6f8052',xx,118,7,26);r(north?'#7a8c79':'#99a06c',xx,119,1,23);for(let yy=122;yy<141;yy+=5)r('#394b3c88',xx+1,yy,5,1);});
      r('#644e36',x-2,151,27,8);r('#a5804e',x-1,152,25,2);
      for(let i=0;i<5;i++){const xx=x+i*5;r('#476745',xx,145,2,8);r(north?'#c9b77d':'#d2a0a0',xx-1,143-i%2*3,4,4);r('#e6d4a6',xx,144-i%2*3,1,1);}
    });
    if(!north){[26,65,123,162].forEach(x=>r('#715940',x,110,4,37));shape([[28,111],[28,118],[64,135],[64,129]],'#715940');shape([[126,128],[126,135],[163,119],[163,112]],'#715940');r('#755c40',27,136,136,3);}
    // Slate dormer / warm timber gable above the entrance.
    shape([[74,94],[74,73],[94,54],[116,73],[116,94]],'#465347');shape([[79,92],[79,74],[95,60],[111,74],[111,92]],north?'#8f9c89':'#d7bd8b');
    r('#415346',88,73,14,17);r('#e7d296',90,75,10,13);r('#716951',94,75,2,13);r('#a9ac83',77,93,39,3);
    r('#48544a',144,39,16,30);r('#87917b',144,43,13,25);for(let y=45;y<68;y+=7){r('#4f6054',144,y,14,1);r('#566559',150+(y%2)*4,y,1,6);}r('#b4b397',140,37,23,4);r('#4b584a',142,35,19,2);
    t.refresh();
  }
  guild(){
    const c=this.s.textures.get('inn').context;
    const r=(colour,x,y,w,h)=>{c.fillStyle=colour;c.fillRect(x,y,w,h);};
    // Recessed windows, ironwork, exposed beams and scrolls give the hall a purpose.
    [25,72,132,178].forEach(x=>{r('#4a4a34',x,139,4,53);r('#c1af7e',x,138,1,50);});
    [40,143].forEach(x=>{r('#3e5145',x+4,139,19,24);for(let y=143;y<164;y+=6)for(let xx=x+5;xx<x+24;xx+=5)r('#cbb585',xx,y,2,2);r('#b6a476',x-2,167,30,3);});
    r('#5e563c',94,138,28,55);[98,110].forEach(x=>{r('#9a784c',x,143,8,17);r('#9a784c',x,166,8,19);r('#c0a06b',x,143,7,1);});r('#c7a764',118,162,3,4);
    r('#5e513b',24,188,160,5);r('#b3a17b',87,195,46,3);r('#746d50',83,198,54,3);
    [34,158].forEach(x=>{r('#775d3d',x,175,18,15);r('#ccac70',x,174,18,3);r('#eee0b9',x+3,177,9,7);r('#ae9061',x+5,178,6,1);});
    this.s.textures.get('inn').refresh();
  }
  landscape(){
    const s=this.s,t=s.textures.get('world-ground'),c=t.context;c.save();c.setTransform(1,0,0,1,512,320);c.imageSmoothingEnabled=false;
    const rng=new Phaser.Math.RandomDataGenerator(['lived-in-grounds']);
    const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy);};
    const pathDistance=(x,y)=>Math.min(...KingdomPaths.edges.map(([a,b])=>distance(x,y,KingdomPaths.nodes[a],KingdomPaths.nodes[b])));
    // Broad, stepped meadow patches break the repeated grass without obscuring paths.
    for(let i=0;i<105;i++){
      const x=rng.between(-390,1220),y=rng.between(-210,1300);if(pathDistance(x,y)<80||x>560&&x<688)continue;
      const w=rng.between(35,88),h=rng.between(16,39);c.fillStyle=i%3?'#50794024':'#b6bd7828';
      for(let row=-h;row<=h;row+=4){const edge=Math.round(Math.sqrt(1-(row/h)**2)*w/4)*4;c.fillRect(x-edge,y+row,edge*2,4);}
    }
    // Pebbled path shoulders and small stones are denser near the shared courtyard.
    for(let i=0;i<1300;i++){
      const x=rng.between(-390,1220),y=rng.between(-210,1300),d=pathDistance(x,y);if(d<19||d>30||x>560&&x<688)continue;
      c.fillStyle=i%3?'#9ba27888':'#d1c392aa';c.fillRect(x,y,i%4?2:4,1);
    }
    // A varied bank meets the existing water boundary, leaving both bridges clear.
    for(let y=-240;y<1320;y+=8){if(y>512&&y<583||y>1008&&y<1079)continue;const n=2+(Math.floor(y/8)%3)*2;c.fillStyle='#658347';c.fillRect(574-n,y,n+2,8);c.fillRect(672,y,n,8);c.fillStyle='#a4ad72';c.fillRect(573,y,2,5);c.fillRect(672,y+2,2,5);}
    c.restore();t.refresh();
    // Native LPC cliff terraces form a rocky treeline in front of the distant ridge.
    s.frame('cliffs','knoll',0,160,160,144);
    [[-242,-253],[714,-237]].forEach(([x,y])=>s.add.image(x,y,'cliffs','knoll').setOrigin(.5,1).setDepth(-3200));
    s.frame('plants','rushes',352,0,32,64);s.frame('plants','lily',384,96,32,32);
    for(let i=0;i<30;i++){
      const y=-152+i*47;if(y>485&&y<602||y>990&&y<1100)continue;
      s.prop('plants','rushes',i%2?682:563,y).setScale(.7).setDepth(y);
    }
    [[19,634],[80,663],[34,705]].forEach(([x,y])=>s.add.image(x,y,'plants','lily').setDepth(3));
    // Cottage herb beds, a timber pergola and workshop supplies reinforce each place.
    for(const [x,y] of [[263,-120],[432,-125],[91,1015],[275,1011]]){const g=s.add.graphics().setDepth(y);g.fillStyle(0x705a3d).fillRect(x-12,y-8,25,10).fillStyle(0xb79c67).fillRect(x-13,y-9,27,2);s.prop('plants','bush',x,y-4).setScale(.6).setDepth(y+1);}
    const pergola=s.add.graphics().setDepth(1100);pergola.fillStyle(0x63573b).fillRect(267,1045,4,41).fillRect(300,1045,4,41).fillRect(263,1044,45,5);pergola.fillStyle(0xb0a17c).fillRect(264,1044,44,1);for(let x=267;x<307;x+=8)pergola.fillStyle(0x746c47).fillRect(x,1034,3,14);
    for(let i=0;i<8;i++)s.prop('wildflowers','white',263+i*6,1044+(i%3)*6).setScale(.5).setDepth(1101);
    s.prop('barrels','barrel',1111,853);s.prop('lumber','planks',1137,873);s.prop('crates','crate',1139,843);
    this.obstacles=[{type:'rect',x:267,y:1045,w:4,h:41},{type:'rect',x:300,y:1045,w:4,h:41}];
  }
  castle(){
    const s=this.s,g=s.add.graphics().setDepth(337);
    // Cornices and climbing roses frame the original castle's stonework.
    g.fillStyle(0xd0c39b).fillRect(167,319,75,3).fillRect(455,319,77,3);g.fillStyle(0x756f58).fillRect(168,324,73,2).fillRect(456,324,75,2);
    [180,220,469,514].forEach(x=>{g.fillStyle(0x807e67).fillRect(x,272,5,46);g.fillStyle(0xb2af8a).fillRect(x,273,1,43);});
    for(let i=0;i<36;i++){const x=i<18?177+(i%3)*4:509+(i%3)*4,y=320-(i%18)*3;g.fillStyle(i%2?0x4c7048:0x739259).fillRect(x,y,4,4);if(i%5===0)g.fillStyle(0xc79ca0).fillRect(x-1,y-1,3,3);}
    const steps=s.add.graphics().setDepth(3);steps.fillStyle(0x969d7e).fillRect(321,416,57,6);steps.fillStyle(0xc8c5a0).fillRect(326,416,46,2);steps.fillStyle(0x9ca484).fillRect(329,423,42,4);
  }
  update(time,playing){
    const now=performance.now(),dt=Math.min(100,now-this.last);this.last=now;if(playing&&!this.reduced())this.clock+=dt;
    const s=this.s;
    if(s.travel){const signature=s.travel.points.map(p=>p.join(',')).join(';');if(signature!==this.routeSignature){this.routeSignature=signature;this.route.clear().fillStyle(0xf3d68e,.4);let from=[s.active.x,s.active.y];for(const to of s.travel.points){const d=Math.hypot(to[0]-from[0],to[1]-from[1]);for(let n=20;n<d;n+=20)this.route.fillRect(Math.round(from[0]+(to[0]-from[0])*n/d)-1,Math.round(from[1]+(to[1]-from[1])*n/d)-1,2,2);from=to;}}}
    else if(this.routeSignature){this.route.clear();this.routeSignature='';}
    // Water and wildlife redraw at 12fps. No large extra textures or particle pools.
    if(now<this.nextFrame)return;this.nextFrame=now+83;this.water.clear();this.fireflies.clear();const phase=this.clock/1000;
    const view=s.cameras.main.worldView;
    this.water.lineStyle(1,0xb8d5b0,.23);
    for(let i=0;i<37;i++){const y=-170+i*41;if(y<view.y-30||y>view.bottom+30||y>525&&y<576||y>1022&&y<1071)continue;const x=603+(i%3)*16+Math.round(Math.sin(phase*.7+i)*4);this.water.lineBetween(x,y+Math.round(Math.sin(phase*.5+i)*2),x+9,y);}
    for(let i=0;i<7;i++){const x=22+i*12,y=653+(i%3)*13+Math.round(Math.sin(phase*.6+i)*2);this.water.lineBetween(x,y,x+6,y);}
    if(s.wet)return;
    this.butterflies.forEach(([hx,hy],i)=>{
      if(hx<view.x-60||hx>view.right+60||hy<view.y-60||hy>view.bottom+60)return;
      const x=Math.round(hx+Math.sin(phase*.35+i)*21),y=Math.round(hy+Math.cos(phase*.4+i)*10);
      if(s.isNight){this.fireflies.fillStyle(0xf0daa0,.25+.25*Math.sin(phase+i)).fillRect(x,y,2,2);}
      else{const w=Math.floor(phase*5+i)%2?2:4;this.fireflies.fillStyle(i%2?0xedd8ac:0xcfa1a0,.8).fillRect(x-w,y,w,2).fillRect(x+1,y,w,2);this.fireflies.fillStyle(0x53684b).fillRect(x,y,1,3);}
    });
  }
};
