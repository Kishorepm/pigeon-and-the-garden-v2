/* Original pixel scenery and an interruptible, in-world pet activity. */
window.KingdomLifeWorld=class {
  constructor(scene,reduced){
    this.s=scene;this.reduced=reduced;this.sprites={};this.flowerSprites=[];this.game=null;this.pending=false;this.revealTime=0;
    this.makeScenery();
    this.abort=new AbortController();
    const on=(name,fn)=>window.addEventListener(name,fn,{signal:this.abort.signal});
    on('kingdom-play',()=>this.requestPlay());
    on('kingdom-restored',e=>this.reveal(e.detail));
    on('kingdom-identity',()=>{this.end();KingdomUI.rubyResult=null;});
    on('blur',()=>{this.paused=true;});on('focus',()=>{this.paused=false;});
    document.getElementById('fetch-leave').onclick=()=>{this.end();KingdomUI.toast('The ball will be here whenever you’re ready.');};
    scene.events.once('shutdown',()=>{this.abort.abort();this.end();});
  }
  texture(name,w,h,draw){
    const t=this.s.textures.createCanvas('life-'+name,w,h),c=t.context;c.imageSmoothingEnabled=false;
    const r=(color,x,y,width,height)=>{c.fillStyle=color;c.fillRect(x,y,width,height);};draw(c,r);t.refresh();return 'life-'+name;
  }
  makeScenery(){
    const s=this.s;
    const balcony=this.texture('balcony',136,62,(c,r)=>{
      r('#354c3e',8,4,120,42);r('#677761',12,6,112,35);r('#7d8970',15,8,106,2);
      for(let x=18;x<122;x+=20){r('#3f554a',x,12,15,23);r('#aab28c',x+2,12,2,23);}
      r('#574c36',3,43,130,9);r('#a99769',3,43,130,3);r('#d5c18a',8,28,120,3);
      for(let x=9;x<130;x+=15){r('#7c704e',x,30,4,15);r('#c5b07a',x,30,1,15);}
      [7,120].forEach(x=>{r('#6c6748',x,49,8,13);r('#929170',x+2,49,4,9);r('#b8a262',x,-0,2,16);r('#795d35',x-3,10,8,12);r('#e6c781',x-1,12,4,8);});
    });
    this.sprites.balcony=s.add.image(350,332,balcony).setOrigin(.5,1).setDepth(335).setVisible(false);
    const tower=this.texture('library',90,144,(c,r)=>{
      r('#4e5b49',13,51,64,90);r('#93967a',16,52,58,86);
      for(let y=56;y<139;y+=13){r('#6f7e66',16,y,58,2);for(let x=17+(y%2)*12;x<72;x+=22)r('#78856a',x,y-10,1,9);}
      r('#bdba92',16,54,3,78);r('#717f65',68,54,6,84);
      [28,52].forEach(x=>{r('#435b4f',x,71,12,29);r('#e3c786',x+2,75,8,21);r('#92764d',x+5,75,2,22);r('#8e805b',x+2,85,8,2);r('#bfaf7c',x-2,100,16,3);});
      c.beginPath();c.moveTo(4,56);c.lineTo(45,5);c.lineTo(86,56);c.closePath();c.save();c.clip();r('#405f5a',0,0,90,60);
      for(let y=11;y<58;y+=6){r(y%3?'#59776a':'#6b8570',0,y,90,2);for(let x=(y%2)*7;x<90;x+=13)r('#3c5952',x,y+1,1,5);}c.restore();
      r('#324e46',3,56,84,5);r('#a5a077',7,55,76,2);r('#7d7150',44,0,2,10);r('#b98857',46,0,15,6);r('#caab6c',46,0,14,2);
    });
    this.sprites.library=s.add.image(208,280,tower).setOrigin(.5,1).setDepth(335).setVisible(false);
    const plot=s.add.graphics().setDepth(2);
    plot.fillStyle(0x647c4e).fillRect(292,457,126,63);plot.fillStyle(0x9aa375).fillRect(290,456,130,4).fillRect(290,517,130,4);
    plot.fillStyle(0xb4af81).fillRect(290,460,4,57).fillRect(416,460,4,57);
    [300,367].forEach(x=>{plot.fillStyle(0x6d6745).fillRect(x,465,44,46);plot.fillStyle(0x897852).fillRect(x+2,466,40,43);for(let i=0;i<24;i++)plot.fillStyle(i%2?0xa18c62:0x736a45).fillRect(x+3+(i*13)%36,469+(i*7)%39,2,1);});
    plot.fillStyle(0xcec29a);for(let y=462;y<516;y+=11)plot.fillRect(349,y,13,8);
    this.sprites.garden=plot.setVisible(false);
    this.gardenSign=s.add.text(355,539,'THE MEMORY GARDEN',{fontFamily:'Pixelify Sans',fontSize:'8px',color:'#e9e1b8',backgroundColor:'#4f6643',padding:{x:5,y:4}}).setOrigin(.5).setDepth(541).setVisible(false);
    s.add.zone(355,486,130,64).setInteractive({useHandCursor:true}).on('pointerdown',()=>{if(!this.game)s.visit('garden');});
    // A meadow made for a phone-sized camera: open ground, a path, and a few familiar props.
    const meadow=s.add.graphics().setDepth(-4000);meadow.fillStyle(0xa5b775,.22).fillEllipse(418,1180,216,150);
    for(let i=0;i<75;i++){const x=315+(i*47)%211,y=1118+(i*31)%152;meadow.fillStyle(i%3?0x819c58:0xb8c385,.5).fillRect(x,y,2,3);}
    const bunting=s.add.graphics().setDepth(1119);bunting.lineStyle(1,0x746647).lineBetween(322,1099,518,1099);[322,518].forEach(x=>{bunting.fillStyle(0x6e6240).fillRect(x,1097,3,29).fillStyle(0xb8a06b).fillRect(x,1097,1,28);});
    for(let i=0;i<9;i++){bunting.fillStyle(i%2?0xd3ba7c:0x739887).fillTriangle(330+i*21,1100,340+i*21,1100,335+i*21,1109);}
    s.signpost(493,1287,'RUBY’S MEADOW',false);
    this.basket=s.add.graphics().setDepth(1244);this.basket.fillStyle(0x5c6240).fillRect(305,1233,25,11).fillStyle(0xae8e58).fillRect(305,1231,25,9).fillStyle(0xd0b575).fillRect(304,1230,27,3);for(let x=308;x<329;x+=5)this.basket.fillStyle(0x7e7146).fillRect(x,1233,2,8);
    this.rosette=s.add.graphics().setDepth(1245).setVisible(false);this.rosette.fillStyle(0x916753).fillRect(314,1228,3,10).fillRect(320,1228,3,10).fillStyle(0xe0c382).fillRect(311,1220,14,9).fillRect(314,1217,8,15).fillStyle(0x957348).fillRect(316,1222,4,4);
    this.ring=s.add.graphics().setDepth(3).setVisible(false);this.aim=s.add.graphics().setDepth(4).setVisible(false);
    this.ball=s.add.rectangle(0,0,6,6,0xd6ab63).setStrokeStyle(1,0x806540).setVisible(false);
    this.ballShadow=s.add.ellipse(0,0,9,4,0x2c4b35,.2).setDepth(5).setVisible(false);
    this.homeTokens={};
    for(const home of ['north','south']){const [x,y]=KingdomPaths.nodes[home];this.homeTokens[home]=s.add.graphics().setPosition(x+42,y-9).setDepth(y+2);}
  }
  refresh(state){
    const l=KingdomModel.life(state);
    for(const [id,o] of Object.entries(this.sprites))o.setVisible(!!l.builds[id]);this.gardenSign.setVisible(!!l.builds.garden);
    this.rosette.setVisible(Object.keys(l.ruby).length>0);
    const signature=JSON.stringify(l.flowers);
    if(signature!==this.flowerSignature){
      this.flowerSignature=signature;this.flowerSprites.forEach(x=>x.destroy());this.flowerSprites=[];
      l.flowers.slice(-12).forEach((f,i)=>{
        const x=(i<6?309:376)+(i%3)*12,y=483+(Math.floor(i%6/3))*23,g=this.s.add.graphics().setPosition(x,y).setDepth(y);
        const growth=KingdomModel.people.filter(p=>f.notes[p]).length,h=7+growth*3;
        g.fillStyle(0x4f7546).fillRect(0,-h,2,h).fillRect(-4,-5,4,2).fillRect(2,-8,4,2);
        const color=({daisy:0xf5e5bf,sunflower:0xd8b05f,bluebell:0x9ca3d0})[f.species];g.fillStyle(color);
        if(growth===2)g.fillRect(-3,-h-3,8,5).fillRect(-1,-h-5,4,9);else g.fillRect(-1,-h-2,4,4);
        g.fillStyle(0x9d7742).fillRect(0,-h-1,2,2);this.flowerSprites.push(g);
      });
    }
    const today=KingdomModel.day();
    for(const home of ['north','south']){
      const g=this.homeTokens[home],r=l.responses.find(r=>r.to===home&&r.day===today);g.clear();if(!r)continue;
      g.fillStyle(0x6a593b).fillRect(-10,-2,22,4);
      if(r.kind==='flowers'){g.fillStyle(0x637b49).fillRect(-4,-13,2,11).fillRect(3,-16,2,14);g.fillStyle(0xe4bea0).fillRect(-7,-17,8,6).fillRect(0,-20,8,6);}
      else if(r.kind==='hug'){g.fillStyle(0xc69b8b).fillRect(-6,-14,6,5).fillRect(2,-14,6,5).fillRect(-4,-10,10,5).fillRect(-1,-5,4,3);}
      else if(r.kind==='company'){g.fillStyle(0xbda777).fillRect(-13,-8,28,4).fillRect(-11,-3,3,7).fillRect(10,-3,3,7).fillRect(-13,-16,28,4);}
      else{g.fillStyle(0xa38751).fillRect(-6,-18,14,16);g.fillStyle(0xf6dfa0).fillRect(-3,-15,8,10);g.fillStyle(0xf7e8b4,.10).fillCircle(1,-10,19);}
    }
    if(!KingdomUI.store.actor)this.end();
  }
  reveal(project){
    const sprite=this.sprites[project];if(!sprite)return;
    this.end();this.s.cancelTravel();this.s.controls.reset();this.s.leaveOverview();this.revealTime=this.reduced()?2.5:5;document.querySelector('.adventure').classList.add('is-restoring');
    this.s.cameraPoint.x=350;this.s.cameraPoint.y=380;this.s.cameras.main.centerOn(350,380);
    if(!this.reduced())this.s.tweens.add({targets:sprite,alpha:{from:0,to:1},duration:1200,ease:'Sine.easeOut'});
    KingdomSound.effect('restore');
  }
  clearReveal(){this.revealTime=0;document.querySelector('.adventure').classList.remove('is-restoring');this.s.frameParty(true);}
  requestPlay(){
    this.end();this.pending=true;this.s.walkTo(KingdomPaths.nodes.ruby,'ruby');
    if(!this.s.travel&&!this.game)this.pending=false;
  }
  startPlay(){
    this.pending=false;this.revealTime=0;KingdomUI.rubyResult=null;this.actor=KingdomUI.store.actor;
    this.game=KingdomFetch.create(this.reduced());this.s.ruby.setPosition(this.game.dog.x,this.game.dog.y);this.lastPhase='';
    document.querySelector('.adventure').classList.add('is-fetching');document.getElementById('fetch-hud').hidden=false;
    this.ring.setVisible(true);this.aim.setVisible(true);this.s.controls.reset();this.camera(true);this.draw();
  }
  camera(snap=false){if(!this.game)return false;this.s.cameraPoint.x=416;this.s.cameraPoint.y=1168;if(snap||this.reduced())this.s.cameras.main.centerOn(416,1168);return true;}
  toss(point={x:420,y:1150}){if(!this.game||!this.s.canWalk())return;if(KingdomFetch.toss(this.game,point,this.s.active)){this.s.controls.reset();KingdomSound.effect('throw');this.draw();}}
  nearby(){return this.game?{id:'fetch-'+this.game.phase,name:this.game.phase==='ready'?'Aim for the flower ring':'Ruby is bringing it back',action:this.game.phase==='ready'?'Throw ball':'Go, Ruby!'}:null;}
  end(){
    this.pending=false;this.clearReveal();if(!this.game)return;
    this.game=null;this.ring.setVisible(false);this.aim.setVisible(false);this.ball.setVisible(false);this.ballShadow.setVisible(false);
    this.s.ruby.setPosition(this.s.ruby.home.x,this.s.ruby.home.y).setScale(1);this.s.ruby.body.setFrame(4);this.s.controls?.reset();
    document.getElementById('fetch-hud').hidden=true;document.querySelector('.adventure').classList.remove('is-fetching');this.s.frameParty(true);
  }
  draw(){
    const g=this.game;if(!g)return;const r=KingdomFetch.ring(g);
    this.ring.clear();for(let i=0;i<12;i++){const a=i/12*Math.PI*2,x=r.x+Math.cos(a)*22,y=r.y+Math.sin(a)*12;this.ring.fillStyle(i%2?0xe9d596:0xf5ebc9,.95).fillRect(Math.round(x)-1,Math.round(y)-1,3,3);}
    this.ring.setAlpha(g.phase==='ready'?1:.35);
    this.aim.clear();if(g.phase==='ready')this.aim.lineStyle(1,0xf4e5b6,.65).lineBetween(416,1150,424,1150).lineBetween(420,1146,420,1154);
    this.ball.setVisible(!!g.ball);this.ballShadow.setVisible(!!g.ball);
    if(g.ball){this.ball.setPosition(g.ball.x,g.ball.y).setDepth(Math.max(this.s.active.y,g.dog.y,g.target.y)+2);this.ballShadow.setPosition(g.ball.x,g.phase==='throw'?g.from.y+(g.target.y-g.from.y)*Math.min(1,g.elapsed/(g.gentle?.2:.7)):g.dog.y);}
    if(this.lastPhase!==g.phase){
      this.lastPhase=g.phase;this.s.controls.nearby(this.nearby());document.getElementById('interact').disabled=g.phase!=='ready';
      document.getElementById('fetch-round').textContent=g.phase==='done'?'A very happy Ruby':`Throw ${Math.min(g.round+1,3)} of 3`;
      document.getElementById('fetch-copy').textContent=g.phase==='ready'?'Tap the meadow to aim, or use Throw ball.':g.phase==='rest'?(g.hit?'Right in the flowers. Beautiful throw!':'Back again! Ruby loved that one.'):'Here she comes. You can keep walking.';
      document.getElementById('fetch-pips').innerHTML=[0,1,2].map(i=>`<i class="${i<g.round?'done':''}"></i>`).join('');
      if(g.phase==='rest')KingdomSound.effect('return');
    }
  }
  update(dt,canWalk,input){
    if(this.revealTime){if(input.x||input.y)this.clearReveal();else{this.revealTime=Math.max(0,this.revealTime-dt);if(!this.revealTime)this.clearReveal();}}
    if(!this.game)return;
    if(this.actor!==KingdomUI.store.actor){this.end();return;}
    const p=this.s.active;p.x=Phaser.Math.Clamp(p.x,320,522);p.y=Phaser.Math.Clamp(p.y,1130,1252);
    if(canWalk&&!this.paused){
      const oldX=this.game.dog.x,oldY=this.game.dog.y;this.game.gentle=this.reduced();KingdomFetch.step(this.game,dt,p);
      const dog=this.s.ruby,d=this.game.dog,moving=Math.hypot(d.x-oldX,d.y-oldY)>.01;
      dog.setPosition(d.x,d.y).setDepth(d.y);dog.setScale(d.x<oldX?-1:1,1);dog.body.setFrame(moving&&!this.reduced()?4+Math.floor(this.game.time*8)%3:4);
      this.draw();
      if(this.game.phase==='done'){
        KingdomUI.rubyResult={actor:this.actor,accurate:this.game.accurate,results:[...this.game.results]};this.end();KingdomSound.effect('restore');KingdomUI.open('ruby-result');return;
      }
    }
    this.camera();
  }
};
