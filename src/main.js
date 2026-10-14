import './style.css';
import fullCredits from '../CREDITS.md?raw';
import zenLicense from '../assets/licenses/fonts/Zen-Kaku-Gothic-New-OFL.txt?raw';
import shipporiLicense from '../assets/licenses/fonts/Shippori-Mincho-OFL.txt?raw';
import kenneyLicense from '../assets/licenses/kenney-CC0.md?raw';
import {freshState,validSave,SAVE_KEY,maxHP,FRAGMENTS,ENCOUNTERS,walkable,findPath} from './core.js';
import {ActionWorld,facing} from './action.js';
import {objective,CHAPTERS,chapterDone} from './guide.js';
import {rooms,props,points,solids,getRoom} from './world.js';
import {Renderer,loadImages,asset} from './renderer.js';
import {Sound} from './audio.js';
import {PEOPLE,line,INTRO,DOOR_SCENE,RETRY_BOARD,conversation,NOTE_DATA,PRE_BATTLE,POST_BATTLE,JOURNAL} from './story.js';
const combat=new ActionWorld(solids);
let guideClock=0,guideVisible=true,guidePath=[],guideTarget=null,attackHeld=false;
const $=id=>document.getElementById(id);
let state=freshState(),mode='title',previousMode='explore',renderer,sound=new Sound(),actors=[],path=[],pendingTarget=null,keys=new Set(),trail=[],battle=null,dialogue=[],dialogueIndex=0,dialogueDone=null,typed=0,typeTimer=0,lastTime=0,elapsed=0,saveClock=0,stepClock=0,lastRoom='class',miniClock=0,toastTimer,areaTimer,settings={sound:true,volume:.38,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},pointerId=null,joystick={x:0,y:0};
let storageAvailable=true;
function readSave(){try{return validSave(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{return null;}}
function save(){if(mode==='title')return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{if(storageAvailable)toast('この環境では保存できません。タブを閉じると進行が失われます。');storageAvailable=false;}}
try{const v=JSON.parse(localStorage.getItem('honshitsu-settings'));if(v){settings.sound=v.sound!==false;settings.volume=Math.max(0,Math.min(1,Number(v.volume)||0));settings.reduced=v.reduced===true;}}catch{}
sound.settings(settings.sound,settings.volume);
function saveSettings(){try{localStorage.setItem('honshitsu-settings',JSON.stringify(settings));}catch{}sound.settings(settings.sound,settings.volume);renderer.reduced=settings.reduced;}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
function areaBanner(name,sub='KIRIHA HIGH SCHOOL'){const e=$('area-banner');e.replaceChildren();const small=document.createElement('small');small.textContent=sub;e.append(small,document.createTextNode(name));e.classList.add('show');clearTimeout(areaTimer);areaTimer=setTimeout(()=>e.classList.remove('show'),2800);}
function flash(){if(settings.reduced)return;$('game').classList.remove('flash');requestAnimationFrame(()=>$('game').classList.add('flash'));}
function updateHUD(){
 $('hpbar').style.width=`${state.hp/maxHP(state)*100}%`;$('hptext').textContent=`${state.hp} / ${maxHP(state)}`;$('fpbar').style.width=`${state.fp/30*100}%`;$('fptext').textContent=`${Math.floor(state.fp)} / 30`;$('level').textContent='Lv. '+String(state.level).padStart(2,'0');
 const r=getRoom(state.x,state.y);$('area').textContent=r.sub;$('roomname').textContent=r.name;$('clock').textContent=state.ending?'17:07':'17:06';
 const n=state.fragments.length;$('fragment-count').textContent=n+' / 3';[...$('fragment-dots').querySelectorAll('i')].forEach((e,i)=>e.classList.toggle('filled',i<n));
 const goal=objective(state,battle);$('quest-title').textContent=goal.title;$('quest-desc').textContent=goal.detail;$('quest-hint').textContent=goal.hint;
 $('combat-bar').classList.toggle('hidden',!state.anomalyAwakened||!!state.ending);
 $('boss-status').classList.toggle('hidden',!battle);
 if(battle){const e=combat.enemies.find(e=>e.quest===battle.id);$('enemy-name').textContent=ENCOUNTERS[battle.id].name;$('enemy-hp').style.width=e.hp/e.max*100+'%';$('enemy-hp-text').textContent=e.hp+' / '+e.max;}
 for(const [id,cd,max] of [['attack',combat.player.attackCD,.38],['dodge',combat.player.dodgeCD,.8],['skill',combat.player.skillCD,1.15],['heal',combat.player.healCD,1]]){
  const el=$('action-'+id);el.style.setProperty('--cooldown',Math.min(1,cd/max));el.disabled=id!=='attack'&&(cd>0||(id==='skill'&&state.fp<12)||(id==='heal'&&(state.tea===0||state.hp===maxHP(state))));
 }
 $('heal-count').textContent=state.tea;

}
function resetActors(){actors=points.filter(p=>p.type==='npc').map(p=>({id:p.id,x:p.x,y:p.y,homeX:p.x,homeY:p.y,dir:2,frame:0,t:Math.random()*5}));if(state.joined){const a=actors.find(a=>a.id==='ryoma');a.x=state.x-32;a.y=state.y+20;}trail=[];path=[];}
function startGame(saved){state=saved||freshState();battle=null;document.body.classList.remove('in-combat');mode='explore';combat.reset(state);resetActors();document.body.classList.remove('title');$('title-screen').classList.add('hidden');sound.unlock();renderer.cam.x=state.x+35;renderer.cam.y=state.y-75;renderer.ruleVisible=state.anomalyAwakened;renderer.eraserShown=state.anomalyAwakened;updateHUD();if(!saved)areaBanner('帰り支度','金曜日・放課後');
 if(!walkable(state.x,state.y,solids)){state.x=493;state.y=438;}
 if(!state.intro){state.intro=true;talk(INTRO,()=>{save();toast('両馬の近くで E。床をクリックしても移動できます。');});}else toast('放課後の記録を読み込みました');
}
function talk(lines,done){keys.clear();attackHeld=false;path=[];joystick={x:0,y:0};$('joystick').querySelector('i').style.transform='';pendingTarget=null;mode='dialogue';document.body.classList.add('talking');$('interact-hint').classList.add('hidden');$('dialogue').classList.remove('hidden');dialogue=lines;dialogueIndex=0;dialogueDone=done;showLine();}
function showLine(){const l=dialogue[dialogueIndex];runStoryCue(l.cue);const person=PEOPLE[l.who]||PEOPLE.narrator;$('speaker-name').textContent=person.name;$('speaker-tag').textContent=person.tag;const portrait=$('speaker-portrait');if(['mie','ryoma','rei','terachi','satou'].includes(l.who)){portrait.src=asset('portraits/'+l.who+'.png');portrait.alt=person.name;portrait.parentElement.classList.remove('hidden');}else{portrait.parentElement.classList.add('hidden');}
 typed=0;typeTimer=0;$('dialogue-text').textContent='';$('dialogue-choices').replaceChildren();$('dialogue-next').classList.remove('hidden');sound.effect('click1.ogg',.17);
}
function runStoryCue(cue){
 if(cue==='rule-appears'){
  renderer.ruleVisible=true;const a=actors.find(a=>a.id==='ryoma');
  const spot=[[-34,0],[34,0],[0,38],[-34,20]].map(([dx,dy])=>({x:state.x+dx,y:state.y+dy})).find(p=>walkable(p.x,p.y,solids));
  if(a&&spot){a.x=spot.x;a.y=spot.y;a.dir=0;trail=[];}
 }

 if(cue==='threshold-loop'){
  state.thresholdChecked=true;state.x=493;state.y=438;state.dir=0;resetActors();renderer.cam.x=state.x+35;renderer.cam.y=state.y-75;
  sound.effect('doorClose_1.ogg',.6);flash();updateHUD();guideClock=1;
 }
 if(cue?.startsWith('reveal-')){
  const id=cue.slice(7),e=combat.enemies.find(e=>e.quest===id);combat.reveal(id);
  if(e){renderer.burst(e.x,e.y-22,'#eee2c0',28);sound.effect('bookOpen.ogg',.7);}
 }
 if(cue==='eraser-demonstration'){renderer.eraserShown=true;
  renderer.burst(state.x,state.y-20,'#eee2c0',15);combat.effects.push({kind:'pulse',x:state.x,y:state.y-16,life:.5,max:.5});
 }
}
function revealLine(){const l=dialogue[dialogueIndex];if(!l)return;typed=l.text.length;$('dialogue-text').textContent=l.text;if(l.choices){$('dialogue-next').classList.add('hidden');if(!$('dialogue-choices').children.length)for(const choice of l.choices){const b=document.createElement('button');b.textContent=choice.label;b.disabled=choice.disabled===true;b.onclick=()=>{sound.effect('click1.ogg');finishDialogue();choice.action();};$('dialogue-choices').append(b);}}}
function nextLine(){if(mode!=='dialogue')return;const l=dialogue[dialogueIndex];if(typed<l.text.length){revealLine();return;}if(l.choices)return;if(++dialogueIndex<dialogue.length)showLine();else finishDialogue();}
function finishDialogue(){const done=dialogueDone;dialogueDone=null;$('dialogue').classList.add('hidden');document.body.classList.remove('talking');mode='explore';combat.player.invulnerable=Math.max(.7,combat.player.invulnerable);done?.();updateHUD();save();}
function nearest(){let result=null,min=Infinity;for(const p of points){const a=p.type==='npc'?actors.find(a=>a.id===p.id):p;const d=Math.hypot(a.x-state.x,a.y-state.y);const score=d+(p.id==='ryoma'&&state.joined?100:0);if(d<(p.radius||75)&&score<min){result={...p,x:a.x,y:a.y};min=score;}}return result;}

function noteAdd(id){if(!state.notes.includes(id)){state.notes.push(id);toast('記録を入手：'+(NOTE_DATA[id]?.title||PEOPLE[id]?.name));sound.effect('bookOpen.ogg',.6);}}
function interact(p=nearest()){
 if(mode==='dialogue'){nextLine();return;}if(mode!=='explore'||!p)return;
 sound.unlock();path=[];pendingTarget=null;
 if(battle&&p.type==='rift'){toast('番人を倒そう。遠くへ離れると、調べ直して再挑戦できます。');return;}
 if(p.type==='npc'){
  const recordVisit=state.anomalyAwakened||p.id==='ryoma';
  const first=!state.talked.includes(p.id);talk(conversation(p.id,state),()=>{
   if(recordVisit){if(first)state.talked.push(p.id);noteAdd(p.id);}
   if(p.id==='ryoma'&&!state.joined){state.joined=true;toast('両馬が同行します。南西の下校口へ向かおう。');}
   if(p.id==='rei'&&state.anomalyAwakened){state.hp=maxHP(state);state.fp=30;toast('零とひと息。平常心と思考力が回復しました。');}
   updateHUD();guideClock=1;
  });return;
 }
 if(p.type==='note'){
  if(!state.anomalyAwakened){const everyday={window:'電線の向こうに、夕陽が沈みかけている。\n廊下から、部活に向かう生徒の声が聞こえた。',map:'塀先生の地形図。机の端に、次の授業の資料が積まれている。',clock:state.thresholdChecked?'分針は、あのときと同じ位置にある。\nまず、教室に戻った白い字を確かめよう。':'時計は十七時六分。\n振り子が、いつもの調子で揺れている。'};talk([line('narrator',everyday[p.id])]);return;}
  talk(NOTE_DATA[p.id].lines,()=>noteAdd(p.id));return;
 }

 if(p.type==='exit'){
  if(state.ending){showEnding(state.ending,true);return;}
  if(!state.joined){talk([line('mie','両馬、まだ教室にいたな。\n一声かけてから帰るか。')]);return;}
  if(!state.thresholdChecked){talk(DOOR_SCENE,()=>{guideClock=1;save();});return;}
  talk([line('mie','ここを通って、さっき教室に戻された。\n黒板の〈終了〉欄を埋めるまで、同じことになりそうだ。')]);return;
 }
 if(p.type==='rift'){
  if(!state.joined){talk([line('mie','黒板は、日付と日直の名前だけ残っている。\n両馬が何か言いかけてたな。')]);return;}
  if(!state.thresholdChecked){talk([line('mie',p.id==='board'?'消した跡が、薄く残っているだけに見える。\nいったん下校口に行こう。':'まだいつもの校内だ。\n両馬を連れて、下校口へ行こう。')]);return;}
  if(p.id!=='board'&&!state.fragments.includes('board')){talk([line('mie','教室に戻された直後、黒板に字が増えた。\nまずあれを確かめよう。')]);return;}
  if(p.id==='board'&&state.fragments.length===3&&!state.ending){talk(PRE_BATTLE.final,()=>beginBattle('final'));return;}
  if(state.fragments.includes(p.id)){talk([line('narrator',state.ending?'夕陽が差している。もう、どこにも異変はない。':JOURNAL[p.id].text)]);return;}
  talk(p.id==='board'&&state.anomalyAwakened?RETRY_BOARD:PRE_BATTLE[p.id],()=>beginBattle(p.id));
 }

}
function beginBattle(id){
 state.anomalyAwakened=true;const enemy=combat.awaken(id);if(!enemy)return;battle={id};document.body.classList.add('in-combat');mode='explore';keys.clear();path=[];
 $('area-banner').classList.remove('show');sound.playMusic('battleThemeA.mp3');flash();
 toast('文字の×を払おう。Z／払う・Space／回避。赤い予告の外へ。');updateHUD();guideClock=1;
}
function doAction(action,aim){
 if(mode!=='explore')return false;sound.unlock();
 if(action==='dodge'&&!aim)aim={x:(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x,y:(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joystick.y};
 const ok=combat.trigger(action,state,aim);if(ok){path=[];pendingTarget=null;}return ok;
}
function endBattle(){battle=null;document.body.classList.remove('in-combat');sound.playMusic('TownTheme.mp3');updateHUD();guideClock=1;}
function processCombat(){
 const events=combat.drain();if(events.some(e=>e.type==='defeat')){
  endBattle();state.hp=maxHP(state);state.fp=30;state.tea=Math.max(1,state.tea);state.x=493;state.y=438;combat.reset(state);resetActors();renderer.cam.x=state.x+35;renderer.cam.y=state.y-75;
  talk([line('mie','……深呼吸。教室まで戻ってこられた。'),line('ryoma','赤い予告が出たら、その場所の外へ。\n避けた後の隙に、まとめて反撃しよう。'),line('narrator','平常心が回復した。欠片も記録も失っていない。\n番人は、異変を調べると再び戦える。')]);return;
 }
 for(const ev of events){
  if(ev.type==='hit'){renderer.float('−'+ev.amount,ev.x,ev.y,'#efe4bb');renderer.burst(ev.x,ev.y,'#ded0fa',8);}
  if(ev.type==='damage'){renderer.shake=settings.reduced?0:3;renderer.float('−'+ev.amount,ev.x,ev.y-65,'#f2a49a');sound.effect('doorClose_1.ogg',.7);}
  if(ev.type==='swing')sound.effect('rollover2.ogg',.5);
  if(ev.type==='skill'){sound.effect('bookOpen.ogg',.7);renderer.burst(state.x,state.y-20,'#cab7eb',20);}
  if(ev.type==='heal'){sound.effect('doorClose_1.ogg',.4);renderer.float('+38',state.x,state.y-60,'#bce3ae');}
  if(ev.type==='kill'){renderer.burst(ev.x,ev.y-25,'#dbddc0',18);save();}
  if(ev.type==='retreat'&&battle?.id===ev.id){endBattle();toast('異変から距離を置いた。調べ直すと再挑戦できます。');}
  if(ev.type==='victory'&&battle?.id===ev.id)winBattle();
 }
}
function updateGuide(){
 const goal=objective(state,battle);
 const enemy=combat.enemies.find(e=>e.id===goal.id);
 const point=points.find(p=>p.id===goal.id);guideTarget=enemy||point||null;
 if(guideTarget){guidePath=findPath(state,guideTarget,solids);const dx=guideTarget.x-state.x,dy=guideTarget.y-state.y;const n=Math.round(Math.hypot(dx,dy)/32);$('guide-distance').textContent=n<3?'すぐ近く':`あと約 ${n} マス`;}else guidePath=[];
 renderer.guide={visible:guideVisible,path:guidePath,target:guideTarget};
}
function showGuide(){
 const g=objective(state,battle);openModal(`<span class="eyebrow">STORY GUIDE / 次にすること</span><h2>${g.title}</h2><p>${g.detail}<br>${g.hint}</p><button class="modal-button" id="toggle-guide">道しるべ：${guideVisible?'表示中':'非表示'} ／ 切り替え</button><h3>放課後の道のり</h3>${CHAPTERS.map(c=>`<div class="record"><small>${chapterDone(c.id,state)?'✓ 完了':c.place}</small><b>${c.title}</b><p>${c.detail}</p></div>`).join('')}${state.anomalyAwakened?'<h3>何と戦っている？</h3><p>黒板の「答えのない時間は消去する」という文が、×のついた答案の形になったもの。骨や幽霊ではなく、チョークの文字です。黒板消しでほどき、三つの欠片で黒板の〈終了〉欄を埋めます。</p>':''}<h3>アクション操作</h3><p>Z：黒板消しで文字を払う（押しっぱなし可）<br>X：共鳴。周囲の敵を攻撃／思考力12<br>Space：移動方向へ回避。短い無敵時間<br>C：カフェオレで回復<br>赤い円・線は敵の攻撃予告。予告の外へ避けてから反撃。<br>敵を倒すと平常心と少量の思考力が回復。思考力は時間でも回復します。<br>スマートフォンは左のパッド＋右のアクションボタン。</p><h3>寄り道</h3><p>記録 ${state.notes.length} / 7。3つ以上で最後の選択肢が増えます。<br>黒板の導入後は、自販機・放送室のどちらからでも進めます。</p>`);$('toggle-guide').onclick=()=>{guideVisible=!guideVisible;updateGuide();showGuide();};
}
function winBattle(){const id=battle.id;state.battles++;endBattle();flash();renderer.burst(state.x,state.y-75,'#f0d8a8',45);
 if(id==='final'){talk([line('narrator','黒板の白い線が、ほどけていく。\n最後に、小さな問いだけが残った。'),line('anomaly','では、この時間に、名前を。'),line('mie','名前、か。', {choices:[{label:'「ただの放課後だ」',action:()=>endingScene('normal')},{label:state.notes.length>=3?'「わからないまま、帰ろう」':'記録を3つ以上集めると選べる',disabled:state.notes.length<3,action:()=>endingScene('true')} ]})]);return;}
 if(!state.fragments.includes(id))state.fragments.push(id);state.level=Math.min(4,state.fragments.length+1);state.hp=maxHP(state);state.fp=30;if(id==='vending')state.tea+=2;
 toast(`本質の欠片「${JOURNAL[id].title}」を入手 ／ Lv.${state.level}`);
 talk(POST_BATTLE[id],()=>{if(state.fragments.length===3){toast('三つの欠片が揃いました。2年B組の黒板へ。');}save();});
}
function endingScene(kind){state.ending=kind;talk(kind==='true'?[line('mie','……わからないまま、帰ろう。\nわかったふりして、今日を片づけなくていい。'),line('ryoma','それ、三重の口から聞くと、なんかいいな。'),line('mie','窓の電線も、地図にない国境も、止まった時計の音も。\n全部を説明しなくても、見たことまで消えないだろ。'),line('ryoma','三重。それ、まじ——'),line('mie','……一回だけなら、言っていい。'),line('ryoma','✝本質✝。'),line('narrator','時計の針が、一分だけ進んだ。\n帰り道は、南棟からも北棟からも、同じ夕陽に続いていた。')]:[line('mie','ただの放課後だ。\n意味があるとか、ないとか。帰るのに必要な話じゃない。'),line('ryoma','ただの放課後、か。悪くないな。'),line('mie','悪くないなら帰るぞ。ラーメンでも食って。'),line('ryoma','ラーメンの✝本質✝を探しに行くのか。'),line('mie','……は？'),line('narrator','時計の針が、一分だけ進んだ。\n答えのない一日は、答えのないまま終わった。')],()=>{save();showEnding(kind);});}
function showEnding(kind,revisit=false){openModal(`<span class="eyebrow">AFTER HOURS / ${kind==='true'?'TRUE':'NORMAL'} END</span><span class="ending-mark">✝</span><h2 class="ending-title">${kind==='true'?'わからないまま、<br>隣を歩く。':'ただの放課後。'}</h2><p class="ending-center">${kind==='true'?'説明できないものを、誰かと共有した。<br>それだけで、帰る理由になった。':'証明しなくても、この一日はあった。<br>そして明日も、いつもの教室がある。'}</p><div class="record"><small>放課後の記録</small><p>本質の欠片 ${state.fragments.length} / 3　・　観測記録 ${state.notes.length} / 7<br>異変を鎮めた回数 ${state.battles}　・　過ごした時間 ${Math.max(1,Math.floor(state.playtime/60))}分</p></div><button class="modal-button" id="ending-explore">余韻の残る校舎を歩く →</button><button class="modal-button" id="ending-credits">原作・素材クレジット</button><p class="ending-center">このエピソードは、原作の人物・舞台をもとにした<br>ゲーム独自の番外編です。原作本編の出来事ではありません。</p>`);$('ending-explore').onclick=()=>closeModal();$('ending-credits').onclick=showCredits;}
function openModal(html){attackHeld=false;previousMode=mode==='modal'?previousMode:mode;mode='modal';keys.clear();path=[];joystick={x:0,y:0};$('modal-content').innerHTML=html;$('modal-backdrop').classList.remove('hidden');document.body.classList.add('modal-open');$('modal-close').focus();sound.effect('bookOpen.ogg',.3);}
function closeModal(){if(mode!=='modal')return;mode=previousMode;$('modal-backdrop').classList.add('hidden');document.body.classList.remove('modal-open');keys.clear();$('modal-close').blur();}
function showJournal(){let html=`<span class="eyebrow">FIELD NOTES / 放課後の記録</span><h2>わからないことの手帳</h2><p>説明できなくても、観測したことは残る。<br>人物や物を調べて、記録を集めよう。3つ以上の記録で最後の選択肢が増える。</p>`;
 html+=`<h3>本質の欠片　${state.fragments.length} / 3</h3>`;for(const k of FRAGMENTS)html+=`<div class="record"><small>${state.fragments.includes(k)?'OBSERVED':'UNOBSERVED'}</small><p>${state.fragments.includes(k)?`<b>${JOURNAL[k].title}</b><br>${JOURNAL[k].text}`:'まだ、言葉になっていない。'}</p></div>`;
 html+=`<h3>観測記録　${state.notes.length} / 7</h3>`;for(const k of state.notes)html+=`<div class="record"><b>${NOTE_DATA[k]?.title||PEOPLE[k].name}</b><p>${NOTE_DATA[k]?.summary||({ryoma:'✝本質✝と「は？」は、ふたりでひとつ。',rei:'定義できないまま共有しているものが、ルールを崩す。',satou:'なかったものについて話したことまで、なかったことにはできない。',terachi:'視聴者がゼロでも、発信者は一人いる。'}[k])}</p></div>`;
 if(!state.notes.length)html+='<p>まだ記録はない。まずは、近くの両馬に話しかけよう。</p>';openModal(html);
}
function showBag(){openModal(`<span class="eyebrow">BELONGINGS / 三重の鞄</span><h2>放課後の持ち物</h2><div class="bag-item"><span>♧</span><div><b>カフェオレ　× ${state.tea}</b><p>ちゃんと温かい。平常心を38回復する。</p></div><button id="drink-tea" ${state.tea===0||state.hp===maxHP(state)?'disabled':''}>飲む</button></div><div class="bag-item"><span>▤</span><div><b>観測手帳</b><p>気づいたことが、自動で書き留められる。</p></div><button id="bag-notes">読む</button></div><div class="bag-item"><span>✝</span><div><b>本質の欠片　× ${state.fragments.length}</b><p>三つ集まったら、2年B組の黒板へ。</p></div></div><p>地理準備室の零と話すと、平常心と思考力が回復します。</p>`);$('drink-tea').onclick=()=>{if(state.tea>0&&state.hp<maxHP(state)){state.tea--;state.hp=Math.min(maxHP(state),state.hp+38);save();updateHUD();showBag();toast('ひと息ついた。平常心が回復。');}};$('bag-notes').onclick=showJournal;}
function showMap(){openModal('<span class="eyebrow">KIRIHA HIGH SCHOOL / NORTH WING</span><h2>北棟案内図</h2><canvas class="map-large" id="large-map" width="600" height="450"></canvas><p>◆ 紫：未解決の異変　■ 白：現在地<br>教室の右下が廊下への出口です。地理準備室は右上、放送準備室は右下。<br>校内では床をクリックして、障害物を避けて移動できます。</p>');renderer.minimap($('large-map'),state,true);}
function showMenu(){openModal(`<span class="eyebrow">PAUSE / 放課後の手帳</span><h2>少し、ひと息。</h2><button class="modal-button" id="resume-game">放課後に戻る →</button><button class="modal-button" id="save-game">記録を保存する</button><button class="modal-button" id="open-map">校内地図を開く</button><div class="setting-row"><label for="sound-toggle">音楽・効果音</label><input type="checkbox" id="sound-toggle" ${settings.sound?'checked':''}></div><div class="setting-row"><label for="volume">音量</label><input type="range" id="volume" min="0" max="1" step=".05" value="${settings.volume}"></div><div class="setting-row"><label for="reduced">光・揺れの演出を控えめに</label><input type="checkbox" id="reduced" ${settings.reduced?'checked':''}></div><button class="modal-button" id="fullscreen">全画面表示を切り替える</button><button class="modal-button" id="credits">原作・素材クレジット</button><button class="modal-button danger" id="restart">新しい放課後をはじめる</button><p>移動：WASD／矢印／床をクリック<br>話す・調べる：E／Enter　走る：Shift<br>攻撃：Z　共鳴：X　回避：Space　回復：C　ガイド：G<br>記録：J　持ち物：I　地図：M　手帳：Esc<br>進行はこのブラウザに自動保存されます。</p>`);
 $('resume-game').onclick=closeModal;$('save-game').onclick=()=>{save();toast(storageAvailable?'放課後の記録を保存しました':'この環境では保存できません');};$('open-map').onclick=showMap;$('sound-toggle').onchange=e=>{settings.sound=e.target.checked;sound.unlock();saveSettings();};$('volume').oninput=e=>{settings.volume=Number(e.target.value);saveSettings();};$('reduced').onchange=e=>{settings.reduced=e.target.checked;saveSettings();};$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('game').requestFullscreen)await $('game').requestFullscreen();else toast('このブラウザでは全画面APIに対応していません');}catch{toast('全画面表示が許可されませんでした。画面内では全面表示です。');}};$('credits').onclick=showCredits;$('restart').onclick=()=>{openModal('<span class="eyebrow">NEW STORY</span><h2>記録を上書きしますか？</h2><p>今の進行を消して、最初からはじめます。この操作は取り消せません。</p><button class="modal-button danger" id="confirm-new">上書きして、はじめる</button><button class="modal-button" id="cancel-new">戻る</button>');$('confirm-new').onclick=()=>{closeModal();startGame();save();};$('cancel-new').onclick=showMenu;};}
function showCredits(){openModal(`<span class="eyebrow">CREDITS / ORIGINAL WORK & ASSETS</span><h2>この放課後をつくったもの</h2><h3>原作・人物デザイン</h3><p>『偏差値60の教室から✝本質✝が漏れ出している件について』<br>ユーザー提供の原作および「本質images」を参照。著作者名・素材の公開ライセンスは未確認。原作・立ち絵は第三者向けフリー素材ではありません。<br>「存在しない七限目」はゲーム独自の番外編です。異変・会話・結末は原作の本編にはありません。</p><h3>キャラクター・歩行アニメーション</h3><p><a href="https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator" target="_blank" rel="noopener">Universal LPC Spritesheet Character Generator</a><br>原作者：Stephen Challener (Redshrike), Johannes Sjölund (wulax), Manuel Riecke (MrBeast), bluecarrot16, Eliza Wyatt, Joe White, JaidynReiman, Benjamin K. Smith, ほか。<br>CC BY-SA 3.0 を選択。既存パーツの合成・色調整・4方向9コマの歩行抽出。派生スプライトにも同ライセンスを適用。全寄与者は同梱の CREDITS.md と assets/licenses/lpc/ に記載。</p><h3>教室・家具・床</h3><p><a href="https://opengameart.org/content/cool-school-tileset" target="_blank" rel="noopener">Cool School — NettySvit</a>（CC0）<br><a href="https://github.com/ElizaWy/LPC" target="_blank" rel="noopener">LPC Revised — Eliza Wyatt / Lanea Zimmerman</a>（OGA-BY 3.0）<br>色調整・切り出し・拡大・配置。素材別クレジットを同梱。</p><h3>音楽・効果音・パーティクル</h3><p>Town Theme / Battle Theme A — <a href="https://opengameart.org/users/cynicmusic" target="_blank" rel="noopener">cynicmusic</a>（CC0）<br>RPG Sounds / UI Sounds / Particle Pack — <a href="https://kenney.nl" target="_blank" rel="noopener">Kenney</a>（CC0）<br>足音・UI・ドア音、光・魔法・煙の外部テクスチャを使用。</p><h3>フォント</h3><p>しっぽり明朝 — Fontdasu / 全角ゴシック — ZEN<br>SIL Open Font License 1.1。@fontsource 経由で同梱。</p><p>外部素材はローカル同梱。プレイ時の外部CDN接続は不要です。<br>詳しい出典・改変内容・ライセンスは下の通知に同梱しています。</p><button class="modal-button" id="full-licenses">全クレジット・ライセンス通知を読む</button>`);$('full-licenses').onclick=()=>{openModal('<span class="eyebrow">FULL ATTRIBUTIONS & LICENSE NOTICES</span><h2>権利と出典</h2><pre id="license-text"></pre>');$('license-text').textContent=fullCredits+'\n\n--- FONT LICENSES ---\n'+zenLicense+'\n\n'+shipporiLicense+'\n\n--- KENNEY CC0 ---\n'+kenneyLicense;};}
function canStep(x,y){if(!walkable(x,y,solids))return false;return actors.every(a=>a.id==='ryoma'&&state.joined||Math.hypot(x-a.x,y-a.y)>22||Math.hypot(x-a.x,y-a.y)>Math.hypot(state.x-a.x,state.y-a.y));}
function pathObstacles(){return [...solids,...actors.filter(a=>!(a.id==='ryoma'&&state.joined)).map(a=>({x:a.x-12,y:a.y-7,w:24,h:14}))];}
function move(dx,dy,dt,running=false){if(!dx&&!dy){state.frame=0;return;}const len=Math.hypot(dx,dy);dx/=len;dy/=len;const speed=running?188:115;const ox=state.x,oy=state.y;
 // Substeps prevent wall tunnelling on slow frames and sprint.
 const steps=Math.ceil(speed*dt/5);for(let i=0;i<steps;i++){const nx=state.x+dx*speed*dt/steps,ny=state.y+dy*speed*dt/steps;if(canStep(nx,state.y))state.x=nx;if(canStep(state.x,ny))state.y=ny;}
 if(Math.abs(dx)>Math.abs(dy))state.dir=dx>0?3:1;else state.dir=dy>0?2:0;
 const distance=Math.hypot(state.x-ox,state.y-oy);if(distance>.1){state.steps+=distance;state.frame=1+Math.floor(state.steps/12)%8;stepClock+=dt;if(stepClock>(running?.24:.4)){stepClock=0;sound.effect(Math.floor(state.steps/20)%2?'footstep00.ogg':'footstep01.ogg',.16);}if(!trail.length||Math.hypot(state.x-trail.at(-1).x,state.y-trail.at(-1).y)>4){trail.push({x:state.x,y:state.y,dir:state.dir});if(trail.length>30)trail.shift();}}else state.frame=0;
}
function update(dt){if(document.hidden)return;elapsed+=dt;const active=mode==='explore';if(active){state.playtime+=dt;let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x,dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joystick.y;
 if(dx||dy){path=[];pendingTarget=null;}else if(path.length){const p=path[0];dx=p.x-state.x;dy=p.y-state.y;if(Math.hypot(dx,dy)<6){path.shift();dx=dy=0;}}
 if(combat.player.dash<=0)move(dx,dy,dt,keys.has('shift'));
 if(keys.has('z')||attackHeld)doAction('attack');
 combat.update(dt,state);processCombat();if(mode!=='explore'){updateHUD();return;}
 if(pendingTarget){const a=pendingTarget.type==='npc'?actors.find(a=>a.id===pendingTarget.id):pendingTarget;if(Math.hypot(a.x-state.x,a.y-state.y)<(pendingTarget.radius||66)){const p=pendingTarget;pendingTarget=null;interact(p);}}
 if(state.joined&&trail.length>10){const a=actors.find(a=>a.id==='ryoma'),t=trail[Math.max(0,trail.length-12)],d=Math.hypot(t.x-a.x,t.y-a.y);if(d>4){const f=Math.min(1,dt*7);a.x+=(t.x-a.x)*f;a.y+=(t.y-a.y)*f;a.dir=t.dir;a.frame=state.frame||1;}else a.frame=0;}
 const p=nearest();$('interact-hint').classList.toggle('hidden',!p);if(p)$('interact-hint').querySelector('span').textContent=p.type==='npc'?p.name+'と話す':p.name+'を調べる';
 const r=getRoom(state.x,state.y);if(r.id!==lastRoom){lastRoom=r.id;areaBanner(r.name);sound.effect('doorOpen_1.ogg',.1);updateHUD();}
 saveClock+=dt;if(saveClock>6){saveClock=0;save();}
 }else{state.frame=0;if(mode!=='title')$('interact-hint').classList.add('hidden');}
 for(const a of actors){if(a.id==='ryoma'&&state.joined)continue;a.t+=dt;if(active&&Math.hypot(state.x-a.x,state.y-a.y)<100){const dx=state.x-a.x,dy=state.y-a.y;a.dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy>0?2:0;}else if(a.t>7){a.t=0;a.dir=[2,1,2,3][Math.floor(Math.random()*4)];}a.frame=0;}
 if(mode==='dialogue'){combat.effects.forEach(e=>e.life-=dt);combat.effects=combat.effects.filter(e=>e.life>0);const l=dialogue[dialogueIndex];if(l&&typed<l.text.length){typeTimer+=dt;const n=Math.floor(typeTimer/.022);if(n>0){typeTimer-=n*.022;typed=Math.min(l.text.length,typed+n);$('dialogue-text').textContent=l.text.slice(0,typed);if(typed===l.text.length)revealLine();}}}
 guideClock+=dt;if(guideClock>.65){guideClock=0;updateGuide();}if(active)updateHUD();
 renderer.update(dt,state,mode);miniClock+=dt;if(miniClock>.1){miniClock=0;renderer.minimap($('minimap'),state);}
}
function frame(t){let dt=Math.min((t-lastTime)/1000||0,.05);lastTime=t;update(dt);renderer.draw(elapsed,state,actors,mode,combat);requestAnimationFrame(frame);}
function bind(){
 $('start-btn').onclick=()=>{if(readSave()){openModal('<span class="eyebrow">NEW STORY</span><h2>最初からはじめますか？</h2><p>保存済みの進行を上書きします。</p><button class="modal-button" id="new-yes">はじめる</button><button class="modal-button" id="new-no">戻る</button>');$('new-yes').onclick=()=>{closeModal();startGame();};$('new-no').onclick=closeModal;}else startGame();};$('continue-btn').onclick=()=>startGame(readSave());$('title-credits').onclick=showCredits;$('dialogue-next').onclick=nextLine;$('dialogue-text').onclick=nextLine;$('modal-close').onclick=closeModal;$('modal-backdrop').onclick=e=>{if(e.target===$('modal-backdrop'))closeModal();};$('journal-btn').onclick=showJournal;$('bag-btn').onclick=showBag;$('menu-btn').onclick=showMenu;$('map-expand').onclick=showMap;$('guide-btn').onclick=showGuide;document.querySelectorAll('[data-action]').forEach(b=>{b.onclick=()=>doAction(b.dataset.action);});
 const attack=$('action-attack');attack.onpointerdown=e=>{if(mode!=='explore')return;e.preventDefault();attackHeld=true;attack.setPointerCapture(e.pointerId);doAction('attack');};attack.onpointerup=attack.onpointercancel=attack.onlostpointercapture=()=>{attackHeld=false;};
 addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.target instanceof HTMLInputElement)return;if(['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(k)&&k!=='tab')e.preventDefault();if(e.repeat)return;sound.unlock();
 if(k==='escape'){if(mode==='modal')closeModal();else if(mode==='explore')showMenu();return;}
 if(mode==='dialogue'){if(['e','enter',' '].includes(k)){e.preventDefault();nextLine();}return;}
 if(mode!=='explore')return;if(['z','x',' ','c'].includes(k)){e.preventDefault();if(k==='z')keys.add(k);doAction({z:'attack',x:'skill',' ':'dodge',c:'heal'}[k]);return;}if(k==='g'){showGuide();return;}if(['e','enter'].includes(k)){e.preventDefault();interact();return;}if(k==='j'){showJournal();return;}if(k==='i'){showBag();return;}if(k==='m'){showMap();return;}keys.add(k);
 });
 addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{attackHeld=false;keys.clear();joystick={x:0,y:0};state.frame=0;save();sound.pause();});addEventListener('focus',()=>sound.playMusic(sound.current));addEventListener('visibilitychange',()=>{attackHeld=false;keys.clear();if(document.hidden){save();sound.pause();}else sound.playMusic(sound.current);});addEventListener('pagehide',save);addEventListener('resize',()=>renderer.resize());
 $('world').addEventListener('pointerdown',e=>{if(mode!=='explore')return;sound.unlock();const target=renderer.screenToWorld(e.clientX,e.clientY);const enemy=combat.enemies.find(e=>combat.visible(e,state)&&Math.hypot(e.x-target.x,e.y-25-target.y)<30);if(enemy){if(!enemy.active){toast('先に近くの異変を調べよう。');return;}const dx=enemy.x-state.x,dy=enemy.y-state.y;state.dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:1:dy>0?2:0;doAction('attack',enemy);return;}const hit=points.find(p=>{const a=p.type==='npc'?actors.find(a=>a.id===p.id):p;return Math.hypot(a.x-target.x,a.y-23-target.y)<40;});if(hit){const a=hit.type==='npc'?actors.find(a=>a.id===hit.id):hit;if(Math.hypot(a.x-state.x,a.y-state.y)<(hit.radius||75)){interact(hit);return;}pendingTarget=hit;path=findPath(state,a,pathObstacles());}else{pendingTarget=null;path=findPath(state,target,pathObstacles());}renderer.burst(target.x,target.y,'#d2cfac',5);if(!path.length&&!hit)toast('そこへは歩いて行けません。通路を選んでください。');});
 const joy=$('joystick'),stick=joy.querySelector('i');function updateJoy(e){const r=joy.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,len=Math.hypot(x,y),m=Math.min(len,36);const nx=len?x/len:0,ny=len?y/len:0;stick.style.transform=`translate(${nx*m}px,${ny*m}px)`;joystick={x:len>8?nx:0,y:len>8?ny:0};}
 joy.onpointerdown=e=>{if(mode!=='explore')return;pointerId=e.pointerId;joy.setPointerCapture(e.pointerId);sound.unlock();updateJoy(e);};joy.onpointermove=e=>{if(e.pointerId===pointerId)updateJoy(e);};joy.onpointerup=joy.onpointercancel=joy.onlostpointercapture=()=>{pointerId=null;joystick={x:0,y:0};stick.style.transform='';};$('mobile-interact').onclick=()=>interact();
 // Keep keyboard focus inside the open game dialog.
 document.addEventListener('keydown',e=>{if(e.key!=='Tab'||mode!=='modal')return;const list=[...$('modal').querySelectorAll('button:not(:disabled),a,input')];const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}});
}
async function boot(){document.body.classList.add('title');try{await loadImages((n,total)=>$('loading-state').textContent=`${n} / ${total}`);await document.fonts.load('12px "Zen Kaku Gothic New"','日直両馬三重金曜日放課後七限目本質地理準備室下校口北棟あたたかい今日の放課後の意味を答えよ答えのない時間は消去しますまた月曜日提出終了');await document.fonts.ready;renderer=new Renderer($('world'));renderer.reduced=settings.reduced;resetActors();updateHUD();bind();if(readSave())$('continue-btn').classList.remove('hidden');$('loading').classList.add('fadeout');setTimeout(()=>$('loading').classList.add('hidden'),600);requestAnimationFrame(frame);
 if(import.meta.env.DEV){window.__game={get state(){return state;},get mode(){return mode;},get battle(){return battle;},get combat(){return combat;},get guide(){return {target:guideTarget,path:guidePath};},get actors(){return actors;},get renderer(){return renderer;},start:()=>startGame(),interact,next:nextLine,action:doAction,teleport(x,y){state.x=x;state.y=y;renderer.cam.x=x;renderer.cam.y=y;path=[];},journal:showJournal,storyGuide:showGuide,close:closeModal,save,getSave:readSave,walkable:(x,y)=>walkable(x,y,solids),path:(x,y)=>findPath(state,{x,y},solids)};}
 }catch(e){console.error(e);$('loading').innerHTML='<span>✝</span><p>素材の読み込みに失敗しました</p><small>ページを再読み込みしてください。</small><button id="reload">再読み込み</button>';$('reload').onclick=()=>location.reload();}}
boot();
