/* Original, quiet synthesised ambience. No autoplay or third-party audio. */
window.KingdomSound=(()=>{
  let ctx,gain,noise,filter,enabled=false,current='castle',rain=false,wind=0,timer,starting=false;
  function reflect(){const b=document.getElementById('sound');b.textContent=enabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(enabled));b.setAttribute('aria-label',enabled?'Mute ambient sound':'Enable ambient sound');}
  function tone(freq,duration,volume,type='sine'){
    if(!enabled||document.hidden||!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.82,ctx.currentTime+duration);g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(gain);o.start();o.stop(ctx.currentTime+duration+.05);
  }
  async function toggle(){
    if(starting)return;
    if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){const b=document.getElementById('sound');b.textContent='Sound unavailable';b.setAttribute('aria-label','Ambient sound unavailable');b.disabled=true;KingdomUI.toast('This browser does not support ambient sound.');return;}ctx=new Audio();gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.24;noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=rain?1500:650+wind*6;noise.connect(filter);filter.connect(gain);noise.start();}
    if(!enabled){starting=true;let timeout;try{await Promise.race([ctx.resume(),new Promise((_,reject)=>timeout=setTimeout(()=>reject(Error('Audio did not start')),2500))]);}finally{starting=false;clearTimeout(timeout);}}
    enabled=!enabled;gain.gain.setTargetAtTime(enabled ? .07 : 0,ctx.currentTime,.4);reflect();
    clearInterval(timer);if(enabled)timer=setInterval(()=>{if(!rain&&current!=='memorial'){tone(1500+Math.random()*750,.13,.055);setTimeout(()=>tone(2100,.10,.04),200);}},8500);
  }
  document.getElementById('sound').onclick=()=>toggle().catch(()=>{enabled=false;gain?.gain.setValueAtTime(0,ctx.currentTime);ctx?.suspend().catch(()=>{});reflect();KingdomUI.toast('Sound could not start. Try tapping again.');});
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(enabled)ctx.resume().catch(()=>{});});
  return {toggle,effect(name){if(name==='throw')tone(380,.12,.12,'triangle');else if(name==='return')tone(740,.18,.12,'triangle');else{tone(523,.65,.10,'triangle');setTimeout(()=>tone(659,.7,.09,'triangle'),180);setTimeout(()=>tone(784,.9,.08,'triangle'),360);}},place(id){current=id;if(filter)filter.frequency.setTargetAtTime(id==='pond'||id==='memorial'?1100:rain?1500:650,ctx.currentTime,1);if(id==='dwarf')tone(580,.6,.15,'triangle');},weather(weather){rain=typeof weather==='boolean'?weather:['rain','storm'].includes(weather?.kind);wind=typeof weather==='object'?Math.min(weather.wind||0,55):0;if(filter)filter.frequency.setTargetAtTime(rain?1500:650+wind*6,ctx.currentTime,1);},step(){tone(130,.07,.07,'triangle');}};
})();
