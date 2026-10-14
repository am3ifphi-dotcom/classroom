export const SAVE_KEY='honshitsu-afterhours-v1';
export const BASE_HP=80;
export const FRAGMENTS=['board','vending','broadcast'];
export function freshState(){return {version:1,storyVersion:2,thresholdChecked:false,anomalyAwakened:false,x:493,y:438,dir:2,hp:80,fp:30,level:1,tea:3,joined:false,intro:false,fragments:[],defeated:[],notes:[],talked:[],ending:null,steps:0,playtime:0,battles:0};}
export function maxHP(s){return BASE_HP+(s.level-1)*10;}
export function validSave(raw){
 if(!raw||raw.version!==1)return null;
 const s=freshState();
 for(const k of ['x','y','hp','fp','level','tea','steps','playtime','battles','dir'])if(Number.isFinite(raw[k]))s[k]=raw[k];
 s.level=Math.max(1,Math.min(4,Math.floor(s.level)));s.hp=Math.max(1,Math.min(maxHP(s),s.hp));s.fp=Math.max(0,Math.min(30,s.fp));s.tea=Math.max(0,Math.min(99,Math.floor(s.tea)));
 s.dir=Math.max(0,Math.min(3,Math.floor(s.dir)));s.x=Math.max(80,Math.min(1680,s.x));s.y=Math.max(170,Math.min(1260,s.y));
 s.joined=raw.joined===true;s.intro=raw.intro===true;
 s.fragments=[...new Set((Array.isArray(raw.fragments)?raw.fragments:[]).filter(x=>FRAGMENTS.includes(x)))];
 s.notes=[...new Set((Array.isArray(raw.notes)?raw.notes:[]).filter(x=>['window','map','clock','rei','satou','terachi','ryoma'].includes(x)))];
 s.talked=(Array.isArray(raw.talked)?raw.talked:[]).filter(x=>typeof x==='string').slice(0,20);
 s.defeated=[...new Set((Array.isArray(raw.defeated)?raw.defeated:[]).filter(x=>/^shade-[0-7]$/.test(x)))];
 s.ending=['normal','true'].includes(raw.ending)?raw.ending:null;
 const progressed=s.fragments.length>0||s.defeated.length>0||!!s.ending;
 s.thresholdChecked=progressed||raw.thresholdChecked===true||(raw.storyVersion!==2&&s.joined);
 s.anomalyAwakened=progressed||raw.anomalyAwakened===true;
 if(progressed)s.joined=true;
 return s;
}
export const ENCOUNTERS={
 board:{name:'正解の残響',line:'「答えのないものは、存在しない。」',hp:55,power:9,intents:['define','silence','noise'],reward:'答えのない余白'},
 vending:{name:'不在の自動販売機',line:'「なかったものを、なかったことに。」',hp:70,power:11,intents:['silence','noise','define'],reward:'不在の温度'},
 broadcast:{name:'視聴者ゼロの声',line:'「誰にも届かない声に、意味はない。」',hp:80,power:12,intents:['noise','define','silence'],reward:'宛先のない声'},
 final:{name:'存在しない七限目',line:'「すべてを定義せよ。さもなくば、下校を認めない。」',hp:145,power:14,intents:['define','noise','silence','noise'],reward:'放課後の続き'}
};
export function overlaps(x,y,r){return x>r.x-10&&x<r.x+r.w+10&&y>r.y-6&&y<r.y+r.h+6;}
export function walkable(x,y,solids){return x>=80&&x<=1680&&y>=172&&y<=1270&&!solids.some(r=>overlaps(x,y,r));}
export function findPath(start,end,solids,step=24){
 const cell=p=>[Math.round(p.x/step),Math.round(p.y/step)],a=cell(start),z=cell(end),key=(x,y)=>`${x},${y}`;
 let target=z;if(!walkable(z[0]*step,z[1]*step,solids)){
  let best=null,bd=Infinity;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){let x=z[0]+dx,y=z[1]+dy,d=dx*dx+dy*dy;if(d<bd&&walkable(x*step,y*step,solids)){best=[x,y];bd=d;}}
  if(!best)return [];target=best;
 }
 let open=[{x:a[0],y:a[1],g:0,f:0}],visited=new Set(),came=new Map(),gs=new Map([[key(...a),0]]),goal=key(...target),count=0;
 while(open.length&&count++<9000){open.sort((a,b)=>a.f-b.f);let n=open.shift(),nk=key(n.x,n.y);if(visited.has(nk))continue;
  if(nk===goal){const result=[];let k=nk;while(came.has(k)){const [x,y]=k.split(',').map(Number);result.unshift({x:x*step,y:y*step});k=came.get(k);}return result;}
  visited.add(nk);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=n.x+dx,y=n.y+dy,k=key(x,y);if(visited.has(k)||!walkable(x*step,y*step,solids))continue;let g=n.g+1;if(g<(gs.get(k)??Infinity)){gs.set(k,g);came.set(k,nk);open.push({x,y,g,f:g+Math.abs(x-target[0])+Math.abs(y-target[1])});}}
 }
 return [];
}
