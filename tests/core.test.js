import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validSave,maxHP,walkable,findPath} from '../src/core.js';
import {solids,points} from '../src/world.js';
test('saves clamp numeric fields and discard unknown data',()=>{assert.equal(validSave(null),null);assert.equal(validSave({version:2}),null);const s=validSave({...freshState(),hp:-99,tea:-8,level:999,fragments:['board','bogus','board'],notes:['window','<script>'],x:Infinity});assert.equal(s.hp,1);assert.equal(s.level,4);assert.equal(s.tea,0);assert.deepEqual(s.fragments,['board']);assert.deepEqual(s.notes,['window']);assert.equal(s.x,493);});
test('player starts in a walkable position',()=>{const s=freshState();assert.ok(walkable(s.x,s.y,solids));});
test('all quest locations reachable from the starting point',()=>{const s=freshState();for(const p of points){const path=findPath(s,p,solids);assert.ok(path.length||Math.hypot(s.x-p.x,s.y-p.y)<75,`No path to ${p.id}`);const end=path.at(-1);if(end)assert.ok(Math.hypot(end.x-p.x,end.y-p.y)<(p.radius||75),`path ends too far from ${p.id}`);}});
