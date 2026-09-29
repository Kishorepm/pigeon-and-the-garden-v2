/* DOM controls keep touch input independent of Phaser's camera/zoom. */
window.KingdomControls=class {
  constructor({allowed,interact}){
    this.allowed=allowed;this.interact=interact;this.keys=new Set();this.vector=[0,0];this.pointer=null;
    this.abort=new AbortController();const on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:this.abort.signal});
    this.root=document.getElementById('movement-controls');this.pad=document.getElementById('walk-pad');this.action=document.getElementById('interact');
    this.knob=this.pad.querySelector('.pad-centre');this.label=document.getElementById('nearby-place');
    // Phaser also listens at window level. A HUD press must not click the cottage
    // or another world object underneath the HTML control.
    for(const surface of document.querySelectorAll('.adventure,dialog,#toast')){
      for(const event of ['pointerdown','mousedown','touchstart'])on(surface,event,e=>{
        if(e.target.tagName!=='CANVAS')e.stopPropagation();
      });
    }
    const movement=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ShiftLeft','ShiftRight'];
    const editing=target=>target?.closest('input,textarea,select,[contenteditable="true"],dialog');
    on(window,'keydown',e=>{
      if(!this.allowed()||editing(e.target)||e.ctrlKey||e.altKey||e.metaKey)return;
      if(movement.includes(e.code)){e.preventDefault();this.keys.add(e.code);}
      if(e.code==='KeyE'&&!e.repeat){e.preventDefault();this.interact();}
    });
    on(window,'keyup',e=>this.keys.delete(e.code));
    on(window,'blur',()=>this.reset());on(document,'visibilitychange',()=>this.reset());
    // Closing a native dialog can dispatch its close event on a later frame.
    // Reset on opening only, so that event cannot cancel newly pressed movement.
    on(window,'kingdom-dialog',()=>{if(document.getElementById('book').open||document.getElementById('credits').open)this.reset();});on(window,'kingdom-identity',()=>this.reset());
    on(this.pad,'pointerdown',e=>{
      if(!this.allowed()||this.pointer!==null||e.button>0)return;e.preventDefault();
      this.pointer=e.pointerId;this.pad.setPointerCapture(e.pointerId);this.drag(e);
    });
    on(this.pad,'pointermove',e=>{if(e.pointerId===this.pointer)this.drag(e);});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])on(this.pad,event,e=>{if(e.pointerId===this.pointer)this.release();});
    on(this.pad,'click',e=>{
      // Assistive technology can activate the same native buttons without a pointer.
      const button=e.target.closest('[data-walk]');if(e.detail!==0||!button||!this.allowed())return;
      this.vector=button.dataset.walk.split(',').map(Number);clearTimeout(this.nudge);this.nudge=setTimeout(()=>this.release(),180);this.paint();
    });
    on(this.pad,'contextmenu',e=>e.preventDefault());
    on(this.action,'click',()=>{if(this.allowed())this.interact();});
  }
  drag(e){
    const r=this.pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width/2-18),y=(e.clientY-r.top-r.height/2)/(r.height/2-18),length=Math.hypot(x,y);
    this.vector=length<.2?[0,0]:[x/Math.max(1,length),y/Math.max(1,length)];this.paint();
  }
  paint(){
    this.knob.style.transform=`translate(${this.vector[0]*9}px,${this.vector[1]*9}px)`;
    this.pad.querySelectorAll('[data-walk]').forEach(b=>{const [x,y]=b.dataset.walk.split(',').map(Number);b.classList.toggle('is-held',x*this.vector[0]+y*this.vector[1]>.35);});
  }
  release(){this.pointer=null;this.vector=[0,0];clearTimeout(this.nudge);this.paint();}
  reset(){this.keys.clear();this.release();}
  sample(){
    if(!this.allowed()){this.reset();return {x:0,y:0,fast:false};}
    const has=(a,b)=>this.keys.has(a)||this.keys.has(b);
    let x=Number(has('KeyD','ArrowRight'))-Number(has('KeyA','ArrowLeft'))+this.vector[0];
    let y=Number(has('KeyS','ArrowDown'))-Number(has('KeyW','ArrowUp'))+this.vector[1];const d=Math.max(1,Math.hypot(x,y));
    return {x:x/d,y:y/d,fast:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight')};
  }
  show(visible){this.root.hidden=!visible;}
  nearby(place){
    const id=place?.id||'';if(this.nearbyId===id)return;this.nearbyId=id;
    this.label.textContent=place?.name||'A little world to wander';this.action.disabled=!place;
    this.action.querySelector('span').textContent=place?.action||'Explore';
    this.action.setAttribute('aria-label',place?place.action+' · '+place.name:'Walk closer to a place to interact');
  }
  destroy(){this.reset();this.abort.abort();}
};
