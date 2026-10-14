import {asset} from './renderer.js';
export class Sound{
 constructor(){this.unlocked=false;this.enabled=true;this.volume=.38;this.current='TownTheme.mp3';this.music={};this.effects={};this.active=new Set();for(const f of ['TownTheme.mp3','battleThemeA.mp3']){const a=new Audio(asset('audio/'+f));a.loop=true;a.preload='none';this.music[f]=a;}for(const f of ['footstep00.ogg','footstep01.ogg','doorOpen_1.ogg','doorClose_1.ogg','click1.ogg','rollover2.ogg','bookOpen.ogg']){const a=new Audio(asset('audio/'+f));a.preload='auto';this.effects[f]=a;}}
 unlock(){if(this.unlocked)return;this.unlocked=true;this.playMusic(this.current);}
 playMusic(name){this.current=name;for(const [k,a]of Object.entries(this.music)){if(k!==name)a.pause();}if(this.unlocked&&this.enabled&&!document.hidden){const a=this.music[name];a.volume=this.volume*.55;a.play().catch(()=>{});}}
 effect(name,v=.6){if(!this.unlocked||!this.enabled||document.hidden)return;const source=this.effects[name];if(!source)return;const a=source.cloneNode();a.volume=Math.min(1,this.volume*v);this.active.add(a);a.onended=()=>this.active.delete(a);a.play().catch(()=>this.active.delete(a));}
 settings(enabled,volume){this.enabled=enabled;this.volume=volume;if(!enabled)this.pause();else this.playMusic(this.current);}
 pause(){Object.values(this.music).forEach(a=>a.pause());this.active.forEach(a=>a.pause());this.active.clear();}
}
