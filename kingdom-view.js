/* Camera controls keep browser/page zoom separate from the game's own view. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomView=factory();})(globalThis,()=>{
  const base=width=>width>=1000?1.75:width>=600?1.45:1.22;
  const limit=value=>Number.isFinite(value)?Math.max(.6,Math.min(1.9,value)):1;
  class Controls{
    constructor(scene){
      this.scene=scene;this.factor=1;this.points=new Map();this.ignoreUntil=0;
      try{const value=localStorage.getItem('kingdom-view-scale');if(value!==null)this.factor=limit(Number(value));}catch{}
      this.abort=new AbortController();const on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:this.abort.signal});
      const $=id=>document.getElementById(id),canvas=scene.game.canvas;
      this.out=$('zoom-out');this.ins=$('zoom-in');this.reset=$('zoom-reset');
      on(this.out,'click',()=>this.set(this.factor-.1));on(this.ins,'click',()=>this.set(this.factor+.1));on(this.reset,'click',()=>this.set(1));
      on(canvas,'wheel',e=>{if(!this.allowed()||e.ctrlKey||e.metaKey)return;e.preventDefault();this.set(this.factor*Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.002));},{passive:false});
      on(window,'keydown',e=>{
        if(!this.allowed()||e.target.closest?.('input,textarea,select,dialog,[contenteditable]')||e.ctrlKey||e.metaKey||e.altKey)return;
        if(['Equal','NumpadAdd','Minus','NumpadSubtract','Digit0','Numpad0'].includes(e.code)){e.preventDefault();this.set(['Digit0','Numpad0'].includes(e.code)?1:this.factor+(['Equal','NumpadAdd'].includes(e.code)?.1:-.1));}
      });
      on(canvas,'pointerdown',e=>{
        if(e.pointerType!=='touch'||!this.scene.canWalk())return;
        this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(this.points.size===1){this.first={x:e.clientX,y:e.clientY};this.moved=false;this.pinched=false;this.tapAction=null;if(!scene.overview)scene.controls?.touchStart(e);}
        if(this.points.size===2){this.pinched=true;this.tapAction=null;this.initialDistance=this.distance();this.initialFactor=this.factor;scene.cancelTravel();scene.controls?.reset();}
      },{capture:true});
      on(window,'pointermove',e=>{
        if(!this.points.has(e.pointerId))return;this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});
        if(Math.hypot(e.clientX-this.first.x,e.clientY-this.first.y)>12)this.moved=true;
        if(this.points.size===1&&!this.pinched)scene.controls?.touchMove(e);
        if(this.points.size===2&&this.initialDistance>0&&this.allowed()){e.preventDefault();this.set(this.initialFactor*this.distance()/this.initialDistance,false);}
      },{passive:false});
      const release=(e,cancelled=false)=>{
        if(!this.points.has(e.pointerId))return;scene.controls?.touchEnd(e);this.points.delete(e.pointerId);
        if(this.points.size)return;
        const action=!cancelled&&!this.pinched&&!this.moved?this.tapAction:null;this.tapAction=null;this.ignoreUntil=performance.now()+300;
        this.persist();if(action)action();
      };
      on(window,'pointerup',e=>release(e));on(window,'pointercancel',e=>release(e,true));
      on(window,'blur',()=>this.cancel());on(document,'visibilitychange',()=>this.cancel());
      scene.events.once('shutdown',()=>{this.abort.abort();this.cancel();});this.reflect();
    }
    allowed(){return !document.getElementById('book').open&&!document.getElementById('credits').open&&!document.hidden&&!this.scene.life?.game;}
    distance(){const [a,b]=[...this.points.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;}
    cancel(){this.points.clear();this.tapAction=null;this.pinched=false;this.scene.controls?.reset();}
    guard(action){
      if(this.points.size){if(!this.pinched)this.tapAction=action;return;}
      if(performance.now()<this.ignoreUntil)return;action();
    }
    persist(){try{localStorage.setItem('kingdom-view-scale',String(this.factor));}catch{}}
    set(value,save=true){
      if(!this.allowed())return;this.factor=Math.round(limit(value)*1000)/1000;
      if(this.scene.overview)this.scene.leaveOverview();else this.apply();
      if(save)this.persist();this.reflect();
    }
    apply(){if(this.scene.overview)return;this.scene.cameras.main.setZoom(base(this.scene.scale.width)*(this.scene.life?.game?1:this.factor));this.scene.frameParty(true);this.reflect();}
    reflect(){this.reset.textContent=Math.round(this.factor*100)+'%';this.reset.setAttribute('aria-label','Reset world zoom · '+Math.round(this.factor*100)+' percent');this.out.disabled=this.factor<=.601;this.ins.disabled=this.factor>=1.899;}
  }
  return {base,limit,Controls};
});
