/* Small, deterministic play session. Simulation time advances only while playing. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomFetch=factory();})(globalThis,()=>{
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function create(gentle=false){return {phase:'ready',round:0,accurate:0,time:0,elapsed:0,gentle,dog:{x:390,y:1198},ball:null,target:null,results:[]};}
  function ring(s){return {x:420+(s.gentle?0:Math.sin(s.time*.72)*44),y:1150+(s.gentle?0:Math.cos(s.time*.5)*12)};}
  function toss(s,point,player){
    if(s.phase!=='ready')return false;
    const target={x:clamp(point.x,330,510),y:clamp(point.y,1128,1240)},r=ring(s);
    s.hit=Math.hypot(target.x-r.x,target.y-r.y)<=23;s.target=target;
    s.from={x:player.x,y:player.y-15};s.ball={...s.from};s.phase='throw';s.elapsed=0;return true;
  }
  function toward(p,target,distance){const d=Math.hypot(target.x-p.x,target.y-p.y);if(d<=distance){p.x=target.x;p.y=target.y;return true;}p.x+=(target.x-p.x)/d*distance;p.y+=(target.y-p.y)/d*distance;return false;}
  function step(s,dt,player){
    if(s.phase==='done')return;s.time+=dt;s.elapsed+=dt;
    if(s.phase==='throw'){
      const t=Math.min(1,s.elapsed/(s.gentle?.2:.7));
      s.ball={x:s.from.x+(s.target.x-s.from.x)*t,y:s.from.y+(s.target.y-s.from.y)*t-Math.sin(t*Math.PI)*(s.gentle?0:42)};
      if(t===1){s.phase='chase';s.elapsed=0;}
    }else if(s.phase==='chase'){
      if(toward(s.dog,s.target,150*dt)){s.phase='return';s.elapsed=0;}
    }else if(s.phase==='return'){
      s.ball={x:s.dog.x+7,y:s.dog.y-9};
      if(toward(s.dog,{x:player.x+19,y:player.y+3},145*dt)){
        s.round++;s.accurate+=s.hit?1:0;s.results.push(s.hit);s.ball=null;s.phase=s.round===3?'done':'rest';s.elapsed=0;
      }
    }else if(s.phase==='rest'&&s.elapsed>.8){s.phase='ready';s.elapsed=0;}
  }
  return {create,ring,toss,step};
});
