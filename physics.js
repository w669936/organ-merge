/* Original rigid compound-circle solver. Fixed 180 Hz, angular impulses,
   sequential contact constraints, Coulomb friction, broad-phase bounds.
   No third-party code. Works in browsers and Node test harnesses. */
(function(G){
'use strict';
const C=G.ORGAN_CONFIG,S=G.ORGAN_SHAPES;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cross=(ax,ay,bx,by)=>ax*by-ay*bx;
class World {
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){this.bodies=[];this.events=[];this.contacts=[];this.score=0;this.over=false;this.time=0;this.cooldown=0;this.uid=0;this.merges=0;this.chain=0;this.lastMerge=-10;this.current=this.pick();this.next=this.pick();}
 pick(){let n=this.random()*C.weights.reduce((a,b)=>a+b,0);for(let i=0;i<C.weights.length;i++){n-=C.weights[i];if(n<0)return i;}return 0;}
 add(level,x,y,opts={}){const r=C.organs[level].radius,shape=S[level];
  const mass=Math.max(1,Math.pow(r/24,1.45));
  const b={id:++this.uid,level,x,y,vx:0,vy:0,angle:0,omega:0,r,bound:shape.bound*r,inv:1/mass,inertia:1/(mass*r*r*.48),age:0,danger:0,landed:false,touch:false,born:this.time,...opts};
  this.bodies.push(b);return b;
 }
 drop(x){if(this.over||this.cooldown>1e-8)return false;
  const b=this.add(this.current,clamp(x,55,C.width-55),62,{angle:(this.random()-.5)*.22});this.keepInside(b);
  this.current=this.next;this.next=this.pick();this.cooldown=C.dropCooldown;this.events.push({type:'drop',x:b.x,y:b.y});return b;
 }
 parts(b){let co=Math.cos(b.angle),si=Math.sin(b.angle);return S[b.level].parts.map(p=>{let x=p[0]*b.r,y=p[1]*b.r;return {x:b.x+x*co-y*si,y:b.y+x*si+y*co,r:p[2]*b.r};});}
 bounds(b){let a=this.parts(b);return {left:Math.min(...a.map(p=>p.x-p.r)),right:Math.max(...a.map(p=>p.x+p.r)),top:Math.min(...a.map(p=>p.y-p.r)),bottom:Math.max(...a.map(p=>p.y+p.r))};}
 keepInside(b){const box=this.bounds(b);if(box.left<C.wall)b.x+=C.wall-box.left;if(box.right>C.width-C.wall)b.x-=box.right-(C.width-C.wall);if(box.bottom>C.floor)b.y-=box.bottom-C.floor;}
 contact(a,b,tolerance=0){let dx=b.x-a.x,dy=b.y-a.y;if(dx*dx+dy*dy>(a.bound+b.bound+tolerance)**2)return null;
  let best=null;const ap=this.parts(a),bp=this.parts(b);
  for(const p of ap)for(const q of bp){let x=q.x-p.x,y=q.y-p.y,rr=p.r+q.r,dd=x*x+y*y;if(dd>(rr+tolerance)**2)continue;let len=Math.sqrt(dd),depth=rr-len;
   if(!best||depth>best.depth){let nx=len>1e-7?x/len:1,ny=len>1e-7?y/len:0;best={nx,ny,depth,x:p.x+nx*(p.r-depth*.5),y:p.y+ny*(p.r-depth*.5)};}}
  return best;
 }
 resolve(a,b,h,bounce){
  const nx=h.nx,ny=h.ny,raX=h.x-a.x,raY=h.y-a.y,rbX=b?h.x-b.x:0,rbY=b?h.y-b.y:0;
  const ca=cross(raX,raY,nx,ny),cb=cross(rbX,rbY,nx,ny);
  const denom=a.inv+(b?b.inv:0)+ca*ca*a.inertia+(b?cb*cb*b.inertia:0);
  const correction=Math.max(0,h.depth-.12)*.6/denom;
  a.x-=nx*correction*a.inv;a.y-=ny*correction*a.inv;a.angle-=ca*correction*a.inertia;
  if(b){b.x+=nx*correction*b.inv;b.y+=ny*correction*b.inv;b.angle+=cb*correction*b.inertia;}
  const avx=a.vx-a.omega*raY,avy=a.vy+a.omega*raX;
  const bvx=b?b.vx-b.omega*rbY:0,bvy=b?b.vy+b.omega*rbX:0;
  const rvx=bvx-avx,rvy=bvy-avy,vn=rvx*nx+rvy*ny;
  if(vn<0){const e=bounce&&vn<-95?(b?C.restitution:C.wallRestitution):0;
   const j=-(1+e)*vn/denom;
   const tx=-ny,ty=nx,cat=cross(raX,raY,tx,ty),cbt=cross(rbX,rbY,tx,ty);
   const td=a.inv+(b?b.inv:0)+cat*cat*a.inertia+(b?cbt*cbt*b.inertia:0);
   const jt=clamp(-(rvx*tx+rvy*ty)/td,-j*C.friction,j*C.friction);
   const ix=j*nx+jt*tx,iy=j*ny+jt*ty;
   a.vx-=ix*a.inv;a.vy-=iy*a.inv;a.omega-=cross(raX,raY,ix,iy)*a.inertia;
   if(b){b.vx+=ix*b.inv;b.vy+=iy*b.inv;b.omega+=cross(rbX,rbY,ix,iy)*b.inertia;}
   if(bounce&&vn<-120)this.events.push({type:'hit',x:h.x,y:h.y,power:Math.min(1,-vn/700)});
  }
  a.touch=true;if(b)b.touch=true;
 }
 walls(b,bounce){let best=[null,null,null];
  for(const p of this.parts(b)){
   let hs=[{depth:C.wall-(p.x-p.r),nx:-1,ny:0,x:p.x-p.r,y:p.y},{depth:p.x+p.r-(C.width-C.wall),nx:1,ny:0,x:p.x+p.r,y:p.y},{depth:p.y+p.r-C.floor,nx:0,ny:1,x:p.x,y:p.y+p.r}];
   hs.forEach((h,i)=>{if(h.depth>0&&(!best[i]||h.depth>best[i].depth))best[i]=h;});
  }
  best.forEach(h=>{if(h){this.resolve(b,null,h,bounce);if(h.ny===1)b.landed=true;}});
 }
 merge(a,b){if(a.dead||b.dead)return;a.dead=b.dead=true;
  const level=a.level,points=C.organs[level].points;this.score+=points;this.merges++;
  this.chain=this.time-this.lastMerge<1?this.chain+1:1;this.lastMerge=this.time;
  let x=(a.x+b.x)*.5,y=(a.y+b.y)*.5;
  if(level<10){let c=this.add(level+1,x,y,{vx:(a.vx+b.vx)*.25,vy:Math.min(0,(a.vy+b.vy)*.2),angle:(a.angle+b.angle)*.5,omega:(a.omega+b.omega)*.15,landed:a.landed||b.landed});this.keepInside(c);}
  this.events.push({type:'merge',x,y,level,points,chain:this.chain});
 }
 step(dt=C.step){if(this.over)return;this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.contacts=[];
  for(const b of this.bodies){b.age+=dt;b.touch=false;b.vy+=C.gravity*dt;b.vx*=Math.exp(-.16*dt);b.omega*=Math.exp(-1.1*dt);b.vx=clamp(b.vx,-1100,1100);b.vy=clamp(b.vy,-1300,1400);b.omega=clamp(b.omega,-10,10);b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.omega*dt;}
  const used=new Set(),queue=[];
  // Snapshot pairing prevents any body being consumed twice in a substep.
  for(let i=0;i<this.bodies.length;i++){let a=this.bodies[i];if(used.has(a.id))continue;for(let j=i+1;j<this.bodies.length;j++){let b=this.bodies[j];if(a.level!==b.level||used.has(b.id)||Math.min(a.age,b.age)<.075)continue;let h=this.contact(a,b,.65);if(h){queue.push([a,b]);used.add(a.id);used.add(b.id);break;}}}
  queue.forEach(([a,b])=>this.merge(a,b));this.bodies=this.bodies.filter(b=>!b.dead);
  for(let it=0;it<C.iterations;it++){
   for(const b of this.bodies)this.walls(b,it===0);
   for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++){
    const a=this.bodies[i],b=this.bodies[j],h=this.contact(a,b);
    if(!h)continue;
    if(it===0)this.contacts.push({x:h.x,y:h.y});
    this.resolve(a,b,h,it===0);
    if(a.landed||b.landed||h.y>C.dangerY){a.landed=true;b.landed=true;}
   }
  }
  for(const b of this.bodies){
   // Small velocities naturally settle through friction; conservative freezing
   // avoids retaining numerical angular chatter in a resting compound shape.
   if(b.touch&&Math.hypot(b.vx,b.vy)<4&&Math.abs(b.omega)<.045){b.vx=0;b.vy=0;b.omega=0;}
   let top=this.bounds(b).top;
   let stable=b.landed&&b.touch&&b.age>.8&&Math.hypot(b.vx,b.vy)+Math.abs(b.omega)*b.bound<C.restSpeed;
   b.danger=Math.max(0,b.danger+(top<C.dangerY&&stable?dt:-dt*2));
   if(b.danger>=C.dangerSeconds){this.over=true;this.events.push({type:'over',score:this.score});}
  }
 }
}
G.OrganWorld=World;
})(globalThis);
