/* Room layouts and a small, device-only pouring activity. No relationship points. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomInteriorModel=factory();})(globalThis,()=>{
  const bounds={left:-160,right:160,top:-128,bottom:144};
  const rect=(x,y,w,h)=>({type:'rect',x,y,w,h});
  const station=(id,name,action,x,y,kind,panel)=>({id,name,action,point:[x,y],kind,panel});
  const homes=who=>({
    id:who,name:who==='north'?'North’s cottage':'South’s cottage',theme:who==='north'?'slate':'sage',
    subtitle:who==='north'?'A quiet fire. A desk for little words.':'A warm hearth, with room for the household.',
    obstacles:[rect(-140,-124,54,83),rect(-43,-128,86,18),rect(69,-63,70,38),rect(-119,29,66,32),rect(73,42,65,31),rect(-153,-10,28,15)],
    stations:[station('hearth','The hearth','Tend the fire',0,-91,'fire'),station('mirror','A moment to yourself','How are you feeling?',-59,-64,'panel','today'),
      station('desk','The writing desk','Write a little letter',104,-7,'panel','letter-new'),station('letters','The letter chest','Read pigeon post',-137,29,'panel','post'),
      station('memories','Our three chapters','Revisit a date',-53,-96,'panel','memories'),station('keepsakes','Your keepsake shelf','Arrange keepsakes',108,-99,'panel','keepsakes'),
      station('seat','The fireside seat','Sit for a while',-86,81,'sit'),station('brew','The little drinks corner','Make a cosy drink',94,93,'brew'),
      ...(who==='south'?[station('pets','The cosy pet corner','Say hello',-112,113,'panel','residents')]:[]),station('exit','The cottage door','Back outside',0,125,'exit')]
  });
  const rooms={north:homes('north'),south:homes('south'),inn:{id:'inn',name:'The guild hall',theme:'guild',subtitle:'Pick an adventure. Leave room for a detour.',
    obstacles:[rect(-137,-128,76,20),rect(66,-127,70,34),rect(-43,-128,86,18),rect(-42,-29,84,44),rect(-130,52,62,26),rect(74,55,64,26)],
    stations:[station('board','The mission board','Choose a mission',-98,-89,'panel','missions'),station('tasting','The tasting counter','Log a place & a taste',99,-76,'panel','tastes'),
      station('hearth','The guild hearth','Tend the fire',0,-91,'fire'),station('plans','The planning table','Our someday ideas',0,37,'panel','ideas'),
      station('seat','A seat between adventures','Sit for a while',-98,98,'sit'),station('brew','The drinks corner','Make a cosy drink',101,101,'brew'),station('exit','The guild door','Back outside',0,125,'exit')]},
    castle:{id:'castle',name:'Our great hall',theme:'castle',subtitle:'Three chapters, and space for everything still to come.',
      obstacles:[rect(-36,-128,72,33),rect(-142,-126,58,44),rect(83,-126,60,44),rect(-115,35,63,28),rect(63,35,64,28)],
      stations:[station('throne','The throne from chapter one','Our growing castle',0,-76,'panel','story'),station('memories','The chapter gallery','Revisit our dates',-115,-58,'panel','memories'),
        station('keepsakes','The crown & lantern','Arrange keepsakes',116,-58,'panel','keepsakes'),station('seat','The window seat','Sit for a while',-82,86,'sit'),
        station('capsules','The tomorrow chest','Our time capsules',97,86,'panel','capsules'),station('exit','The great hall door','Back outside',0,125,'exit')]}
  };
  function pour(elapsed){return Math.max(0,Math.min(1,Number.isFinite(elapsed)?elapsed/2.8:0));}
  function result(fill){return fill>=.68&&fill<=.92?'Just right':fill>.92?'A very generous cup':'A little sip';}
  return {bounds,rooms,pour,result};
});
