let cached;
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).end();
  res.setHeader('Cache-Control','public, s-maxage=1800, stale-while-revalidate=1800');
  if(cached&&Date.now()-cached.saved<1800000)return res.status(200).json(cached.data);
  try{
    // Approximate shared Auckland region, never a visitor's device position.
    const url='https://api.open-meteo.com/v1/forecast?latitude=-36.85&longitude=174.76&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Pacific%2FAuckland&forecast_days=1';
    const r=await fetch(url,{signal:AbortSignal.timeout(7000)});if(!r.ok)throw Error();const w=await r.json(),code=w.current.weather_code;
    const data={temperature:Math.round(w.current.temperature_2m),label:code<=1?'Clear skies':code<=3?'Cloudy':code<=48?'Misty':code>=95?'Rain & thunder':'Rain nearby',rain:code>=51,sunrise:w.daily.sunrise[0],sunset:w.daily.sunset[0],at:new Date().toISOString()};cached={saved:Date.now(),data};return res.status(200).json(data);
  }catch{if(cached)return res.status(200).json(cached.data);return res.status(503).json({error:'Weather unavailable'});}
};
