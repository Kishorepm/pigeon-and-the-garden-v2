/* Progressive discovery: one satchel, an optional introduction, and room to play. */
(() => {
  const $=id=>document.getElementById(id),menu=$('explorer'),toggle=$('menu-open'),backdrop=$('explorer-backdrop');
  const closeMenu=(focus=false)=>{menu.hidden=true;backdrop.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus({preventScroll:true});};
  const openMenu=()=>{menu.hidden=false;backdrop.hidden=false;$('toast').hidden=true;toggle.setAttribute('aria-expanded','true');window.dispatchEvent(new Event('kingdom-menu'));$('explorer-close').focus({preventScroll:true});};
  toggle.onclick=()=>menu.hidden?openMenu():closeMenu(true);$('explorer-close').onclick=()=>closeMenu(true);backdrop.onclick=()=>closeMenu(true);
  menu.addEventListener('click',e=>{if(e.target.closest('#map-open,#home-open,[data-panel],#intro-replay'))closeMenu();});
  window.addEventListener('kingdom-dialog',()=>{if($('book').open||$('credits').open)closeMenu();});
  window.addEventListener('keydown',e=>{if(e.code==='Escape'&&!menu.hidden){e.preventDefault();closeMenu(true);}});
  window.KingdomExperience=class {
    constructor(scene){
      this.scene=scene;this.abort=new AbortController();this.root=$('character-intro');this.step=0;
      KingdomPanels.renderPortraits($('welcome'));
      const on=(name,fn)=>window.addEventListener(name,fn,{signal:this.abort.signal});
      on('kingdom-menu',()=>{scene.cancelTravel();scene.controls.reset();if(!this.root.hidden)this.dismiss(true);});
      on('kingdom-identity',()=>{this.dismiss(false);this.maybeIntroduce();});
      on('kingdom-dialog',()=>{if(($('book').open||$('credits').open)&&!this.root.hidden)this.dismiss(true);});
      $('intro-next').onclick=()=>{if(this.step<2)this.show(this.step+1);else{this.dismiss(true);scene.visit('inn');}};
      $('intro-skip').onclick=()=>this.dismiss(true);
      $('intro-replay').onclick=()=>{if(KingdomUI.store.actor)this.show(0);else KingdomUI.open('login');};
      scene.events.once('shutdown',()=>{this.abort.abort();this.dismiss(false);});
      this.maybeIntroduce();
    }
    key(){return 'kingdom-intro-v2:'+KingdomUI.store.actor;}
    maybeIntroduce(){
      if(!KingdomUI.store.actor||$('book').open)return;
      let seen=false;try{seen=localStorage.getItem(this.key())==='seen';}catch{}
      if(!seen)this.show(0);
    }
    show(step){
      if(!KingdomUI.store.actor)return;this.step=step;
      const north=KingdomUI.store.actor==='north',name=north?'North':'South';
      const steps=[
        [name+' · '+(north?'the knight':'the princess'),'Welcome to your little world.',north?'Your knight has a home in the north. South is down the path, and the castle in the middle belongs to both of you. Three dates have already left their mark.':'Your home is in the south, with Ruby and the little household. North is up the path, and the castle in the middle belongs to both of you. Three dates have already left their mark.','Show me how →'],
        ['YOUR FOOTSTEPS · 2 OF 3','Go where curiosity takes you.','On a phone, touch and drag the left side: the controller appears under your thumb. Release to stop. Tap clear ground to walk there, or pinch to change your view. On a keyboard, use WASD or arrows.','I’ve got it →'],
        ['YOUR NEXT LITTLE ADVENTURE · 3 OF 3','A place for every kind of day.','A button appears when you’re near a place. Explore holds the map, letters and journal. The guild hall keeps our missions and tastings; Us today is for a mood and a little company. Shall we visit the guild?','Visit the guild hall →']
      ];
      const [kicker,title,copy,next]=steps[step];$('intro-step').textContent=kicker;$('intro-title').textContent=title;$('intro-copy').textContent=copy;$('intro-next').textContent=next;
      $('intro-portrait').innerHTML=KingdomPanels.portrait(KingdomUI.store.actor);KingdomPanels.renderPortraits($('intro-portrait'));
      this.root.hidden=false;document.querySelector('.adventure').classList.add('has-intro');
      $('toast').hidden=true;
      $('touch-cue').hidden=step!==1||!matchMedia('(pointer:coarse)').matches;
      closeMenu();
    }
    dismiss(remember){
      this.root.hidden=true;$('touch-cue').hidden=true;document.querySelector('.adventure').classList.remove('has-intro');
      if(remember&&KingdomUI.store.actor)try{localStorage.setItem(this.key(),'seen');}catch{}
    }
  };
})();
