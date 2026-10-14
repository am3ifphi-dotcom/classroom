export const W=1760,H=1320;
export const rooms=[{id:'class',name:'2年B組',sub:'桐葉高校・北棟',x:64,y:64,w:896,h:640,floor:'wood'}, {id:'library',name:'地理準備室',sub:'桐葉高校・北棟',x:1024,y:64,w:672,h:640,floor:'wood'}, {id:'hall',name:'渡り廊下',sub:'桐葉高校・北棟',x:64,y:704,w:1632,h:224,floor:'tile'}, {id:'garden',name:'夕映えの踊り場',sub:'桐葉高校・北棟',x:64,y:928,w:896,h:352,floor:'tile'}, {id:'broadcast',name:'放送準備室',sub:'桐葉高校・北棟',x:1024,y:928,w:672,h:352,floor:'wood'}];
export function getRoom(x,y){return rooms.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)||rooms[2];}
export const solids=[];
export const props=[];
const block=(x,y,w,h)=>solids.push({x,y,w,h});
const prop=(type,x,y,opts={})=>{props.push({type,x,y,...opts});if(opts.block)block(x,y-opts.block[1],opts.block[0],opts.block[1]);};
// Thick cutaway walls; door gaps remain real walkable passages.
for(const r of rooms.filter(r=>r.id==='class'||r.id==='library')){block(r.x,r.y,r.w,109);}
block(64,64,12,640);block(948,64,12,640);block(1024,64,12,640);block(1684,64,12,1216);
block(64,688,600,24);block(792,688,168,24);block(1024,688,200,24);block(1360,688,336,24);
block(64,928,240,112);block(440,928,520,112);block(1024,928,200,112);block(1360,928,336,112);
block(948,1040,12,240);block(1024,1040,12,240);block(64,928,12,352);block(64,1264,1632,16);
// Borders of the corridor: outside edge and the central dividing wall.
block(64,704,12,224);block(64,912,1632,16);
// openings through corridor south border
solids.splice(solids.length-1,1);block(64,912,240,16);block(440,912,784,16);block(1360,912,336,16);
block(960,64,64,640);block(960,928,64,352);block(1696,64,64,1216);
for(let row=0;row<4;row++)for(let col=0;col<5;col++){
 let x=184+col*139,y=300+row*93;prop('desk',x,y,{block:[64,26],book:(row*5+col)%4===0,seed:row*5+col});prop('chair',x+17,y+39,{block:[26,14]});
}
prop('teacher',432,234,{block:[128,32]});prop('board',339,151);prop('chart',788,144);prop('clocksmall',656,91);
prop('cabinet',842,200,{block:[66,45]});prop('plant',116,217,{block:[34,20]});prop('plant',881,645,{block:[34,22]});
// Two 98px-wide windows, a 12px mullion gap, then 28px of wall before the board.
// The old third window at x=297 extended into the blackboard at x=339.
for(const x of [103,213])prop('window',x,142);
prop('shelf',103,661,{block:[80,30]});prop('shelf',201,661,{block:[80,30]});prop('papers',342,628);prop('bag',201,464);
// Geography preparation room
for(let x=1090;x<1600;x+=106)prop('bookshelf',x,235,{block:[72,46]});
prop('chart',1240,150);prop('window',1505,145);prop('plant',1610,304,{block:[34,20]});
prop('worktable',1160,430,{block:[208,52]});prop('papers',1203,386);prop('books',1305,391);prop('chair',1201,470,{block:[26,14]});prop('chair',1305,470,{block:[26,14]});
prop('clock',1580,520,{block:[32,23]});prop('plant',1090,620,{block:[34,20]});prop('copier',1490,630,{block:[75,32]});
// Corridor
prop('vending',1407,808,{block:[108,49]});prop('plant',1608,820,{block:[34,20]});prop('bench',191,845,{block:[140,20]});prop('notice',972,759);
prop('window',397,771);prop('window',506,771);prop('plant',864,830,{block:[34,20]});
// Landing and the terminal door
prop('exit',90,1060);prop('window',536,1067);prop('window',638,1067);prop('plant',833,1200,{block:[34,20]});prop('bench',547,1190,{block:[140,20]});
// Broadcast room
prop('worktable',1150,1141,{block:[208,52]});prop('monitor',1191,1091);prop('radio',1280,1096);prop('chair',1235,1193,{block:[26,14]});prop('bookshelf',1490,1110,{block:[72,46]});prop('plant',1612,1220,{block:[34,20]});prop('window',1489,1057);
export const points=[
 {id:'ryoma',name:'両馬 二郎',type:'npc',char:'ryoma',x:555,y:444},
 {id:'rei',name:'数理 零',type:'npc',char:'rei',x:1400,y:452},
 {id:'satou',name:'砂糖 東洋',type:'npc',char:'satou',x:1339,y:832},
 {id:'terachi',name:'寺地 星',type:'npc',char:'terachi',x:1418,y:1196},
 {id:'board',name:'黒板の「七限目」',type:'rift',x:467,y:190,radius:92},
 {id:'vending',name:'不在の自動販売機',type:'rift',x:1464,y:831,radius:76},
 {id:'broadcast',name:'無人の配信画面',type:'rift',x:1220,y:1162,radius:80},
 {id:'window',name:'窓の向こうの電線',type:'note',x:159,y:208},
 {id:'map',name:'塀先生の地形図',type:'note',x:1307,y:190,radius:80},
 {id:'clock',name:'止まった振り子',type:'note',x:1595,y:551},
 {id:'exit',name:'下校口',type:'exit',x:138,y:1090},
];
