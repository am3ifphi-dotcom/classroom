import {chromium} from '@playwright/test';import cb from '@sparticuz/chromium';import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({executablePath:await cb.executablePath(),headless:true,args:[...cb.args.filter(s=>!s.includes('single-process')&&!s.includes('use-gl=')&&!s.includes('use-angle=')&&!s.includes('in-process-gpu')),'--disable-gpu']});
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.setDefaultTimeout(12000);
const finish=()=>page.evaluate(()=>{for(let i=0;i<100&&__game.mode==='dialogue';i++){if(document.querySelector('#dialogue-choices button'))break;__game.next();}});
async function interact(id){await page.evaluate(id=>__game.interact({id,type:['ryoma','rei','satou','terachi'].includes(id)?'npc':'rift'}),id);await finish();}
async function fight(id){
 // Do not modify HP or damage. Position the test player in range, then send real
 // attack/skill keys against the same engine used in play; dodge real warnings.
 for(let i=0;i<70;i++){
  if(await page.evaluate(()=>__game.mode!=='explore'||!__game.battle))break;
  const data=await page.evaluate(id=>{const e=__game.combat.enemies.find(e=>e.quest===id);const spots=[[e.x-52,e.y],[e.x+52,e.y],[e.x,e.y+52],[e.x,e.y-52]];const spot=spots.find(([x,y])=>__game.walkable(x,y)&&!(e.phase==='windup'&&e.attack==='slam'&&Math.hypot(x-e.target.x,y-e.target.y)<e.radius+12))||spots.find(([x,y])=>__game.walkable(x,y));if(spot){__game.teleport(...spot);const dx=e.x-spot[0],dy=e.y-spot[1];__game.state.dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy>0?2:0;}return {hp:__game.state.hp,phase:e.phase};},id);
  await page.keyboard.press('z');if(i%4===0)await page.keyboard.press('x');if(data.hp<45)await page.keyboard.press('c');await page.waitForTimeout(410);
 }
 assert.equal(await page.evaluate(()=>__game.battle),null,'guardian '+id+' cleared');
}
try{
 await page.goto('http://localhost:5173');await page.waitForFunction(()=>window.__game);await page.click('#start-btn');await finish();assert.equal(await page.evaluate(()=>__game.combat.enemies.filter(e=>__game.combat.visible(e,__game.state)).length),0,'no enemies at the start');
 await page.keyboard.press('e');await finish();assert.ok(await page.evaluate(()=>__game.state.joined));
 assert.equal(await page.locator('#battle').count(),0,'no command battle overlay');
 await page.waitForTimeout(750);assert.equal(await page.evaluate(()=>__game.guide.target.id),'exit');assert.equal(await page.evaluate(()=>__game.combat.enemies.filter(e=>__game.combat.visible(e,__game.state)).length),0,'joining does not spawn enemies');
 const x=await page.evaluate(()=>__game.state.x);await page.keyboard.down('d');await page.waitForTimeout(240);await page.keyboard.up('d');assert.ok(await page.evaluate(()=>__game.state.x)>x);
 await page.evaluate(()=>__game.teleport(575,440));await page.waitForTimeout(550);
 const spot=await page.evaluate(()=>{const r=__game.renderer;return {x:(580-r.cam.x)*r.scale+innerWidth/2,y:(575-r.cam.y)*r.scale+innerHeight/2};});await page.mouse.click(spot.x,spot.y);await page.waitForFunction(()=>__game.state.y>560);
 await page.keyboard.press('g');assert.equal(await page.evaluate(()=>__game.mode),'modal');assert.ok((await page.locator('#modal-content').textContent()).includes('放課後の道のり'));await page.click('#toggle-guide');await page.click('#toggle-guide');await page.keyboard.press('Escape');
 // Play the actual new doorway scene, including the return to the classroom.
 await page.evaluate(()=>__game.teleport(138,1090));await page.keyboard.press('e');await finish();
 assert.equal(await page.evaluate(()=>__game.state.thresholdChecked),true);assert.equal(await page.evaluate(()=>__game.state.x),493);assert.equal(await page.evaluate(()=>__game.state.anomalyAwakened),false);
 await page.waitForTimeout(750);assert.equal(await page.evaluate(()=>__game.guide.target.id),'board');
 assert.equal(await page.evaluate(()=>__game.combat.enemies.filter(e=>__game.combat.visible(e,__game.state)).length),0,'door discovery has no ghosts');
 // Start first fight by approaching the actual story point.
 await page.evaluate(()=>__game.teleport(467,190));await page.keyboard.press('e');
 await page.evaluate(()=>{for(let i=0;i<20&&!__game.combat.enemies.some(e=>e.revealing);i++)__game.next();__game.next();});
 assert.equal(await page.evaluate(()=>__game.combat.enemies.filter(e=>__game.combat.visible(e,__game.state)).length),1,'only the narrated enemy is revealed');
 await page.waitForTimeout(500);await page.screenshot({path:'release/opening-reveal.png'});
 await finish();assert.equal(await page.evaluate(()=>__game.mode),'explore');assert.equal(await page.evaluate(()=>__game.battle.id),'board');
 await page.evaluate(()=>__game.teleport(600,260));await page.waitForTimeout(700);await page.screenshot({path:'release/action-preview.png'});
 await fight('board');await finish();assert.deepEqual(await page.evaluate(()=>__game.state.fragments),['board']);console.log('PASS in-map combat, guide, movement, first guardian');
 await interact('rei');await interact('satou');await page.evaluate(()=>__game.teleport(1450,869));await interact('vending');await fight('vending');await finish();
 await interact('terachi');await page.evaluate(()=>__game.teleport(1320,1235));await interact('broadcast');await fight('broadcast');await finish();assert.equal(await page.evaluate(()=>__game.state.fragments.length),3);
 await page.evaluate(()=>__game.teleport(467,190));await interact('board');await fight('final');await finish();await page.click('#dialogue-choices button:nth-child(2)');await finish();assert.equal(await page.evaluate(()=>__game.state.ending),'true');console.log('PASS all four action guardians and true ending');
 await page.evaluate(()=>{__game.close();__game.save();});await page.reload();await page.waitForFunction(()=>window.__game);await page.click('#continue-btn');assert.equal(await page.evaluate(()=>__game.state.ending),'true');await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>__game.guide.target.id),'exit');console.log('PASS save/reload and ending guide');
 assert.deepEqual(errors,[]);
 fs.writeFileSync('.work/action-e2e.json',JSON.stringify({ok:true,errors},null,2));
}catch(e){console.error(e);console.error(errors);await page.screenshot({path:'.work/action-failure.png'});process.exitCode=1;}finally{await browser.close();}process.exit(process.exitCode||0);
