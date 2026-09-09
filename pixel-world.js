/* Original, code-drawn character sprites alongside the project's existing pixel art.
 * All coordinates are snapped to the pixel grid. No downloaded character pack. */
(function(){
  'use strict';
  const files=['tree','treeline','horizon','ruin-stones','ruin-tree','throne-gilded','castle','flowers','duck','drink','boulder'];
  const images={};files.forEach(name=>{const im=new Image();im.src='/art-'+name+'.png';images[name]=im;im.onload=()=>world?.draw();});
  let world=null;
  const C={outline:'#30352a',hair:'#3c3026',hairHi:'#654936',skin:'#edc79e',skinShade:'#c99773',green:'#317247',greenHi:'#5c9b61',dressShade:'#225737',metal:'#adb9aa',metalHi:'#e3e3c7',metalShade:'#6e8278',boot:'#59452d',gold:'#d8b24d'};
  function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
  function art(c,name,x,y,w,h,alpha=1){const im=images[name];if(!im?.complete||!im.naturalWidth)return;c.save();c.globalAlpha=alpha;c.drawImage(im,Math.round(x),Math.round(y),Math.round(w),Math.round(h||w*im.naturalHeight/im.naturalWidth));c.restore();}
  function human(c,x,y,kind,t,walking,scale=2,shield=false){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    const girl=kind==='her',step=walking?(Math.floor(t*7)%2?2:-2):0,bob=walking?(Math.floor(t*7)%2):0,blink=Math.floor(t*10)%47===0;
    rect(c,-9,-1,19,3,'#36543855');c.translate(0,-bob);
    // Separate feet, legs and arms give the walk a real alternating gait.
    rect(c,-5,-9+step,4,8,C.outline);rect(c,2,-9-step,4,8,C.outline);
    rect(c,-6,-3+step,5,3,C.boot);rect(c,2,-3-step,5,3,C.boot);
    if(girl){
      rect(c,-7,-29,14,19,C.hair);rect(c,-8,-27,3,20,C.hair);rect(c,6,-24,3,13,C.hair);
      rect(c,-6,-31,11,5,C.hair);rect(c,-7,-29,3,12,C.hairHi);
      poly(c,[[-5,-19],[5,-19],[9,-5],[-9,-5]],C.dressShade);
      poly(c,[[-4,-19],[4,-19],[7,-7],[-6,-7]],C.green);rect(c,-3,-17,3,9,C.greenHi);
      rect(c,-7,-18,3,8+step,C.green);rect(c,5,-18,3,8-step,C.green);
      rect(c,-7,-11+step,3,3,C.skin);rect(c,5,-11-step,3,3,C.skin);
      rect(c,-5,-27,10,9,C.skin);rect(c,3,-26,2,7,C.skinShade);
      rect(c,-6,-28,11,3,C.hair);rect(c,-6,-25,2,5,C.hair);
      rect(c,-3,-24,1,blink?1:2,C.outline);rect(c,2,-24,1,blink?1:2,C.outline);rect(c,-1,-20,2,1,'#ad7760');
      rect(c,5,-27,2,2,'#d3ae58');rect(c,-5,-7,12,1,C.greenHi);
    }else{
      rect(c,-6,-29,12,10,C.hair);rect(c,-5,-30,10,3,C.hairHi);
      rect(c,-5,-26,10,8,C.skin);rect(c,3,-25,2,7,C.skinShade);
      rect(c,-6,-29,11,4,C.hair);rect(c,-5,-25,2,2,C.hair);
      rect(c,-3,-23,1,blink?1:2,C.outline);rect(c,2,-23,1,blink?1:2,C.outline);rect(c,-1,-19,3,1,'#ae7e5d');
      rect(c,-6,-18,12,11,C.metalShade);rect(c,-5,-18,10,9,C.metal);rect(c,-4,-17,3,6,C.metalHi);
      rect(c,-6,-8,12,2,C.boot);rect(c,-1,-8,3,2,C.gold);
      rect(c,-9,-18,4,5,C.metalShade);rect(c,5,-18,4,5,C.metalShade);rect(c,-8,-18,3,3,C.metalHi);rect(c,5,-18,3,3,C.metalHi);
      rect(c,-8,-13,3,5+step,C.metal);rect(c,6,-13,3,5-step,C.metal);rect(c,-8,-8+step,3,3,C.skin);rect(c,6,-8-step,3,3,C.skin);
      if(shield){poly(c,[[5,-16],[13,-16],[13,-7],[9,-3],[5,-7]],C.outline);poly(c,[[6,-15],[12,-15],[12,-8],[9,-5],[6,-8]],C.gold);rect(c,8,-13,2,7,'#416047');rect(c,6,-11,6,2,'#416047');}
    }
    c.restore();
  }
  function pigeon(c,x,y,t,fly=false){
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(1.8,1.8);
    rect(c,-6,0,13,2,'#344c3944');
    poly(c,[[-7,-8],[-9,-5],[-5,-4],[-4,-1],[3,-1],[6,-5],[6,-12],[3,-15],[-1,-14],[-2,-9]],'#586d70');
    rect(c,0,-14,5,7,'#89999a');rect(c,3,-13,1,1,'#f3e0a1');rect(c,3,-13,1,1,'#283a32');rect(c,5,-11,4,2,'#ca9d53');
    rect(c,-1,-8,5,3,'#598474');rect(c,0,-6,4,2,'#88788d');
    if(fly){poly(c,[[-3,-7],[-12,-8-(Math.floor(t*10)%2)*8],[-8,-2],[2,-3]],'#a7b4ad');}
    else{poly(c,[[-6,-7],[0,-7],[2,-4],[-2,-2],[-6,-3]],'#9ca9a5');rect(c,-5,-5,5,1,'#c1c7b6');}
    rect(c,-3,0,1,2,'#bf8052');rect(c,2,0,1,2,'#bf8052');rect(c,7,-7,8,5,'#f5e4b9');rect(c,8,-6,6,1,'#b4a170');rect(c,11,-5,1,2,'#b96f45');c.restore();
  }
  function table(c,x,y,kind,fill,t){
    rect(c,x-38,y+7,5,34,'#614c2b');rect(c,x+32,y+7,5,34,'#614c2b');
    // Two chairs, including the original throne, stay visibly distinct.
    art(c,'throne-gilded',x+34,y-29,39,62);rect(c,x-67,y-13,5,41,'#5d4d2d');rect(c,x-47,y-13,5,41,'#5d4d2d');rect(c,x-66,y-14,23,5,'#a98946');rect(c,x-65,y+7,23,6,'#94743f');
    rect(c,x-40,y-2,80,16,'#73572e');rect(c,x-43,y-5,86,12,'#d0b071');rect(c,x-41,y-5,82,3,'#efd59a');rect(c,x-38,y+3,76,2,'#b99556');
    rect(c,x-32,y-3,19,6,'#f1e4b7');rect(c,x+15,y-3,19,6,'#f1e4b7');
    if(fill){
      [[-23,-1],[22,-1]].forEach(([a,b])=>{rect(c,x+a,y+b-6,12,5,kind==='picnic'?'#b98542':'#a46a35');rect(c,x+a+1,y+b-8,10,3,'#c49d56');rect(c,x+a+2,y+b-5,8,1,'#64834a');});
      [-8,9].forEach(a=>{rect(c,x+a,y-15,6,12,'#a27f47');rect(c,x+a+1,y-14,4,10,'#dab975');rect(c,x+a+1,y-13,2,3,'#e8e8c9');rect(c,x+a+3,y-18,1,12,'#f5e9c6');});
      if(kind==='cosy'){rect(c,x+1,y-13,2,8,'#f4d6a0');rect(c,x+1,y-16,2,3,Math.floor(t*3)%2?'#efbd53':'#f5d27a');}
    }
  }
  function addition(c,kind,x,y,t,growth=1){
    c.save();c.globalAlpha=growth;c.translate(0,Math.round((1-growth)*24));
    if(kind==='fountain'){
      rect(c,x-24,y+2,48,9,'#697e74');rect(c,x-21,y+1,42,4,'#a8bbab');rect(c,x-19,y+2,38,3,'#86bbbd');rect(c,x-4,y-26,8,29,'#9fae99');rect(c,x-13,y-25,26,5,'#b8c3a5');rect(c,x-10,y-23,20,2,'#72abaf');rect(c,x-2,y-35,4,9,'#dae2bd');
      [-11,11].forEach((v,i)=>rect(c,x+v,y-20+(Math.floor(t*15+i*5)%17),2,7,'#bfe1d6'));
    }else if(kind==='flowers'){
      rect(c,x-25,y-57,4,63,'#947842');rect(c,x+22,y-57,4,63,'#947842');rect(c,x-24,y-61,49,5,'#a68b4e');
      for(let i=0;i<13;i++){const a=x-26+i*4,b=y-61+Math.floor(Math.sin(i)*3);rect(c,a,b,6,7,'#608247');rect(c,a+2,b,3,3,i%2?'#e6c980':'#dfa68a');}
      art(c,'flowers',x-30,y-22,20,28);art(c,'flowers',x+14,y-22,20,28);
    }else{
      art(c,'tree',x-40,y-93,82,104);[-24,4,24].forEach((a,i)=>{const b=y-49+i%2*14;rect(c,x+a,b-6,1,7,'#5b5b33');rect(c,x+a-3,b,7,10,'#8b6132');rect(c,x+a-2,b+2,5,6,'#f1cf75');rect(c,x+a-5,b-2,11,14,'#edc86522');});
    }c.restore();
  }
  class PixelWorld{
    constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.scene=0;this.p={};this.time=0;this.paused=matchMedia('(prefers-reduced-motion:reduce)').matches;this.tween={x:0,growth:1};this.anim=null;this.raf=0;this.last=0;this.discovered=false;this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(canvas);world=this;this.loop=this.loop.bind(this);this.start();document.addEventListener('visibilitychange',()=>document.hidden?this.stop():this.start());}
    set(scene,p){this.scene=scene;this.entered=this.time;this.p={...p};this.anim?.cancel();this.tween.x=this.paused?0:-35;this.tween.growth=this.paused?1:0;if(window.anime&&!this.paused)this.anim=window.anime.animate(this.tween,{x:0,growth:1,duration:scene===8?1100:650,ease:'out(3)',onUpdate:()=>this.draw()});else{this.tween.x=0;this.tween.growth=1;}this.draw();}
    pause(value){this.paused=value;if(value){this.anim?.cancel();this.tween.x=0;this.tween.growth=1;this.stop();this.draw();}else this.start();}
    start(){if(this.raf||this.paused||document.hidden)return;this.last=0;this.raf=requestAnimationFrame(this.loop);}
    stop(){cancelAnimationFrame(this.raf);this.raf=0;}
    loop(now){this.raf=0;if(this.paused||document.hidden)return;if(!this.last||now-this.last>=32){this.time+=this.last?Math.min((now-this.last)/1000,.08):0;this.last=now;this.draw();}this.raf=requestAnimationFrame(this.loop);}
    draw(){
      const c=this.c,w=384,h=Math.max(180,Math.round(this.canvas.clientHeight/Math.max(this.canvas.clientWidth,1)*w));
      if(this.canvas.height!==h)this.canvas.height=h;c.imageSmoothingEnabled=false;
      const n=this.scene,t=this.time,p=this.p,evening=p.time==='evening'&&n>=7,short=h<275;
      const ground=h-(short?75:139),actorY=h-(short?38:64),s=short?1.1:2;
      rect(c,0,0,w,h,evening?'#bbc7cd':'#c4e2de');rect(c,0,ground-52,w,55,evening?'#d9cfbc':'#d5e7cb');
      // A few slow clouds, rendered in stepped shapes rather than a busy backdrop.
      for(let i=0;i<3;i++){let x=((i*141+t*1.8)%510)-65;rect(c,x,ground-95-i%2*19,48,8,'#e9f0da');rect(c,x+9,ground-101-i%2*19,27,7,'#e9f0da');}
      art(c,'horizon',-5,ground-50,394,74,.5);art(c,'treeline',-5,ground-26,394,61,.72);
      rect(c,0,ground+13,w,h-ground,'#74904f');rect(c,0,ground+37,w,h-ground,'#64824b');
      // The castle silhouette remains unfinished and distant until later chapters.
      if(n<2){art(c,'ruin-stones',220,ground-44,90,80);art(c,'ruin-tree',254,ground-69,83,95);rect(c,248,ground-39,3,50,'#9d8a55');rect(c,285,ground-48,3,62,'#9d8a55');rect(c,245,ground-36,49,3,'#c0aa73');}
      else{art(c,'castle',294,ground-76,54,62,.25);rect(c,312,ground-17,28,12,evening?'#d9cfbc':'#d5e7cb');}
      // Winding, stepped path: the visual thread that carries Stop 01 forward.
      poly(c,[[176,ground+8],[208,ground+8],[208,ground+36],[241,ground+36],[241,ground+62],[212,ground+62],[212,ground+92],[171,ground+92],[171,h],[91,h],[91,h-21],[134,h-21],[134,ground+73],[182,ground+73],[182,ground+49],[158,ground+49],[158,ground+31],[176,ground+31]],'#b69c68');
      rect(c,180,ground+11,22,4,'#cdb581');rect(c,186,ground+39,45,4,'#d1b989');rect(c,145,ground+79,56,5,'#d1b989');rect(c,103,h-20,54,5,'#d1b989');
      for(let i=0;i<31;i++){let x=(i*67+21)%384,y=ground+22+(i*23)%(h-ground-22);if(x>90&&x<241)continue;rect(c,x,y,1,4,'#486e3d');rect(c,x+2,y-2,1,5,'#53783e');if(i%4===0){rect(c,x,y-4,3,3,i%3?'#d3be69':'#e3caa0');rect(c,x+1,y-3,1,1,'#9d8d42');}}
      art(c,'tree',-36,ground-65,94,125);art(c,'tree',324,ground-30,93,123);
      const offset=Math.round(this.tween.x),walking=Math.abs(offset)>1;
      if(n===0||n===1){art(c,'throne-gilded',213,actorY-70,53,77);human(c,230+offset,actorY-7,'her',t,walking,s);human(c,138+offset,actorY+3,'him',t,walking,s);pigeon(c,181,actorY-2+Math.sin(t*1.7),t);rect(c,69,actorY-35,4,39,'#675333');rect(c,56,actorY-52,33,23,'#8b7646');rect(c,58,actorY-50,29,18,'#eee0ab');rect(c,66,actorY-43,4,4,'#63814b');rect(c,70,actorY-47,3,7,'#63814b');}
      else if(n===8||n===9||n===10){
        rect(c,65,actorY-20,256,56,'#9e9d72');rect(c,70,actorY-18,246,3,'#bab58b');
        for(let i=0;i<12;i++)rect(c,72+i*20,actorY+10,1,22,'#8f9368');
        if(p.date==='cosy'){rect(c,68,ground-35,4,115,'#8b7446');rect(c,313,ground-35,4,115,'#8b7446');rect(c,67,ground-36,250,4,'#a18a53');rect(c,73,ground-31,239,2,'#d3bf83');}
        addition(c,p.addition||'lantern',84,actorY-8,t,this.tween.growth);
        table(c,215,actorY-8,p.date,n>=8,t);human(c,159+offset,actorY+18,'him',t,walking,s,n===10);human(c,272+offset,actorY+16,'her',t,walking,s);
        const flight=n===10&&!this.paused?Math.min(1,Math.max(0,(t-this.entered-1)/2.5)):0;
        if(flight<1)pigeon(c,307+flight*150,actorY+22-flight*150,t,flight>0);
      }else{
        if(n===2||n===3){
          // A signpost, with two roads rather than a demand that she travel.
          rect(c,263,actorY-58,5,70,'#735c35');poly(c,[[238,actorY-62],[286,actorY-62],[296,actorY-54],[286,actorY-46],[238,actorY-46]],'#e1ce98');rect(c,245,actorY-56,32,2,'#8a8c58');
          if(p.travel==='pickup'){rect(c,80,actorY-17,56,20,'#bba567');rect(c,91,actorY-30,30,15,'#bba567');rect(c,94,actorY-27,12,10,'#c5ded6');rect(c,109,actorY-27,10,10,'#c5ded6');rect(c,88,actorY,10,8,'#394937');rect(c,119,actorY,10,8,'#394937');}
        }
        if(n===4){rect(c,247,actorY-39,5,54,'#80653d');rect(c,305,actorY-39,5,54,'#80653d');rect(c,239,actorY-46,78,9,'#a95f38');rect(c,239,actorY-37,78,7,'#e3c083');rect(c,243,actorY-9,71,10,'#a88750');art(c,'drink',257,actorY-37,31,31);}
        if(n===6){addition(c,p.addition||'fountain',285,actorY+6,t);}
        if(n===7){rect(c,0,actorY-11,384,20,'#8eb1a0');rect(c,124,actorY-15,129,8,'#b4a373');rect(c,124,actorY-24,3,15,'#806a43');rect(c,250,actorY-24,3,15,'#806a43');rect(c,124,actorY-24,128,2,'#806a43');}
        human(c,159+offset,actorY+6,'him',t,walking,s);human(c,212+offset,actorY+6,'her',t,walking,s);pigeon(c,259+offset,actorY+9+Math.sin(t*2),t);
      }
      if(this.discovered){art(c,'duck',305,actorY+24,24,25);}
      // Foreground edge, sparingly animated flowers and dusk lights.
      art(c,'flowers',7+Math.floor(Math.sin(t)),h-47,38,47);art(c,'flowers',344+Math.floor(Math.sin(t+1)),h-41,35,44);
      if(evening){for(let i=0;i<6;i++){const x=33+i*61+Math.sin(t+i)*4,y=ground+35+Math.cos(t*.7+i)*18;rect(c,x,y,2,2,'#efe19b');}}
    }
  }
  window.PixelWorld=PixelWorld;
})();
