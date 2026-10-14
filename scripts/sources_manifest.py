import json,subprocess,hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
repos=['sanderfrenken/Universal-LPC-Spritesheet-Character-Generator','ElizaWy/LPC','Davi-info/institute-of-evil---game','Calinou/kenney-particle-pack','llamacademy/music-fader','iwenzhou/kenney']
def get(repo):
 sha=json.loads(subprocess.check_output(['gh','api','repos/'+repo+'/commits?per_page=1']))[0]['sha']
 return {'repository':'https://github.com/'+repo,'head_at_recording':sha}
with ThreadPoolExecutor(max_workers=6) as pool:sources=list(pool.map(get,repos))
files=[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in Path('assets').rglob('*') if p.is_file()]
Path('assets-manifest.json').write_text(json.dumps({'recorded_on':'2026-10-14','sources':sources,'files':files},ensure_ascii=False,indent=2))
