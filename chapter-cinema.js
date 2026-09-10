/* Actor choreography and restrained atmosphere, using the existing Phaser renderer. */
window.extendChapterCinema=function(Journey){
  const ACTOR_MOTION_SCALE=.68;
  Object.assign(Journey.prototype,{
    makeCinema(){
      this.planTable=this.prop('table','table',300,460).setVisible(false);
      this.letterProp=this.add.container(355,391).setDepth(392).setVisible(false);
      const paper=this.add.graphics();paper.fillStyle(0x79603a).fillRect(-13,-8,28,19);paper.fillStyle(0xf0dfae).fillRect(-14,-10,28,18);paper.lineStyle(1,0xb69b69).lineBetween(-14,-10,0,1).lineBetween(0,1,14,-10);paper.fillStyle(0x925143).fillCircle(0,0,4);paper.fillStyle(0xd2a663).fillRect(-1,-2,2,4);this.letterProp.add(paper);
      this.birdWings=this.add.graphics().setDepth(2001);
      this.sunwash=this.add.rectangle(0,0,2600,2200,0xffd88b,1).setAlpha(0).setOrigin(0).setScrollFactor(0).setDepth(3999);
      this.sunshafts=this.add.graphics().setDepth(1800).setAlpha(.45);
      this.sunshafts.fillStyle(0xffedb0,.055);[[170,170],[470,160],[735,680],[950,850]].forEach(([x,y])=>this.sunshafts.fillPoints([{x,y},{x:x+18,y},{x:x+120,y:y+230},{x:x+53,y:y+230}],true));
      this.lanterns=[];
      [[426,415],[740,595],[1000,702],[915,944]].forEach(([x,y])=>{
        const g=this.add.graphics().setDepth(y+1);g.lineStyle(2,0x4e4932).lineBetween(x,y,x,y-40);g.fillStyle(0x605235).fillRect(x-6,y-45,12,4).fillRect(x-5,y-29,10,3);g.fillStyle(0xe7c375).fillRect(x-4,y-41,8,12);g.fillStyle(0xffe8a5).fillRect(x-2,y-39,3,8);
        const halo=this.add.circle(x,y-36,29,0xffd675,1).setAlpha(.025).setDepth(1801);const core=this.add.circle(x,y-36,12,0xffe5a4,1).setAlpha(.06).setDepth(1802);this.lanterns.push({halo,core});
      });
      this.smoke=[];for(let i=0;i<4;i++)this.smoke.push(this.add.ellipse(976,533-i*12,8+i*2,9+i*2,0xe1dfc0,1).setAlpha(.16).setDepth(1800));
      const board=this.add.graphics().setDepth(787);board.fillStyle(0x514b30).fillRect(907,786,3,20).fillRect(941,786,3,20);board.fillStyle(0x7d6542).fillRect(901,754,49,37);board.fillStyle(0xe6d6a7).fillRect(906,760,17,23).fillRect(928,763,16,19);board.lineStyle(1,0x967955);for(let i=0;i<3;i++){board.lineBetween(909,766+i*5,919,766+i*5);board.lineBetween(931,767+i*5,940,767+i*5);}board.fillStyle(0x8e5144).fillCircle(937,780,2);
      this.pondRipples=[];for(let i=0;i<7;i++)this.pondRipples.push(this.add.rectangle(-10+i*19,655+i%3*19,8,1,0xc4e4c7,.25).setDepth(3));
    },
    castMove(actor,points,done,speed=160){
      this.finishCast(false);this.castMotion={actor,points:points.map(([x,y])=>({x,y})),index:0,done,speed:speed*ACTOR_MOTION_SCALE};
      if(document.getElementById('motion').getAttribute('aria-pressed')==='true')this.finishCast();
    },
    finishCast(complete=true){
      const m=this.castMotion;if(!m)return;this.castMotion=null;
      if(complete){const p=m.points.at(-1);m.actor.setPosition(p.x,p.y);if(m.actor.parts)this.pose(m.actor,'down',false);m.done();}
      this.birdWings?.clear();
    },
    setHourLight(hour,still=false){
      this.hourLight=hour;const alpha=hour==='evening'?.28:hour==='afternoon'?.035:0,warm=hour==='morning'?.10:hour==='afternoon'?.04:0;
      this.tweens.killTweensOf([this.night,this.sunwash]);
      if(still){this.night.setAlpha(alpha);this.sunwash.setAlpha(warm);}else{this.tweens.add({targets:this.night,alpha,duration:800,ease:'Sine.easeOut'});this.tweens.add({targets:this.sunwash,alpha:warm,duration:800,ease:'Sine.easeOut'});}
      this.sunshafts.setVisible(hour!=='evening');document.documentElement.dataset.hour=hour||'day';
    },
    updateCinema(time,dt,reduced){
      if(!this.birdWings)return;
      const m=this.castMotion;
      if(m){if(reduced)this.finishCast();else{const p=m.points[m.index],dx=p.x-m.actor.x,dy=p.y-m.actor.y,d=Math.hypot(dx,dy),step=m.speed*dt;
        if(d<=step){m.actor.setPosition(p.x,p.y);if(++m.index===m.points.length){this.castMotion=null;if(m.actor.parts)this.pose(m.actor,'down',false);m.done();}}
        else{m.actor.x+=dx/d*step;m.actor.y+=dy/d*step;if(m.actor.parts)this.pose(m.actor,Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up',true);}m.actor.setDepth(m.actor.y);
      }}
      this.birdWings.clear();if(!reduced&&this.pigeon.visible&&(this.travel||this.castMotion?.actor===this.pigeon)){
        const x=this.pigeon.x,y=this.pigeon.y-11,lift=Math.sin(time/65)*8;this.birdWings.fillStyle(0xb6c7b1).fillTriangle(x-3,y,x-18,y-4-lift,x-8,y+3).fillTriangle(x+2,y,x+15,y-5-lift,x+7,y+3);this.birdWings.setDepth(this.pigeon.y-1);
      }
      const evening=this.hourLight==='evening';this.lanterns.forEach(({halo,core},i)=>{halo.setAlpha(evening?.18+(reduced?0:Math.sin(time/900+i)*.025):.025);core.setAlpha(evening?.28:.06);});
      this.smoke.forEach((s,i)=>{if(reduced){s.setVisible(false);return;}s.setVisible(true);const a=(time/2800+i/4)%1;s.setPosition(976+Math.sin(a*3+i)*6,533-a*49).setAlpha((1-a)*.16).setScale(.5+a);});
      this.pondRipples.forEach((r,i)=>{if(!reduced)r.setAlpha(.1+Math.sin(time/1400+i)*.09);});
    }
  });
};
