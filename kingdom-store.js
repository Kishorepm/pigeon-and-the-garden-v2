/* Authenticated server persistence; explicit, separate on-device rehearsal. */
window.KingdomStore=class extends EventTarget{
  constructor(){super();this.mode='disconnected';this.actor=null;this.state=KingdomModel.initial();this.generation=0;this.status='Choose your home';this.authLink=new URLSearchParams(location.hash.slice(1));if(this.authLink.has('access_token')||this.authLink.has('error'))history.replaceState(null,'',location.pathname+location.search);}
  emit(){this.dispatchEvent(new Event('change'));}
  async configure(){try{const r=await fetch('/api/kingdom-config');if(r.ok)this.config=await r.json();}catch{}return !!this.config?.configured;}
  preview(actor){clearInterval(this.timer);this.session=null;sessionStorage.removeItem('kingdom-session');sessionStorage.setItem('kingdom-preview-actor',actor);this.mode='preview';this.actor=actor;try{this.state=JSON.parse(localStorage.getItem('kingdom-rehearsal-v1'))||KingdomModel.initial();}catch{this.state=KingdomModel.initial();}this.status='On this device only';this.emit();}
  async login(email,password){
    if(!this.config?.configured)throw Error('Shared homes need the backend setup first. You can explore the on-device preview.');
    const r=await fetch(this.config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:this.config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const auth=await r.json();if(!r.ok)throw Error('Could not sign in. Check your email and password.');
    this.generation++;this.state=KingdomModel.initial();this.actor=null;this.session=auth;sessionStorage.removeItem('kingdom-preview-actor');sessionStorage.setItem('kingdom-session',JSON.stringify(auth));this.mode='live';await this.load();this.beginSync();
  }
  async resume(){
    try{
      const link=this.authLink;
      if(link.has('error'))throw Error('This sign-in link has expired. Request a new password link.');
      if(link.has('access_token')){
        if(!this.config?.configured)throw Error('The shared homes must be connected before this link can open.');
        if(!['invite','recovery'].includes(link.get('type'))||!link.get('refresh_token'))throw Error('Please use the invitation or password link sent to your email.');
        this.session={access_token:link.get('access_token'),refresh_token:link.get('refresh_token'),expires_at:Math.floor(Date.now()/1000)+Number(link.get('expires_in')||3600)};
        this.authLink=new URLSearchParams();sessionStorage.removeItem('kingdom-preview-actor');sessionStorage.setItem('kingdom-session',JSON.stringify(this.session));sessionStorage.setItem('kingdom-password-setup','yes');
      }
      const preview=sessionStorage.getItem('kingdom-preview-actor');if(KingdomModel.people.includes(preview)){this.preview(preview);return true;}
      const raw=sessionStorage.getItem('kingdom-session');if(!raw||!this.config?.configured)return false;
      this.session=JSON.parse(raw);this.mode='live';await this.load();this.needsPassword=sessionStorage.getItem('kingdom-password-setup')==='yes';this.beginSync();return true;
    }catch(e){this.linkError=e.message;this.logout();return false;}
  }
  async recover(email){
    if(!this.config?.configured)throw Error('The shared homes need to be connected first.');
    const redirect=location.origin+location.pathname;
    const r=await fetch(this.config.url+'/auth/v1/recover?redirect_to='+encodeURIComponent(redirect),{method:'POST',headers:{apikey:this.config.key,'Content-Type':'application/json'},body:JSON.stringify({email})});
    if(!r.ok)throw Error('Could not request a password link. Please wait a little and try again.');
  }
  async password(value){
    if(this.mode!=='live'||!this.actor)throw Error('Open your invitation or password link first.');
    if(value.length<10)throw Error('Please use a password with at least 10 characters.');
    const r=await fetch(this.config.url+'/auth/v1/user',{method:'PUT',headers:{apikey:this.config.key,Authorization:'Bearer '+await this.token(),'Content-Type':'application/json'},body:JSON.stringify({password:value})});
    if(!r.ok)throw Error('Could not change your password. Try another password, or request a new link.');
    this.needsPassword=false;sessionStorage.removeItem('kingdom-password-setup');
  }
  async token(){if(this.session.expires_at*1000<Date.now()+60000){const r=await fetch(this.config.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:this.config.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:this.session.refresh_token})});if(!r.ok)throw Error('Please sign in again.');this.session=await r.json();sessionStorage.setItem('kingdom-session',JSON.stringify(this.session));}return this.session.access_token;}
  async request(body){const r=await fetch('/api/kingdom',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+await this.token(),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const result=await r.json();if(!r.ok){const error=Error(result.error||'Could not save. Your entry is still here.');error.permanent=r.status>=400&&r.status<500;throw error;}return result;}
  async load(){const generation=this.generation,result=await this.request();if(generation!==this.generation||this.mode!=='live')return;if(this.busy||result.state.revision<this.state.revision)return;this.state=result.state;this.actor=result.actor;this.status='Shared · up to date';this.emit();}
  beginSync(){clearInterval(this.timer);this.timer=setInterval(()=>{if(document.visibilityState==='visible'&&!this.busy)this.load().catch(()=>{this.status='Offline · reconnect to save';this.emit();});},15000);}
  async send(type,data){
    if(this.busy)throw Error('A change is still being saved. Please try again in a moment.');
    const c={id:crypto.randomUUID(),type,data};this.busy=true;this.status='Saving…';this.emit();
    try{
      if(this.mode==='preview'){const next=KingdomModel.command(this.state,this.actor,c);localStorage.setItem('kingdom-rehearsal-v1',JSON.stringify(next));this.state=next;this.status='Saved on this device';}
      else{let result;try{result=await this.request(c);}catch(e){if(e.permanent)throw e;result=await this.request(c);}this.state=result.state;this.status='Shared · saved';}
      this.emit();return c.id;
    }catch(e){this.status='Not saved · please retry';this.emit();throw e;}finally{this.busy=false;}
  }
  view(){return this.mode==='preview'?KingdomModel.visible(this.state):this.state;}
  logout(){this.generation++;clearInterval(this.timer);this.session=null;sessionStorage.removeItem('kingdom-session');sessionStorage.removeItem('kingdom-preview-actor');sessionStorage.removeItem('kingdom-password-setup');this.actor=null;this.mode='disconnected';this.state=KingdomModel.initial();this.status='Signed out';this.emit();}
};
