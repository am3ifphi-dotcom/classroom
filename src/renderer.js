import {WALL_ART} from './wall-art.js';
import {W,H,rooms,props,points,getRoom} from './world.js';
const files=import.meta.glob('../assets/**/*.{png,ogg,mp3}',{eager:true,query:'?url',import:'default'});
export function asset(path){return files['../assets/'+path]||('/assets/'+path);}
export const images={};
export async function loadImages(onProgress){
 const paths={monster:'monsters/correction-walk.png',monsterCast:'monsters/correction-cast.png',school:'tiles/school.png',wood:'tiles/wood.png',tile:'tiles/tile.png',walls:'tiles/walls.png',plant:'tiles/plants.png',vending:'tiles/vending.png',shelf:'tiles/shelf.png',clock:'tiles/clock.png',office:'tiles/desk.png',copier:'tiles/copier.png',magic:'effects/magic_01.png',magic3:'effects/magic_03.png',spark:'effects/spark_01.png',light:'effects/light_01.png',smoke:'effects/smoke_03.png',star:'effects/star_01.png'};
 for(const n of ['mie','ryoma','rei','satou','terachi']){paths[n]='characters/'+n+'.png';paths[n+'Cast']='characters/'+n+'-cast.png';}
 let done=0;await Promise.all(Object.entries(paths).map(([key,p])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[key]=img;onProgress(++done,Object.keys(paths).length);resolve();};img.onerror=()=>reject(new Error(p));img.src=asset(p);})));}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function text(c,str,x,y,size=12,color='#eee7c8',align='center'){c.font=`${size}px "Zen Kaku Gothic New",sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);}
function spr(c,img,sx,sy,sw,sh,x,y,w=sw,h=sh){c.drawImage(images[img],sx,sy,sw,sh,Math.round(x),Math.round(y),w,h);}
function shadow(c,x,y,w,h){c.fillStyle='#0c191b38';c.beginPath();c.ellipse(x+w/2,y,w*.52,h,0,0,Math.PI*2);c.fill();}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.cam={x:560,y:335};this.scale=1;this.w=0;this.h=0;this.particles=[];this.floaters=[];this.shake=0;this.static=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.build();this.resize();}
 resize(){this.w=innerWidth;this.h=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);this.dpr=dpr;this.scale=Math.max(.85,Math.min(this.w/950,this.h/640,2.1));if(this.w<700)this.scale=Math.max(1,this.h/780);this.ctx.imageSmoothingEnabled=false;}
 build(){this.static=document.createElement('canvas');this.static.width=W;this.static.height=H;const c=this.static.getContext('2d');c.imageSmoothingEnabled=false;
  rect(c,0,0,W,H,'#25302f');for(let x=0;x<W;x+=32)for(let y=0;y<H;y+=32){spr(c,'tile',64,96,32,32,x,y);}
  for(const r of rooms){for(let x=r.x;x<r.x+r.w;x+=32)for(let y=r.y;y<r.y+r.h;y+=32){if(r.floor==='wood')spr(c,'wood',96,32+(((x+y)/32)%2)*32,32,32,x,y);else spr(c,'tile',32,64,32,32,x,y);}
   // Pale painted plaster and layered skirting, sourced from LPC Revised.
   if(r.id!=='hall')for(let x=r.x;x<r.x+r.w;x+=32){spr(c,'walls',288+(x%3)*0,128,32,96,x,r.y+10,32,96);}
   rect(c,r.x,r.y,r.w,10,'#263b37');rect(c,r.x,r.y+10,r.w,3,'#829086');
   if(r.id!=='hall'){rect(c,r.x,r.y+104,r.w,7,'#596152');rect(c,r.x,r.y+110,r.w,4,'#343b31');rect(c,r.x,r.y+114,r.w,22,'#25282430');}
   rect(c,r.x,r.y,8,r.h,'#34483e');rect(c,r.x+r.w-8,r.y,8,r.h,'#34483e');
   // Floor edge and long wall shadows.
   const sh=c.createLinearGradient(r.x,r.y,r.x+80,r.y);sh.addColorStop(0,'#132d2566');sh.addColorStop(1,'#132d2500');rect(c,r.x,r.y+115,80,r.h-115,sh);
   rect(c,r.x+r.w-16,r.y+110,12,r.h-110,'#16291f55');
  }
  // Open thresholds connect every room; a visual change of floor, not a loading screen.
  for(const [x,y,w] of [[664,690,128],[1224,690,136],[304,914,136],[1224,914,136]]){for(let xx=x;xx<x+w;xx+=32)for(let yy=y;yy<y+132;yy+=32)spr(c,'tile',32,64,32,32,xx,yy);rect(c,x,y,w,4,'#adac8980');rect(c,x,y+12,w,3,'#303f39');}
  for(const [x,y,w] of [[64,686,600],[792,686,168],[1024,686,200],[1360,686,336],[64,910,240],[440,910,784],[1360,910,336]]){rect(c,x,y,w,18,'#2f4139');rect(c,x,y,w,3,'#8d9882');rect(c,x,y+18,w,13,'#12282044');}
  for(const r of rooms){if(r.id==='hall')continue;rect(c,r.x,r.y+r.h-7,r.w,7,'#364637');}
  // Door openings over front walls.
  for(const [x,y,w] of [[664,686,128],[1224,686,136],[304,910,136],[1224,910,136]]){for(let xx=x;xx<x+w;xx+=32)spr(c,'tile',32,64,32,32,xx,y);rect(c,x,y+17,w,2,'#b3a786');}
  // Directional markings, room plaques and chalk-like floor signage.
  text(c,'← 2年B組',736,761,11,'#d8d5b3');text(c,'地理準備室 →',1263,761,11,'#d8d5b3');
  text(c,'北　棟　／　2 F',808,873,13,'#bac4ab');text(c,'放送準備室',1300,1025,12,'#e3e2c7');
  for(const p of props.filter(p=>['window','board','chart','notice','clocksmall','exit'].includes(p.type)))this.drawProp(c,p,true);
  // Scattered dust, worn varnish, subtle joints; decorative only, no homemade sprites.
  let seed=1923;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  for(let i=0;i<650;i++){let x=80+rand()*1600,y=180+rand()*1090;rect(c,x,y,1+rand()*2,1,'#eee7c00c');}
 }
 drawProp(c,p){const {x,y,type}=p;
  if(type==='desk'){shadow(c,x+4,y+5,66,9);spr(c,'school',0,258,48,54,x,y-49,64,62);if(p.book)spr(c,'school',248,540,31,30,x+17,y-40,23,22);}
  if(type==='chair'){shadow(c,x,y+2,28,5);spr(c,'school',7,430,34,51,x-2,y-38,34,51);}
  if(type==='teacher'){shadow(c,x,y,135,10);spr(c,'office',64,0,64,64,x,y-64,128,84);spr(c,'school',290,541,34,32,x+36,y-37,28,24);}
  if(type==='board'){const art=WALL_ART.board;spr(c,'school',102,197,85,44,x,y+art.offsetY,art.width,art.height);rect(c,x+8,y-83,242,80,'#183f39ef');rect(c,x+10,y-4,238,5,'#b6af79');text(c,'日直　両馬 ・ 三重',x+205,y-62,8,'#c1d0b388');text(c,'金曜日　放課後',x+73,y-56,11,'#d0d8bfaa');}
  if(type==='chart'){spr(c,'school',110,114,115,56,x,y-65,130,64);}
  if(type==='window'){const art=WALL_ART.window;spr(c,'school',143,17,97,56,x,y+art.offsetY,art.width,art.height);c.save();c.globalCompositeOperation='source-atop';rect(c,x+5,y-60,85,49,'#f6c78730');c.restore();rect(c,x+2,y+1,96,4,'#6b7161');}
  if(type==='plant'){shadow(c,x,y,35,8);spr(c,'plant',0,0,32,96,x-8,y-91,48,114);}
  if(type==='cabinet'){shadow(c,x,y,67,8);spr(c,'school',239,141,98,75,x,y-94,76,106);}
  if(type==='bookshelf'){shadow(c,x,y,75,10);spr(c,'school',239,35,98,82,x,y-101,80,111);}
  if(type==='shelf'){spr(c,'school',241,260,94,51,x,y-46,88,54);}
  if(type==='worktable'){shadow(c,x,y+3,208,16);spr(c,'office',0,0,128,64,x,y-73,208,89);}
  if(type==='papers'){spr(c,'school',290,541,37,33,x,y-23,38,29);}
  if(type==='books'){spr(c,'school',0,536,46,40,x,y-35,50,43);}
  if(type==='bag'){spr(c,'school',50,491,39,33,x,y-24,35,30);}
  if(type==='clock'){spr(c,'clock',0,0,32,96,x,y-111,42,126);}
  if(type==='copier'){shadow(c,x,y,78,9);spr(c,'copier',0,0,64,64,x,y-63,83,83);}
  if(type==='vending'){shadow(c,x,y+6,107,11);spr(c,'vending',0,0,96,80,x,y-115,122,131);rect(c,x+12,y-85,24,38,'#ead2841a');text(c,'あたたかい',x+34,y-24,7,'#e4d497');}
  if(type==='bench'){spr(c,'school',0,358,142,58,x,y-46,142,58);}
  if(type==='notice'){rect(c,x,y-62,93,61,'#574f3b');rect(c,x+3,y-59,87,54,'#869986');for(let i=0;i<4;i++){rect(c,x+8+i*19,y-54,15,36,i%2?'#ddd1b8':'#b9ccbd');for(let j=0;j<5;j++)rect(c,x+10+i*19,y-49+j*4,10,1,'#7e8270');}text(c,'下 校 時 刻',x+47,y-9,7,'#2a4d44');}
  if(type==='clocksmall'){c.fillStyle='#28483c';c.beginPath();c.arc(x,y,16,0,Math.PI*2);c.fill();c.fillStyle='#d7d5b1';c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.fill();rect(c,x-1,y-8,2,10,'#334937');rect(c,x,y-1,8,2,'#334937');}
  if(type==='monitor'){spr(c,'school',287,494,49,36,x,y-40,68,50);rect(c,x+5,y-30,42,22,'#a093d63b');}
  if(type==='radio'){spr(c,'school',98,487,44,43,x,y-40,50,48);}
  if(type==='exit'){rect(c,x,y-70,92,80,'#405d55');rect(c,x+4,y-66,84,72,'#64776c');for(let i=0;i<2;i++){rect(c,x+10+i*42,y-61,32,44,'#a5b8a466');rect(c,x+35+i*12,y-7,3,3,'#e8d69b');}rect(c,x+16,y-88,59,12,'#314b3d');text(c,'下校口',x+46,y-79,8,'#c9ddac');}
 }
 character(c,n,x,y,dir=2,frame=0,alpha=1,cast=false){
  c.save();c.globalAlpha=alpha;shadow(c,x-14,y,28,5);
  // Source sheets have finer head pixels; retain the original world footprint.
  const key=cast?n+'Cast':n,cell=images[key].height/4,index=frame%(cast?7:9);
  spr(c,key,index*cell,dir*cell,cell,cell,x-32,y-57,64,64);c.restore();
 }
 light(c,x,y,r,col,alpha=.25){c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'transparent');c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
 burst(x,y,color='#d9beec',n=30){if(this.reduced)n=8;for(let i=0;i<n;i++){let angle=Math.random()*Math.PI*2,speed=25+Math.random()*65;this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-15,life:.6+Math.random(),max:1.6,size:5+Math.random()*13,color});}}
 float(text,x,y,color='#eee3b7'){this.floaters.push({text,x,y,color,life:1.5});}
 screenToWorld(x,y){return {x:(x-this.w/2)/this.scale+this.cam.x,y:(y-this.h/2)/this.scale+this.cam.y};}
 update(dt,s,mode){if(mode==='explore'||mode==='dialogue'){const f=1-Math.exp(-dt*4);this.cam.x+=(s.x+35-this.cam.x)*f;this.cam.y+=(s.y-75-this.cam.y)*f;}
 const hx=this.w/(this.scale*2),hy=this.h/(this.scale*2);this.cam.x=Math.max(hx,Math.min(W-hx,this.cam.x));this.cam.y=Math.max(hy,Math.min(H-hy,this.cam.y));
 for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);for(const p of this.floaters){p.y-=dt*20;p.life-=dt;}this.floaters=this.floaters.filter(p=>p.life>0);this.shake=Math.max(0,this.shake-dt*10);
 }
 draw(time,s,actors,mode,combat){this.combat=combat;const c=this.ctx;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#23352f';c.fillRect(0,0,this.w,this.h);c.save();c.translate(Math.round(this.w/2-this.cam.x*this.scale),Math.round(this.h/2-this.cam.y*this.scale));c.scale(this.scale,this.scale);if(this.shake&&!this.reduced)c.translate(Math.sin(time*65)*this.shake,Math.cos(time*72)*this.shake*.5);c.drawImage(this.static,0,0);
 if(s.thresholdChecked){
  if(s.ending)text(c,'また、月曜日。',468,126,15,'#d5dec9');
  else {text(c,'七限目：今日の放課後の意味を答えよ',468,116,9,'#e0d3ea');if(s.anomalyAwakened||this.ruleVisible)text(c,'答えのない時間は、消去します',468,130,8,'#e8b9bc');}
  if(s.anomalyAwakened){for(let i=0;i<3;i++){c.strokeStyle='#e0d5bc';c.lineWidth=1;c.strokeRect(442+i*18,136,10,7);if(i<s.fragments.length)rect(c,444+i*18,138,6,3,'#f1dfb7');}}
 }

 this.drawGuidance(c,time);this.drawWarnings(c,combat,s);
 const renderables=[];for(const p of props)if(!['window','board','chart','notice','clocksmall','exit'].includes(p.type))renderables.push({y:p.y,draw:()=>this.drawProp(c,p)});
 for(const a of actors)renderables.push({y:a.y,draw:()=>this.character(c,a.id,a.x,a.y,a.dir,a.frame||0)});
 for(const e of combat.enemies)if(combat.visible(e,s))renderables.push({y:e.y,draw:()=>this.monster(c,e,time)});
 renderables.push({y:s.y,draw:()=>{this.character(c,'mie',s.x,s.y,s.dir,combat.player.swing>0?Math.floor(time*18)%7:s.frame||0,combat.player.invulnerable>0&&Math.floor(time*20)%2?.55:1,combat.player.swing>0);if((s.anomalyAwakened||this.eraserShown)&&(combat.player.swing>0||mode==='dialogue')){const dx=[-10,-13,12,13][s.dir],yy=s.y-(combat.player.swing>0?28:14);rect(c,s.x+dx-4,yy,9,4,'#383e48');rect(c,s.x+dx-4,yy-2,9,3,'#a48b62');}if(mode==='explore'){c.fillStyle='#d8e4b85c';c.beginPath();c.ellipse(s.x,s.y+3,18,5,0,0,Math.PI*2);c.strokeStyle='#dbe7b452';c.lineWidth=1;c.stroke();}}});
 renderables.sort((a,b)=>a.y-b.y);renderables.forEach(r=>r.draw());
 // Evening light shafts from the existing windows, clipped to each room.
 c.save();c.globalCompositeOperation='screen';for(const p of props.filter(p=>p.type==='window')){
  const room=getRoom(p.x,p.y+70);c.save();c.beginPath();c.rect(room.x+8,room.y+110,room.w-16,room.h-118);c.clip();
  const g=c.createLinearGradient(p.x,p.y,p.x+170,p.y+410);g.addColorStop(0,'#ffd79760');g.addColorStop(.5,'#ecb36b20');g.addColorStop(1,'#eab46800');c.fillStyle=g;
  c.beginPath();c.moveTo(p.x+5,p.y);c.lineTo(p.x+88,p.y);c.lineTo(p.x+350,p.y+450);c.lineTo(p.x+140,p.y+450);c.closePath();c.fill();
  for(let k=0;k<3;k++){c.fillStyle='#cfad7820';c.beginPath();c.moveTo(p.x+6+k*29,p.y);c.lineTo(p.x+10+k*29,p.y);c.lineTo(p.x+164+k*60,p.y+440);c.lineTo(p.x+151+k*60,p.y+440);c.closePath();c.fill();}c.restore();}
 c.restore();
 // A quiet color grade, followed by localized violet leakage.
 rect(c,0,0,W,H,'#ac714309');
 for(const p of points.filter(p=>p.type==='rift')){const done=s.fragments.includes(p.id),active=!done||p.id==='board'&&s.fragments.length===3&&!s.ending;if(!active||(!s.anomalyAwakened&&!(p.id==='board'&&s.thresholdChecked)))continue;
 const yy=p.y-(p.id==='board'?90:p.id==='vending'?72:85);this.light(c,p.x,yy,110,'#9b7ccb',.32+Math.sin(time*1.2)*.06);
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=.16+Math.sin(time*1.8)*.05;c.translate(p.x,yy);c.rotate(this.reduced?0:time*.12);c.drawImage(images.magic,-48,-48,96,96);c.restore();
 for(let i=0;i<9;i++){const t=time*.35+i*2.4,xx=p.x+Math.sin(t*1.3)*38,yyy=yy-((time*14+i*13)%95)+30;c.globalAlpha=.3+Math.sin(t)*.2;c.fillStyle='#e4c0f2';c.fillRect(Math.round(xx),Math.round(yyy),2,2);}c.globalAlpha=1;
 }
 // Dust is deterministic and bounded. No allocation per frame.
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<(this.reduced?20:85);i++){const x=(i*159.7+Math.sin(time*.2+i)*16)%W,y=(i*77.3-time*(2+i%3)+H*2)%H;c.globalAlpha=.13+(Math.sin(time+i)*.5+.5)*.32;c.fillStyle=i%3?'#f0d5a0':'#edead4';c.fillRect(Math.round(x),Math.round(y),i%5===0?2:1,1);}c.restore();
 if(mode==='explore'){
  for(const p of points){if(p.type==='npc'&&!(p.id==='ryoma'&&s.joined)){const a=actors.find(a=>a.id===p.id);if(!a)continue;const distance=Math.hypot(s.x-a.x,s.y-a.y);if(distance<130){c.fillStyle='#142920cd';c.fillRect(a.x-29,a.y-78,58,17);text(c,p.name.split(' ')[0],a.x,a.y-66,9,'#e5dfbf');}else if(!s.talked.includes(p.id)){text(c,'…',a.x,a.y-64+Math.sin(time*2)*2,15,'#dfd5a1');}}
   if(p.type==='rift'&&!s.fragments.includes(p.id)&&(s.anomalyAwakened||p.id==='board'&&s.thresholdChecked)){const bob=this.reduced?0:Math.sin(time*2.5)*3;const yy=p.y-45; c.save();c.translate(p.x,yy+bob);c.rotate(Math.PI/4);c.strokeStyle='#f0d2ed';c.fillStyle='#67466b';c.fillRect(-3,-3,6,6);c.strokeRect(-3,-3,6,6);c.restore();}
  }
 }
 this.drawCombatEffects(c,combat,time);
 for(const p of this.particles){c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(1,p.life/.4);c.drawImage(images.spark,p.x-p.size/2,p.y-p.size/2,p.size,p.size);c.restore();}
 for(const p of this.floaters){c.globalAlpha=Math.min(1,p.life*2);text(c,p.text,p.x,p.y,16,p.color);c.globalAlpha=1;}
 c.restore();
 }
 drawGuidance(c,time){
  const g=this.guide;if(!g?.visible||!g.target)return;c.save();
  c.fillStyle='#e3cf8c';c.globalAlpha=.6;
  for(let i=0;i<g.path.length;i++){const p=g.path[i];if(i%2)continue;c.beginPath();c.arc(p.x,p.y,2.2,0,Math.PI*2);c.fill();}
  const t=g.target,bob=this.reduced?0:Math.sin(time*3)*3;c.globalAlpha=.95;c.strokeStyle='#f5df99';c.lineWidth=1.5;
  c.beginPath();c.ellipse(t.x,t.y,23,8,0,0,Math.PI*2);c.stroke();
  c.beginPath();c.moveTo(t.x-6,t.y-80+bob);c.lineTo(t.x,t.y-73+bob);c.lineTo(t.x+6,t.y-80+bob);c.stroke();c.restore();
 }
 drawWarnings(c,combat,s){
  for(const e of combat.enemies){if(!combat.visible(e,s)||e.phase!=='windup')continue;
   c.save();const progress=1-Math.max(0,e.timer)/e.duration;c.lineWidth=2;c.strokeStyle='#ffd0a0';c.fillStyle='#e4636942';
   if(e.attack==='slam'){
    c.beginPath();c.arc(e.target.x,e.target.y,e.radius,0,Math.PI*2);c.fill();c.setLineDash([5,4]);c.stroke();c.setLineDash([]);
    c.lineWidth=3;c.strokeStyle='#ff976f';c.beginPath();c.arc(e.target.x,e.target.y,e.radius,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);c.stroke();
    text(c,'!',e.target.x,e.target.y+5,16,'#ffe4c4');
   }else{
    const angle=Math.atan2(e.target.y-e.y,e.target.x-e.x);
    for(const offset of e.kind==='boss'?[-.3,0,.3]:[0]){c.strokeStyle='#dd596c35';c.lineWidth=24;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+Math.cos(angle+offset)*260,e.y+Math.sin(angle+offset)*260);c.stroke();c.strokeStyle='#fbbb95';c.lineWidth=1;c.setLineDash([7,6]);c.stroke();c.setLineDash([]);}
    text(c,'!',e.x,e.y-69,15,'#ffd6a6');
   }c.restore();
  }
 }
 monster(c,e,time){
  const scale=e.quest==='final'?1.7:e.quest?1.35:1.05,size=64*scale;
  c.save();c.globalAlpha=e.hit>0?.8:1;
  shadow(c,e.x-15*scale,e.y,30*scale,5*scale);
  const casting=e.phase==='windup',frame=casting?Math.min(6,Math.floor((1-e.timer/e.duration)*7)):1+Math.floor(time*7+e.homeX)%8;
  const bob=e.kind==='caster'?Math.sin(time*3+e.homeX)*2:0;
  spr(c,casting?'monsterCast':'monster',frame*64,e.dir*64,64,64,e.x-size/2,e.y-size*.89+bob,size,size);
  if(e.quest){c.globalCompositeOperation='screen';c.globalAlpha=.2;c.drawImage(images.magic,e.x-size/2,e.y-size*.8,size,size);}
  c.restore();
  if(e.active){rect(c,e.x-16,e.y-size*.89-7,32,3,'#18252b');rect(c,e.x-16,e.y-size*.89-7,32*e.hp/e.max,3,e.quest?'#dca7e3':e.kind==='caster'?'#9abbe4':'#c6c997');}
 }
 drawCombatEffects(c,combat,time){
  for(const p of combat.projectiles){this.light(c,p.x,p.y-18,24,'#bd9ae7',.4);c.save();c.globalCompositeOperation='screen';c.drawImage(images.spark,p.x-11,p.y-29,22,22);c.restore();}
  for(const e of combat.effects){const t=1-e.life/e.max;c.save();c.globalAlpha=1-t;
   if(e.kind==='slash'){
    c.translate(e.x,e.y);c.rotate(e.angle);c.strokeStyle='#f5e6c2';c.lineWidth=4*(1-t)+1;c.beginPath();c.arc(0,0,44+t*15,-1.15,1.15);c.stroke();c.strokeStyle='#afaddb';c.lineWidth=2;c.beginPath();c.arc(0,0,35+t*18,-.9,1);c.stroke();
   }else if(e.kind==='pulse'){
    const r=30+t*120;c.globalCompositeOperation='screen';c.drawImage(images.magic3,e.x-r,e.y-r,r*2,r*2);c.strokeStyle='#d1bfed';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y+16,r,0,Math.PI*2);c.stroke();
   }else{const r=e.radius||35;c.globalCompositeOperation='screen';c.drawImage(images.smoke,e.x-r,e.y-r,r*2,r*2);}
   c.restore();
  }
 }
 minimap(canvas,s,large=false){const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,scale=Math.min((w-14)/W,(h-10)/H);c.clearRect(0,0,w,h);c.save();c.translate((w-W*scale)/2,(h-H*scale)/2);c.scale(scale,scale);const active=getRoom(s.x,s.y).id;
 for(const r of rooms){rect(c,r.x,r.y,r.w,r.h,r.id===active?'#8f987750':'#6e8e7838');c.strokeStyle=r.id===active?'#e4d5a8':'#9bbda270';c.lineWidth=large?8:10;c.strokeRect(r.x,r.y,r.w,r.h);if(large)text(c,r.name,r.x+r.w/2,r.y+r.h/2,42,'#cddabf');}
 for(const p of points.filter(p=>p.type==='rift'&&!s.fragments.includes(p.id)&&(s.anomalyAwakened||p.id==='board'&&s.thresholdChecked))){c.save();c.translate(p.x,p.y);c.rotate(Math.PI/4);rect(c,-20,-20,40,40,'#d7a2e5');c.restore();}
 if(this.guide?.visible&&this.guide.target){c.strokeStyle='#ead294';c.lineWidth=large?6:12;c.beginPath();this.guide.path.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();const t=this.guide.target;rect(c,t.x-23,t.y-23,46,46,'#ffe3a0');}
 if(this.combat)for(const e of this.combat.enemies)if(this.combat.visible(e,s)&&e.active)rect(c,e.x-12,e.y-12,24,24,'#da8f92');
 this.light(c,s.x,s.y,90,'#f1efb1',.7);rect(c,s.x-19,s.y-19,38,38,'#f2edc7');c.restore();}
}
