export const CHAPTERS=[
 {id:'join',title:'両馬と合流する',place:'2年B組',detail:'まずは近くの両馬に話しかける。'},
 {id:'door',title:'ふたりで下校口へ',place:'夕映えの踊り場・西側',detail:'教室の南東出口から廊下へ。西に回り、下校口の扉を調べる。'},
 {id:'board',title:'黒板の異変をほどく',place:'2年B組・北側',detail:'黒板を調べ、実体化した番人を倒す。'},
 {id:'vending',title:'消えた温度を探す',place:'渡り廊下・東側',detail:'砂糖に話を聞き、自販機の番人を倒す。'},
 {id:'broadcast',title:'ゼロ人に届く声',place:'放送準備室',detail:'寺地に話を聞き、配信画面の番人を倒す。'},
 {id:'final',title:'存在しない七限目を終える',place:'2年B組',detail:'三つの欠片を持って黒板へ戻る。'},
 {id:'exit',title:'いつもの帰り道へ',place:'夕映えの踊り場',detail:'西側の下校口へ。寄り道も続けられる。'}
];
export function chapterDone(id,s){return id==='join'?s.joined:id==='door'?s.thresholdChecked:id==='final'?!!s.ending:id==='exit'?false:s.fragments.includes(id);}
export function objective(s,battle){
 if(s.ending)return {id:'exit',title:'いつもの帰り道へ',detail:'夕映えの踊り場 → 西の下校口',hint:'異変は消えました。記録集めも続けられます。'};
 if(battle)return {id:'guardian-'+battle.id,title:'番人を倒す',detail:'マップ上で戦う。赤い攻撃予告の外へ。',hint:'Z 払う ／ Space 回避 ／ X 共鳴 ／ C 回復'};
 if(!s.joined)return {id:'ryoma',title:'両馬に話しかける',detail:'2年B組の中央。近づいて E。',hint:'金色の道しるべが、次の行き先です。'};
 if(!s.thresholdChecked)return {id:'exit',title:'ふたりで下校口へ',detail:'教室の南東出口 → 廊下を西へ → 踊り場の下校口',hint:'扉の近くで E。金色の道しるべをたどろう。'};
 if(!s.fragments.includes('board'))return {id:'board',title:'黒板を調べる',detail:'2年B組の北側。机の間を通って黒板へ。',hint:'さっきまでなかった白い一行。黒板の近くで E。'};
 if(!s.talked.includes('rei'))return {id:'rei',title:'零に異変の話を聞く',detail:'教室の南東出口 → 廊下を東へ → 地理準備室',hint:'零と話すと全回復。寄らずに先へ進むこともできます。'};
 if(!s.fragments.includes('vending'))return !s.talked.includes('satou')?{id:'satou',title:'砂糖に話を聞く',detail:'渡り廊下の東側、自販機の近く。',hint:'ここからは、自販機と放送室のどちらが先でも大丈夫。'}:{id:'vending',title:'自販機の異変を調べる',detail:'渡り廊下・東側の自販機で E。',hint:'遠くから飛んでくる光弾は、横に避けよう。'};
 if(!s.fragments.includes('broadcast'))return !s.talked.includes('terachi')?{id:'terachi',title:'寺地に話を聞く',detail:'廊下の東側から南へ → 放送準備室',hint:'真ん中の入口を抜け、机の右側を回ろう。'}:{id:'broadcast',title:'配信画面の異変を調べる',detail:'放送準備室の机にある画面で E。',hint:'思考力は自動回復。敵が集まったら X の共鳴。'};
 return {id:'board',title:'黒板へ戻る',detail:'三つの欠片が揃った。2年B組で最後の異変へ。',hint:s.notes.length>=3?'記録が3つ以上あるため、最後の選択肢が増えています。':'寄り道で記録を3つ集めると、最後の選択肢が増えます。'};
}
