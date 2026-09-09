/* Small, layered places and residents for the connected kingdom. */
window.extendChapterWorld = function(Journey){
  Object.assign(Journey.prototype,{
    preloadChapter(){
      ['cats','dogs','hens','hens-eat'].forEach(k=>this.load.spritesheet(k,'game-art/pets/'+k+'.png',{frameWidth:32,frameHeight:32}));
    },
    paintChapterGround(c,path,terrain){
      path([[464,490],[496,700],[448,900],[496,1048],[624,1048],[760,1048],[840,976],[816,744]],60);
      path([[350,410],[300,472],[120,472],[-100,410],[-210,380]],48);
      path([[120,472],[80,600],[85,690]],42);
      path([[926,744],[1018,790],[1002,890],[964,1048],[840,1048]],46);
      path([[816,802],[880,802],[926,744]],44);path([[968,744],[1018,770],[980,804],[926,744]],44);
      const tile=document.createElement('canvas');tile.width=tile.height=32;tile.getContext('2d').drawImage(terrain,32,352,32,32,0,0,32,32);
      c.fillStyle='#456c38';c.beginPath();c.ellipse(55,680,105,76,-.2,0,Math.PI*2);c.fill();
      c.fillStyle='#79a451';c.beginPath();c.ellipse(55,676,100,71,-.2,0,Math.PI*2);c.fill();
      c.fillStyle=c.createPattern(tile,'repeat');c.beginPath();c.ellipse(55,674,88,59,-.2,0,Math.PI*2);c.fill();
      c.fillStyle='#bea978';c.fillRect(110,220,80,65);
      c.fillStyle='#94a85c';c.beginPath();c.ellipse(-215,380,125,77,0,0,Math.PI*2);c.fill();
    },
    makeChapterWorld(){
      this.residents=[];
      this.add.image(624,1024,'bridge-floor','deck').setOrigin(.5,0).setDepth(1);
      this.add.image(624,992,'bridge','rear').setOrigin(.5,0).setDepth(1011);
      this.add.image(624,1016,'bridge','front').setOrigin(.5,0).setDepth(1070);
      this.signpost(768,984,'THE LOOKOUT',true);
      const car=this.add.graphics().setDepth(790);car.fillStyle(0x24382c).fillRoundedRect(1002,756,59,31,6);car.fillStyle(0x968b55).fillRect(1004,757,56,24);car.fillStyle(0xb7ae79).fillRect(1013,748,35,20);car.fillStyle(0x597568).fillRect(1017,751,12,10).fillRect(1032,751,11,10);car.fillStyle(0x25372d).fillRect(1010,779,10,8).fillRect(1044,779,10,8);car.fillStyle(0xcbd0a7).fillRect(1003,766,5,7).fillRect(1056,766,5,7);car.lineStyle(1,0x6a6a46).lineBetween(1030,766,1030,779);
      // The lookout is a little timber platform with a bench and a view of the water.
      const deck=this.add.graphics().setDepth(2);deck.fillStyle(0x987546).fillRect(768,910,160,91);deck.lineStyle(1,0x634f31);for(let y=914;y<1001;y+=8)deck.lineBetween(768,y,928,y);deck.lineStyle(3,0x584e30).strokeRect(768,910,160,91);
      this.prop('fence','horizontal',799,921);this.prop('fence','horizontal',862,921);this.prop('table','table',880,953);
      [[714,935],[965,1011],[1002,952],[955,874],[1050,1000],[1010,1070],[748,1160],[437,1157],[292,1030],[210,896],[210,738],[-74,797],[-131,678],[-171,519],[-329,416],[-281,234],[-152,176],[4,100],[96,104],[-339,66],[-418,583],[-440,844],[-232,1005],[39,1048],[190,1146],[-100,-104],[101,-160],[281,-178],[480,-160]].forEach(([x,y],i)=>this.prop('trees',i%3?'oak':'pine',x,y));
      for(let x=95;x<222;x+=48)this.prop('fence','horizontal',x,293);
      this.prop('crates','crate',99,236);this.prop('lumber','planks',143,208);
      this.signpost(-210,460,'AMBURY · 01',false);
      this.prop('table','table',-228,381);this.prop('flowers','flowers',-188,391);
      this.prop('flowers','flowers',300,365).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.openMemory?.());
      this.add.ellipse(300,365,34,11,0xe8d796,.2).setDepth(1);
      // The next reward is an empty cushion. Only the completed chapter supplies the crown.
      const reward=this.add.graphics().setDepth(366);reward.fillStyle(0x6d6650).fillRect(371,354,24,12);reward.fillStyle(0x9b987b).fillRect(368,352,30,5);reward.fillStyle(0x7c5146).fillRect(374,347,18,5);
      this.crown=this.add.graphics().setDepth(365).setVisible(false);this.crown.fillStyle(0x715528).fillRect(373,340,21,7);this.crown.fillStyle(0xd9b85f).fillPoints([{x:374,y:344},{x:372,y:332},{x:379,y:337},{x:384,y:329},{x:389,y:337},{x:396,y:332},{x:393,y:344}],true);this.crown.fillStyle(0x7b4c45).fillRect(383,338,3,3);
      this.rewardHit=this.add.zone(383,350,44,44).setInteractive({useHandCursor:true});this.rewardHit.on('pointerdown',()=>this.openReward?.());
      this.buildPets();
      this.createPacking();
      // Far-off peaks set a direction without revealing a future ending.
      const peaks=this.add.graphics().setDepth(1);peaks.fillStyle(0x526d58).fillPoints([{x:-100,y:-75},{x:20,y:-290},{x:140,y:-75},{x:230,y:-240},{x:340,y:-75}],true);peaks.fillStyle(0x78907c).fillPoints([{x:-4,y:-240},{x:20,y:-290},{x:51,y:-233},{x:29,y:-243},{x:14,y:-231}],true);
      const dragon=this.add.graphics().setDepth(2);dragon.fillStyle(0x344d40).fillEllipse(130,-162,23,9).fillTriangle(125,-164,111,-184,102,-158).fillTriangle(134,-164,155,-185,159,-157);dragon.lineStyle(4,0x344d40).lineBetween(138,-162,154,-151);
      this.night=this.add.rectangle(0,0,2600,2200,0x1f3048,1).setAlpha(0).setOrigin(0).setScrollFactor(0).setDepth(4000);
    },
    buildPets(){
      const pet=(name,kind,base,x,y,description)=>{
        const p=this.add.container(x,y).setDepth(y);p.add(this.add.ellipse(0,-2,20,7,0x253c29,.18));
        p.body=this.add.sprite(0,0,kind,base).setOrigin(.5,1);p.add(p.body);p.petName=name;p.kind=kind;p.base=base;p.home={x,y};p.description=description;p.setSize(44,44).setInteractive({useHandCursor:true});p.on('pointerdown',()=>this.showResident?.(p));this.residents.push(p);return p;
      };
      this.ruby=pet('Ruby','dogs',4,377,444,'Keeper of the gate. Your red-harnessed welcoming committee.');
      this.ruby.coat=this.add.graphics();this.ruby.coat.fillStyle(0x36352c).fillRect(-6,-17,9,5);this.ruby.coat.fillStyle(0xb4443b).fillRect(3,-19,3,11).fillRect(-4,-14,10,3);this.ruby.add(this.ruby.coat);
      this.topaz=pet('Topaz','cats',7,340,385,'The ginger resident has decided the throne is also a cat bed.');
      this.mini=pet('Mini','cats',15,280,406,'The tortoiseshell mum cat. A comfortable cushion, a good view, no rush.');
      const patches=this.add.graphics();patches.fillStyle(0xb7773e).fillRect(-5,-9,5,4).fillRect(4,-7,3,3);this.mini.add(patches);
      for(let i=0;i<4;i++)pet('The ladies','hens',4,120+i%2*38,245+Math.floor(i/2)*26,'The ladies are busy inspecting the garden. Nothing gets past this committee.');
      const rooster=pet('The rooster','hens',4,204,219,'The castle’s self-appointed morning announcer.');rooster.body.setTint(0xc49b68);const comb=this.add.graphics();comb.fillStyle(0x9e403b).fillRect(-9,-25,6,4);comb.fillStyle(0x344c3a).fillRect(8,-17,5,10);rooster.add(comb);
      // Hand-authored two-frame ducks, kept separate from the licensed animal sheets.
      for(const type of ['duck','duckling'])for(let f=0;f<2;f++){
        const g=this.make.graphics({x:0,y:0,add:false});const chick=type==='duckling';g.fillStyle(chick?0xd6b45b:0xd5d3b5).fillRect(5,11,17,10).fillRect(16,5,9,12);g.fillStyle(chick?0xefcf7b:0xf0e6c4).fillRect(7,11,12,6).fillRect(17,5,6,7);g.fillStyle(0xa8884b).fillRect(24,10,6,3);g.fillStyle(0x354132).fillRect(21,7,2,2);g.fillStyle(0xa8b4a0).fillRect(0,22+f,27,1);g.generateTexture(type+f,32,26);g.destroy();
      }
      this.ducks=[];
      ['Dil','Pearl','A lady duck',...Array.from({length:8},(_,i)=>'Duckling '+(i+1))].forEach((name,i)=>{const chick=i>=3;const d=this.add.image(20+i%4*24,650+Math.floor(i/4)*22,(chick?'duckling':'duck')+'0').setOrigin(.5,1).setScale(chick?.55:1).setDepth(680);d.petName=name;d.home={x:d.x,y:d.y};d.description=chick?'One of the eight little ducklings. An excellent reason to take the long way past the pond.':name==='Dil'?'Dil and the pond patrol. Eight ducklings, three adults, and plenty to supervise.':name==='Pearl'?'Pearl, at home on the castle pond.':'One of the two adult female ducks, keeping the little ones company.';d.setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showResident?.(d));this.ducks.push(d);});
    },
    createPacking(){
      this.packing=this.add.container(915,723).setDepth(735).setVisible(false);
      const blanket=this.add.graphics();blanket.fillStyle(0x7c9464).fillRect(-26,-8,52,20);blanket.lineStyle(2,0xc8d1a1);for(let x=-22;x<26;x+=10)blanket.lineBetween(x,-8,x,12);this.packing.add(blanket);this.blanket=blanket;
      const meal=this.add.graphics();meal.fillStyle(0xe9d6a7).fillEllipse(-7,0,27,14);meal.fillStyle(0xb87b43).fillRoundedRect(-18,-6,20,9,3);meal.fillStyle(0x66864b).fillRect(-15,-7,14,3);this.packing.add(meal);
      this.drinks=this.add.container(12,0);for(let i=0;i<2;i++){const cup=this.add.graphics();cup.fillStyle(0xe0e3ce).fillRect(i*12-2,-19,9,18);cup.fillStyle(i?0xba9163:0xc89862).fillRect(i*12,-13,5,11);cup.fillStyle(0xf1eacc).fillRect(i*12,-16,3,3).fillRect(i*12+3,-12,2,2);cup.lineStyle(1,0x6a854f).lineBetween(i*12+3,-17,i*12+3,-27);this.drinks.add(cup);}this.packing.add(this.drinks);this.drinks.setVisible(false);
    },
    updateChapter(time,dt,reduced){
      if(!this.residents)return;
      const mapButton=document.getElementById('map-open');if(mapButton.disabled!==!!(this.travel||this.castMotion))mapButton.disabled=!!(this.travel||this.castMotion);
      this.residents.forEach((p,i)=>{
        const moving=!reduced&&i>2&&((time/1000+i*2.2)%13)<2;
        if(p===this.ruby){const follow=this.phase==='travelling'&&this.hero.x<530;const tx=follow?this.hero.x-24:p.home.x,ty=follow?this.hero.y+14:p.home.y;const d=Math.hypot(tx-p.x,ty-p.y);if(d>2&&!reduced){const step=Math.min(d,65*dt);p.x+=(tx-p.x)/d*step;p.y+=(ty-p.y)/d*step;p.body.setFrame(4+Math.floor(time/150)%3+(tx<p.x?48:0));}else p.body.setFrame(4);}
        else if(i>2){p.body.setTexture(moving?'hens':'hens-eat',4+(moving?Math.floor(time/180)%4:Math.floor(time/550+i)%4));if(moving)p.x=p.home.x+Math.sin(time/380+i)*7;}
        else if(!reduced)p.body.y=Math.sin(time/1800+i)*.3;
        p.setDepth(p.y);
      });
      this.ducks.forEach((d,i)=>{if(reduced)return;d.x=d.home.x+Math.sin(time/3800+i*.6)*18;d.y=d.home.y+Math.cos(time/4700+i*.5)*6;d.setTexture((i>=3?'duckling':'duck')+Math.floor(time/500+i)%2).setDepth(d.y);d.setFlipX(Math.cos(time/3800+i*.6)<0);});
    }
  });
};
