import {walkable,findPath,maxHP} from './core.js';

export const MOB_SPAWNS=[
 [864,430,'stalker'],[350,650,'stalker'],[950,826,'stalker'],[1210,865,'caster'],
 [1565,868,'stalker'],[1450,320,'caster'],[460,1115,'stalker'],[1500,1200,'caster']
];
export const GUARDIANS={
 board:{x:615,y:210,hp:150,name:'正解の残響',kind:'stalker'},
 vending:{x:1450,y:869,hp:185,name:'不在の番人',kind:'caster'},
 broadcast:{x:1320,y:1235,hp:210,name:'視聴者ゼロの声',kind:'caster'},
 final:{x:615,y:210,hp:330,name:'存在しない七限目',kind:'boss'}
};
export const facing=dir=>[[0,-1],[-1,0],[0,1],[1,0]][dir]||[0,1];
export function clearLine(a,b,solids){
 const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8);
 for(let i=1;i<=n;i++)if(!walkable(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,solids))return false;
 return true;
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class ActionWorld{
 constructor(solids){this.solids=solids;this.reset({defeated:[]});}
 reset(s){
  this.enemies=MOB_SPAWNS.map(([x,y,kind],i)=>this.make('shade-'+i,x,y,kind,kind==='caster'?55:46,null));
  for(const [id,g] of Object.entries(GUARDIANS))this.enemies.push(this.make('guardian-'+id,g.x,g.y,g.kind,g.hp,id));
  for(const e of this.enemies)if(s.defeated?.includes(e.id))e.dead=true;
  this.events=[];this.projectiles=[];this.effects=[];this.time=0;
  this.player={attackCD:0,skillCD:0,dodgeCD:0,invulnerable:0,swing:0,angle:Math.PI/2,dash:0,dx:0,dy:1,healCD:0};
 }
 make(id,x,y,kind,hp,quest){return {id,x,y,homeX:x,homeY:y,kind,hp,max:hp,quest,active:!quest,dead:false,revealing:false,phase:'idle',timer:0,dir:2,frame:0,path:[],repath:0,travel:0,hit:0,turn:0};}
 visible(e,s){
  if(e.dead||s.ending)return false;
  if(e.quest){const available=e.quest==='final'?s.fragments.length===3:!s.fragments.includes(e.quest);return available&&(e.revealing||(s.anomalyAwakened&&e.active));}
  return s.anomalyAwakened&&s.fragments.includes('board');
 }
 reveal(id){const e=this.enemies.find(e=>e.quest===id);if(e&&!e.dead)e.revealing=true;}

 awaken(id){const e=this.enemies.find(e=>e.quest===id);if(!e||e.dead)return null;e.active=true;e.revealing=false;e.phase='chase';e.timer=.6;return e;}
 resetGuardian(id){const e=this.enemies.find(e=>e.quest===id);if(!e)return;Object.assign(e,{hp:e.max,x:e.homeX,y:e.homeY,active:false,revealing:false,phase:'idle',timer:0,path:[]});this.projectiles=this.projectiles.filter(p=>p.owner!==e.id);}
 move(actor,dx,dy,amount){const n=Math.max(1,Math.ceil(amount/4));for(let i=0;i<n;i++){const x=actor.x+dx*amount/n,y=actor.y+dy*amount/n;if(walkable(x,actor.y,this.solids))actor.x=x;if(walkable(actor.x,y,this.solids))actor.y=y;}}
 hurtEnemy(e,amount,s){e.hp=Math.max(0,e.hp-amount);e.hit=.16;this.events.push({type:'hit',x:e.x,y:e.y-35,amount});if(e.hp>0)return;e.dead=true;this.events.push({type:e.quest?'victory':'kill',id:e.quest||e.id,x:e.x,y:e.y});this.projectiles=this.projectiles.filter(p=>p.owner!==e.id);if(!e.quest){if(!s.defeated.includes(e.id))s.defeated.push(e.id);s.hp=Math.min(maxHP(s),s.hp+5);s.fp=Math.min(30,s.fp+6);}}
 trigger(action,s,aim){
  if(!s.anomalyAwakened||s.ending||s.hp<=0)return false;const p=this.player;
  if(action==='attack'){
   if(p.attackCD>0||p.dash>0)return false;p.attackCD=.38;p.swing=.23;
   const [fx,fy]=facing(s.dir);p.angle=aim?Math.atan2(aim.y-s.y,aim.x-s.x):Math.atan2(fy,fx);
   this.effects.push({kind:'slash',x:s.x,y:s.y-18,angle:p.angle,life:.23,max:.23});
   for(const e of this.enemies){if(!e.active||!this.visible(e,s)||distance(e,s)>68||!clearLine(s,e,this.solids))continue;const angle=Math.atan2(e.y-s.y,e.x-s.x);if(Math.cos(angle-p.angle)>.15||distance(e,s)<24)this.hurtEnemy(e,12+s.level*3,s);}
   this.events.push({type:'swing'});return true;
  }
  if(action==='skill'){
   if(p.skillCD>0||p.dash>0||s.fp<12)return false;s.fp-=12;p.skillCD=1.15;p.swing=.35;
   this.effects.push({kind:'pulse',x:s.x,y:s.y-16,life:.5,max:.5});
   for(const e of this.enemies)if(e.active&&this.visible(e,s)&&distance(e,s)<135&&clearLine(s,e,this.solids))this.hurtEnemy(e,26+s.level*4,s);
   this.events.push({type:'skill'});return true;
  }
  if(action==='dodge'){
   if(p.dodgeCD>0)return false;let [dx,dy]=aim&&Math.hypot(aim.x,aim.y)>.1?[aim.x,aim.y]:facing(s.dir);const l=Math.hypot(dx,dy);p.dx=dx/l;p.dy=dy/l;p.dash=.22;p.invulnerable=.3;p.dodgeCD=.8;this.events.push({type:'dodge'});return true;
  }
  if(action==='heal'){
   if(s.tea<=0||s.hp===maxHP(s)||p.healCD>0)return false;s.tea--;s.hp=Math.min(maxHP(s),s.hp+38);p.healCD=1;this.events.push({type:'heal'});return true;
  }
  return false;
 }
 hurtPlayer(amount,s){if(this.player.invulnerable>0||s.hp<=0)return false;s.hp=Math.max(0,s.hp-amount);this.player.invulnerable=.72;this.events.push({type:'damage',amount,x:s.x,y:s.y});if(s.hp===0)this.events.push({type:'defeat'});return true;}
 update(dt,s){
  dt=Math.max(0,Math.min(.05,dt));this.time+=dt;const p=this.player;
  for(const k of ['attackCD','skillCD','dodgeCD','invulnerable','swing','healCD'])p[k]=Math.max(0,p[k]-dt);
  if(p.dash>0){this.move(s,p.dx,p.dy,350*Math.min(dt,p.dash));p.dash=Math.max(0,p.dash-dt);}
  if(s.anomalyAwakened&&!s.ending)s.fp=Math.min(30,s.fp+dt*2.2);
  this.effects.forEach(e=>e.life-=dt);this.effects=this.effects.filter(e=>e.life>0);
  if(!s.anomalyAwakened||s.ending||s.hp<=0)return;
  for(const e of this.enemies){
   if(!this.visible(e,s)||!e.active)continue;e.hit=Math.max(0,e.hit-dt);e.timer-=dt;e.repath-=dt;
   const d=distance(e,s),fromHome=Math.hypot(s.x-e.homeX,s.y-e.homeY);
   if(e.quest&&fromHome>460){this.resetGuardian(e.quest);this.events.push({type:'retreat',id:e.quest});continue;}
   if(e.phase==='windup'){
    e.frame=0;if(e.timer>0)continue;
    if(e.attack==='bolt'){
     const angle=Math.atan2(e.target.y-e.y,e.target.x-e.x),spread=e.kind==='boss'?[-.3,0,.3]:[0];
     for(const offset of spread)this.projectiles.push({owner:e.id,x:e.x,y:e.y,vx:Math.cos(angle+offset)*145,vy:Math.sin(angle+offset)*145,life:3.2,power:e.quest?15:9});
    }else if(distance(s,e.target)<e.radius+9&&clearLine(e,s,this.solids))this.hurtPlayer(e.quest?17:10,s);
    this.effects.push({kind:'impact',x:e.target.x,y:e.target.y-8,radius:e.radius,life:.32,max:.32});e.phase='recover';e.timer=e.quest?.65:.85;e.turn++;continue;
   }
   if(e.phase==='recover'){e.frame=0;if(e.timer>0)continue;e.phase='chase';}
   const aggro=d<(e.quest?420:220)&&fromHome<430;
   const ranged=e.kind==='caster'||e.kind==='boss'&&e.turn%2===1;
   if(aggro&&d<(ranged?190:64)&&e.timer<=0&&clearLine(e,s,this.solids)){
    e.phase='windup';e.duration=e.quest?.92:.8;e.timer=e.duration;e.target={x:s.x,y:s.y};e.radius=e.kind==='boss'?68:39;e.attack=ranged?'bolt':'slam';continue;
   }
   let target;
   if(aggro){e.phase='chase';target=s;}
   else {e.phase='idle';target={x:e.homeX+Math.sin(this.time*.45+e.homeX)*25,y:e.homeY+Math.cos(this.time*.35+e.homeY)*18};}
   if(distance(e,target)<9){e.frame=0;continue;}
   if(e.repath<=0){e.path=findPath(e,target,this.solids);e.repath=.65+(e.homeX%7)*.03;}
   let goal=clearLine(e,target,this.solids)?target:e.path[0];
   if(!goal){e.frame=0;continue;}if(distance(e,goal)<7){e.path.shift();goal=e.path[0];if(!goal)continue;}
   const dx=goal.x-e.x,dy=goal.y-e.y,len=Math.hypot(dx,dy)||1,speed=aggro?(e.quest?62:52):18;
   const oldX=e.x,oldY=e.y;this.move(e,dx/len,dy/len,speed*dt);e.travel+=Math.hypot(e.x-oldX,e.y-oldY);e.dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy>0?2:0;e.frame=1+Math.floor(e.travel/8)%8;
  }
  for(const shot of this.projectiles){
   shot.life-=dt;const next={x:shot.x+shot.vx*dt,y:shot.y+shot.vy*dt};
   if(!clearLine(shot,next,this.solids)){shot.life=0;continue;}shot.x=next.x;shot.y=next.y;
   if(distance(shot,s)<14){this.hurtPlayer(shot.power,s);shot.life=0;}
  }
  this.projectiles=this.projectiles.filter(p=>p.life>0);
 }
 drain(){return this.events.splice(0);}
}
