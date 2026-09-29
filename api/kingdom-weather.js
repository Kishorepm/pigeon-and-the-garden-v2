const M=require('../kingdom-weather-model');
let cached;
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).end();
  if(cached&&Date.now()-cached.at<600000){res.setHeader('Cache-Control','public, s-maxage=600');return res.status(200).json(cached);}
  try{
    const r=await fetch(M.url,{signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error('Weather unavailable');
    cached=M.normalize(await r.json());res.setHeader('Cache-Control','public, s-maxage=600');return res.status(200).json(cached);
  }catch{res.setHeader('Cache-Control','no-store');if(cached&&M.age(cached)<360)return res.status(200).json({...cached,stale:true});return res.status(503).json({error:'Weather unavailable'});}
};
