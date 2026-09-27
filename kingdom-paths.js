(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomPaths=factory();})(globalThis,function(){
  const nodes={castle:[350,410],gate:[464,398],gateOut:[464,490],fork:[496,552],bridgeW:[544,552],bridge:[624,552],bridgeE:[704,552],bend:[756,612],cross:[816,744],inn:[926,744],dwarf:[1040,800],eastSouth:[964,1048],southBridgeE:[704,1048],southBridge:[624,1048],southBridgeW:[544,1048],southFork:[448,1048],south:[180,1120],west:[280,520],pondTurn:[120,520],pond:[85,740],memorial:[-150,790],northTurn:[550,-20],northRoad:[550,398],north:[350,-35],westSouth:[448,800]};
  const edges=[['castle','gate'],['gate','gateOut'],['gateOut','fork'],['fork','bridgeW'],['bridgeW','bridge'],['bridge','bridgeE'],['bridgeE','bend'],['bend','cross'],['cross','inn'],['inn','dwarf'],['dwarf','eastSouth'],['eastSouth','southBridgeE'],['southBridgeE','southBridge'],['southBridge','southBridgeW'],['southBridgeW','southFork'],['southFork','south'],['southFork','westSouth'],['westSouth','fork'],['fork','west'],['west','pondTurn'],['pondTurn','pond'],['pond','memorial'],['north','northTurn'],['northTurn','northRoad'],['northRoad','gateOut']];
  const places={north:{name:'North',sub:'The knight’s home',node:'north',panel:'today'},south:{name:'South',sub:'Her home & garden',node:'south',panel:'today'},castle:{name:'Our castle',sub:'Three chapters, kept here',node:'castle',panel:'memories'},inn:{name:'The little inn',sub:'Coffee, food & favourites',node:'inn',panel:'tastes'},dwarf:{name:'The workshop',sub:'The keeper of deeds',node:'dwarf',panel:'ledger'},pond:{name:'The pond',sub:'Small residents, big personalities',node:'pond',panel:'residents'},memorial:{name:'Pearl’s garden',sub:'Always part of our story',node:'memorial',panel:'pearl'}};
  function route(from,to){
    if(!nodes[from]||!nodes[to])throw Error('Unknown place');
    const distance={[from]:0},previous={},todo=new Set(Object.keys(nodes));
    while(todo.size){const u=[...todo].reduce((a,b)=>(distance[a]??Infinity)<=(distance[b]??Infinity)?a:b);if(!Number.isFinite(distance[u]))break;todo.delete(u);if(u===to)break;
      for(const [a,b] of edges){const v=a===u?b:b===u?a:null;if(!v||!todo.has(v))continue;const d=distance[u]+Math.hypot(nodes[u][0]-nodes[v][0],nodes[u][1]-nodes[v][1]);if(d<(distance[v]??Infinity)){distance[v]=d;previous[v]=u;}}
    }
    const path=[to];while(path[0]!==from){const p=previous[path[0]];if(!p)throw Error('Unreachable place');path.unshift(p);}return path;
  }
  return {nodes,edges,places,route};
});
