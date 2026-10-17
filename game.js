(function(){
'use strict';
const C=ORGAN_CONFIG,$=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');
const world=new OrganWorld(),images=[],particles=[],texts=[];let ready=false,playing=false,paused=false,aim=240,acc=0,last=0,muted=true,audio=null,lastHit=0,activePointer=null;
let debug=new URLSearchParams(location.search).has('debug');
function sound(kind,power=1){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();if(kind==='hit'&&audio.currentTime-lastHit<.09)return;if(kind==='hit')lastHit=audio.currentTime;
 const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;let f={drop:270,hit:145,merge:530,chain:790,over:190}[kind]||440;
 o.type=kind==='hit'?'sine':'triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(kind==='over'?70:f*1.6,t+.15);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045*Math.max(.2,power),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.19);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.21);
 }catch{muted=true;updateSound();}}
function updateSound(){$('#sound').textContent='声音 '+(muted?'关':'开');$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').setAttribute('aria-label',muted?'开启声音':'关闭声音');}
function ui(){$('#score').textContent=world.score;$('#next').src=images[world.next]?.src||`./assets/${String(world.next+1).padStart(2,'0')}.webp`;$('#next').alt='下一个：'+C.organs[world.next].name;$('#next-name').textContent=C.organs[world.next].name;}
function reset(){world.reset();particles.length=texts.length=0;acc=0;activePointer=null;paused=false;playing=true;aim=240;$('#start-screen').classList.add('hidden');$('#end-screen').classList.add('hidden');$('#confirm-screen').classList.add('hidden');$('#board').classList.remove('danger-active');$('#status').textContent='移动瞄准 · 松手投放';ui();canvas.focus({preventScroll:true});}
function end(){$('#final-score').textContent=world.score;$('#rank').textContent=C.rewards.filter(r=>world.score>=r.min).at(-1).name;$('#end-screen').classList.remove('hidden');$('#status').textContent='研究完成 · 请向工作人员展示分数';$('#again').focus({preventScroll:true});sound('over');}
function drop(){if(!playing||paused||!ready||world.over)return false;const b=world.drop(aim);if(b){sound('drop');ui();return true;}return false;}
function point(e){const r=canvas.getBoundingClientRect();aim=Math.max(45,Math.min(C.width-45,(e.clientX-r.left)*C.width/r.width));}
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.pointerId===activePointer)point(e);});
canvas.addEventListener('pointerdown',e=>{if(!playing||paused||world.over||activePointer!==null||!e.isPrimary||e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});activePointer=e.pointerId;point(e);canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',e=>{if(e.pointerId!==activePointer)return;e.preventDefault();point(e);activePointer=null;drop();});
canvas.addEventListener('pointercancel',e=>{if(e.pointerId===activePointer)activePointer=null;});canvas.addEventListener('lostpointercapture',e=>{if(e.pointerId===activePointer)activePointer=null;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(!playing||paused||world.over||!['ArrowLeft','ArrowRight',' '].includes(e.key)||e.target.tagName==='BUTTON')return;e.preventDefault();if(e.key==='ArrowLeft')aim=Math.max(45,aim-12);if(e.key==='ArrowRight')aim=Math.min(C.width-45,aim+12);if(e.key===' '&&!e.repeat)drop();});
$('#start').onclick=()=>{if(ready)reset();};$('#again').onclick=reset;
$('#restart').onclick=()=>{if(!playing||world.over)return;paused=true;activePointer=null;$('#confirm-screen').classList.remove('hidden');$('#cancel-restart').focus();};
$('#cancel-restart').onclick=()=>{paused=false;$('#confirm-screen').classList.add('hidden');canvas.focus({preventScroll:true});};$('#confirm-restart').onclick=reset;
$('#sound').onclick=()=>{muted=!muted;updateSound();if(!muted)sound('merge');};
document.addEventListener('visibilitychange',()=>{acc=0;last=0;activePointer=null;if(document.hidden&&audio)audio.suspend();});
for(let i=0;i<11;i++){const li=document.createElement('li');li.innerHTML=`<span class="number">${String(i+1).padStart(2,'0')}</span><img src="./assets/${String(i+1).padStart(2,'0')}.webp" alt=""><b>${C.organs[i].name}</b>`;$('#catalog').append(li);}
function sprite(level,x,y,r,angle=0,alpha=1){const im=images[level];if(!im)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(im,-r,-r,r*2,r*2);ctx.restore();}
function events(){for(const e of world.events){if(e.type==='merge'){sound(e.chain>1?'chain':'merge');const col=C.organs[e.level].color;for(let i=0;i<Math.min(16,100-particles.length);i++){const a=Math.random()*Math.PI*2,sp=50+Math.random()*130;particles.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-40,t:.6,color:col});}texts.push({x:e.x,y:e.y,t:1.1,text:`+${e.points}${e.chain>1?' · 连锁 ×'+e.chain:''}`});ui();}if(e.type==='hit')sound('hit',e.power);if(e.type==='over')end();}world.events.length=0;}
function draw(dt=0){
 ctx.clearRect(0,0,C.width,C.height);ctx.fillStyle='#fffdf5';ctx.fillRect(0,0,C.width,C.height);
 ctx.fillStyle='#e1e7d555';for(let x=30;x<C.width;x+=28)for(let y=38;y<C.height;y+=28){ctx.beginPath();ctx.arc(x,y,.8,0,Math.PI*2);ctx.fill();}
 const danger=world.bodies.some(b=>b.danger>.1);$('#board').classList.toggle('danger-active',danger);
 ctx.strokeStyle=danger?'#ce8a7e':'#d9b3a4';ctx.lineWidth=1.5;ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(15,C.dangerY);ctx.lineTo(C.width-15,C.dangerY);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#dfE8d7';ctx.fillRect(0,C.floor,C.width,C.height-C.floor);
 if(playing&&!world.over){let fake={level:world.current,r:C.organs[world.current].radius,angle:0,x:aim,y:62};world.keepInside(fake);
  ctx.strokeStyle='#a8beaa88';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(fake.x,90);ctx.lineTo(fake.x,C.floor-4);ctx.stroke();ctx.setLineDash([]);sprite(world.current,fake.x,62,fake.r,0,world.cooldown>0?.35:.85);ctx.fillStyle='#91a98c';ctx.beginPath();ctx.moveTo(fake.x-4,103);ctx.lineTo(fake.x+4,103);ctx.lineTo(fake.x,109);ctx.fill();
 }
 for(const b of world.bodies){sprite(b.level,b.x,b.y,b.r,b.angle);
  if(debug){ctx.lineWidth=.8;for(const p of world.parts(b)){ctx.strokeStyle='#218a69bb';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();}ctx.strokeStyle='#c6a35f';ctx.beginPath();ctx.arc(b.x,b.y,b.bound,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#53466c';ctx.fillRect(b.x-2,b.y-2,4,4);
   const co=Math.cos(b.angle),si=Math.sin(b.angle);ctx.fillStyle='#e16b72';for(const p of outline[b.level]||[]){const x=p[0]*b.r,y=p[1]*b.r;ctx.fillRect(b.x+x*co-y*si,b.y+x*si+y*co,1,1);}}
 }
 if(debug){ctx.fillStyle='#ef9348';for(const h of world.contacts){ctx.beginPath();ctx.arc(h.x,h.y,3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#456858';ctx.font='11px monospace';ctx.fillText(`DEBUG | ${world.bodies.length} bodies | ${world.merges} merges`,20,688);}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;if(p.t<=0){particles.splice(i,1);continue;}ctx.globalAlpha=p.t/.6;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 ctx.textAlign='center';ctx.font='bold 20px system-ui';for(let i=texts.length-1;i>=0;i--){let t=texts[i];t.t-=dt;t.y-=28*dt;if(t.t<0){texts.splice(i,1);continue;}ctx.globalAlpha=Math.min(1,t.t*2);ctx.fillStyle='#497d68';ctx.strokeStyle='#fffdf5';ctx.lineWidth=4;ctx.strokeText(t.text,t.x,t.y);ctx.fillText(t.text,t.x,t.y);}ctx.globalAlpha=1;ctx.textAlign='start';
}
let outline=[];
function resize(){let d=Math.min(2.5,devicePixelRatio||1);canvas.width=Math.round(C.width*d);canvas.height=Math.round(C.height*d);ctx.setTransform(d,0,0,d,0,0);draw();}window.addEventListener('resize',resize);
function loop(now){let dt=last?Math.min(.05,(now-last)/1000):0;last=now;
 if(!document.hidden&&playing&&!paused&&!world.over){acc+=dt;while(acc>=C.step){world.step();acc-=C.step;}events();}else acc=0;
 draw(paused||document.hidden?0:dt);requestAnimationFrame(loop);
}
$('#start').disabled=true;$('#start').textContent='正在准备器官…';
Promise.all(C.organs.map((o,i)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[i]=im;if(debug)outline[i]=ORGAN_SHAPES[i].outline||[];resolve();};im.onerror=reject;im.src=`./assets/${String(i+1).padStart(2,'0')}.webp`;}))).then(()=>{ready=true;$('#start').disabled=false;$('#start').innerHTML='开始研究 <span>→</span>';ui();resize();}).catch(()=>{$('#start').textContent='素材加载失败，请刷新';$('#status').textContent='请检查发布包 assets 文件夹是否完整';});
resize();requestAnimationFrame(loop);
// Explicit opt-in developer interface; never available in the normal game URL.
if(debug)window.__ORGAN__={world,reset,drop,draw,images,set debug(v){debug=!!v;},get playing(){return playing;},get muted(){return muted;},get particles(){return particles;},get texts(){return texts;},get aim(){return aim;},set aim(v){aim=v;},advance(seconds){for(let t=0;t<seconds;t+=C.step){world.step();events();}draw();},end};
})();

