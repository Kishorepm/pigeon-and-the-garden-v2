const M=require('../kingdom-model.js');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed.'});
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key)return res.status(503).json({error:'Shared homes are not connected yet.'});
  const auth=req.headers.authorization;
  if(!auth?.startsWith('Bearer '))return res.status(401).json({error:'Please sign in.'});
  const call=async(path,options={})=>{
    const r=await fetch(url+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(10000)});
    if(!r.ok)throw Error('Storage unavailable');return r.status===204?null:r.json();
  };
  try{
    const a=await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});
    if(!a.ok)return res.status(401).json({error:'Please sign in again.'});const user=await a.json();
    const [member]=await call('/rest/v1/kingdom_members?user_id=eq.'+encodeURIComponent(user.id)+'&select=kingdom_id,home');
    if(!member)return res.status(403).json({error:'This account has not been invited into the kingdom.'});
    for(let attempt=0;attempt<3;attempt++){
      const [row]=await call('/rest/v1/kingdom_states?id=eq.'+encodeURIComponent(member.kingdom_id)+'&select=state,revision');
      if(!row)throw Error('Missing kingdom');
      const state=row.state?.schema?row.state:M.initial();
      if(req.method==='GET')return res.status(200).json({actor:member.home,state:M.visible(state)});
      if(Buffer.byteLength(JSON.stringify(req.body||{}))>16000)return res.status(413).json({error:'That entry is too large.'});
      let next;try{next=M.command(state,member.home,req.body);}catch(e){return res.status(400).json({error:e.message});}
      if(next===state)return res.status(200).json({actor:member.home,state:M.visible(state)});
      const committed=await call('/rest/v1/rpc/commit_kingdom',{method:'POST',body:JSON.stringify({kingdom:member.kingdom_id,expected_revision:row.revision,next_state:next})});
      if(committed)return res.status(200).json({actor:member.home,state:M.visible(next)});
    }
    return res.status(409).json({error:'The kingdom changed while you were writing. Please retry.'});
  }catch{return res.status(503).json({error:'Could not reach the kingdom. Please retry; your entry is still in the form.'});}
};
