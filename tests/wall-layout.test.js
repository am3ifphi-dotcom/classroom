import test from 'node:test';
import assert from 'node:assert/strict';
import {props,rooms,getRoom} from '../src/world.js';
import {wallArtBounds} from '../src/wall-art.js';
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
test('window images and sills never overlap the blackboard',()=>{
 const boards=props.filter(p=>p.type==='board').map(wallArtBounds);
 for(const window of props.filter(p=>p.type==='window')){
  for(const board of boards)assert.equal(overlaps(wallArtBounds(window),board),false,`window at ${window.x},${window.y} overlaps board`);
 }
});
test('classroom windows have separate frames and a visible wall gap before the board',()=>{
 const room=rooms.find(r=>r.id==='class');
 const windows=props.filter(p=>p.type==='window'&&getRoom(p.x,p.y).id==='class').map(wallArtBounds).sort((a,b)=>a.x-b.x);
 const board=wallArtBounds(props.find(p=>p.type==='board'));
 assert.equal(windows.length,2);
 for(let i=0;i<windows.length;i++){
  const w=windows[i];assert.ok(w.x>=room.x+8&&w.x+w.w<=room.x+room.w-8);
  assert.ok(w.x+w.w<=board.x-24,'keep at least 24px of wall before the blackboard');
  if(i)assert.ok(w.x-(windows[i-1].x+windows[i-1].w)>=8,'window frames must not touch');
 }
});
