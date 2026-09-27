/* Foot-level collision and navigation. Pure functions also run in the Node tests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KingdomNavigation=factory();})(globalThis,function(){
  const bounds={left:-420,right:1230,top:-225,bottom:1320};
  const buildings=[
    [275,-186,425,-106], [105,969,255,1052], [857,598,1022,687],
    [160,258,544,336], [160,334,244,401],
    [416,421,435,461], [494,421,513,461],
    [-251,682,-244,757], [-68,682,-59,757], [-250,748,-60,757],
    [-190,715,-151,749]
  ];
  function create(obstacles=[],radius=7){
    const rects=[...buildings,...obstacles.filter(o=>o.type==='rect').map(o=>[o.x,o.y,o.x+o.w,o.y+o.h])];
    const circles=obstacles.filter(o=>o.type==='circle');
    function walkable(x,y){
      if(!Number.isFinite(x)||!Number.isFinite(y)||x<bounds.left+radius||x>bounds.right-radius||y<bounds.top+radius||y>bounds.bottom-radius)return false;
      // Both timber bridges are the only dry crossings of the river.
      if(x>576-radius&&x<672+radius&&!((y>=528+radius&&y<=576-radius)||(y>=1024+radius&&y<=1072-radius)))return false;
      if(((x-55)/(91+radius))**2+((y-671)/(62+radius))**2<1)return false;
      for(const [l,t,r,b] of rects){const nx=Math.max(l,Math.min(r,x)),ny=Math.max(t,Math.min(b,y));if((x-nx)**2+(y-ny)**2<radius**2)return false;}
      for(const o of circles)if((x-o.x)**2+(y-o.y)**2<(radius+o.r)**2)return false;
      return true;
    }
    function clear(a,b){
      const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
      for(let i=0;i<=n;i++)if(!walkable(a[0]+dx*i/n,a[1]+dy*i/n))return false;
      return true;
    }
    function move(x,y,dx,dy){
      const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));dx/=n;dy/=n;
      for(let i=0;i<n;i++){
        if(walkable(x+dx,y+dy)){x+=dx;y+=dy;}
        else if(Math.abs(dx)>=Math.abs(dy)){if(walkable(x+dx,y))x+=dx;if(walkable(x,y+dy))y+=dy;}
        else{if(walkable(x,y+dy))y+=dy;if(walkable(x+dx,y))x+=dx;}
      }
      return [x,y];
    }
    const cell=16,cols=Math.ceil((bounds.right-bounds.left)/cell),rows=Math.ceil((bounds.bottom-bounds.top)/cell);
    const point=id=>[bounds.left+(id%cols)*cell,bounds.top+Math.floor(id/cols)*cell];
    const grid=new Uint8Array(cols*rows);
    for(let i=0;i<grid.length;i++)grid[i]=walkable(...point(i))?1:0;
    function anchor(p){
      const cx=Math.round((p[0]-bounds.left)/cell),cy=Math.round((p[1]-bounds.top)/cell);let best=-1,distance=Infinity;
      for(let yy=cy-3;yy<=cy+3;yy++)for(let xx=cx-3;xx<=cx+3;xx++){
        if(xx<0||xx>=cols||yy<0||yy>=rows)continue;const id=yy*cols+xx;if(!grid[id])continue;
        const q=point(id),d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<distance&&clear(p,q)){best=id;distance=d;}
      }
      return best;
    }
    function route(from,to){
      if(!walkable(...from)||!walkable(...to))return null;
      if(clear(from,to))return [to];
      const start=anchor(from),end=anchor(to);if(start<0||end<0)return null;
      const open=new Set([start]),came=new Map(),g=new Map([[start,0]]),f=new Map([[start,Math.hypot(...[point(start)[0]-to[0],point(start)[1]-to[1]])]]),closed=new Set();
      while(open.size){
        let u=-1,score=Infinity;for(const id of open)if(f.get(id)<score){u=id;score=f.get(id);}
        if(u===end){
          const ids=[u];while(came.has(ids[0]))ids.unshift(came.get(ids[0]));
          const raw=[from,...ids.map(point),to],result=[];let at=0;
          while(at<raw.length-1){let next=raw.length-1;while(next>at+1&&!clear(raw[at],raw[next]))next--;result.push(raw[next]);at=next;}
          return result;
        }
        open.delete(u);closed.add(u);const a=point(u),ux=u%cols,uy=Math.floor(u/cols);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy)continue;const x=ux+dx,y=uy+dy;if(x<0||x>=cols||y<0||y>=rows)continue;
          const v=y*cols+x;if(!grid[v]||closed.has(v))continue;
          // No diagonal corner cuts through narrow walls or trunks.
          const b=point(v);if(!clear(a,b))continue;
          const next=g.get(u)+Math.hypot(dx,dy)*cell;if(next>=(g.get(v)??Infinity))continue;
          came.set(v,u);g.set(v,next);f.set(v,next+Math.hypot(b[0]-to[0],b[1]-to[1]));open.add(v);
        }
      }
      return null;
    }
    return {walkable,clear,move,route};
  }
  return {create,bounds};
});
