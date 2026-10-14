import subprocess,json,base64,concurrent.futures
from pathlib import Path
from urllib.parse import quote
ROOT=Path(__file__).resolve().parents[1]
def fetch(repo,path,out):
 p=ROOT/out
 if p.exists():return
 p.parent.mkdir(parents=True,exist_ok=True)
 data=subprocess.check_output(['gh','api',f'repos/{repo}/contents/{quote(path)}','-H','Accept: application/vnd.github.raw+json'])
 try:
  j=json.loads(data)
  if 'content' in j:data=base64.b64decode(j['content'])
 except (ValueError,TypeError):pass
 p.write_bytes(data)
 print(out,len(data))
if __name__=='__main__':
 tasks=[]
 repo='Davi-info/institute-of-evil---game'
 for name in ['CoolSchool_tileset.png','coolschool_A2.png','coolschool_A4.png','coolschool_B.png']:
  tasks.append((repo,'assets/terrain/coolschool/'+name,'assets/tiles/'+name))
 repo='Calinou/kenney-particle-pack'
 for name in ['magic_01.png','magic_03.png','spark_01.png','light_01.png','smoke_03.png','star_01.png','LICENSE.txt']:
  tasks.append((repo,'addons/kenney_particle_pack/'+name,'assets/effects/'+name))
 repo='iwenzhou/kenney'
 for name in ['footstep00.ogg','footstep01.ogg','doorOpen_1.ogg','doorClose_1.ogg','bookOpen.ogg']:
  tasks.append((repo,'Audio (295 files)/RPG sounds (50 sounds)/'+name,'assets/audio/'+name))
 for name in ['click1.ogg','rollover2.ogg','confirmation_002.ogg'][:2]:
  tasks.append((repo,'Audio (295 files)/UI sounds (50 sounds)/'+name,'assets/audio/'+name))
 tasks.append((repo,'LICENSE.md','assets/licenses/kenney-CC0.md'))
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
  for f in [ex.submit(fetch,*t) for t in tasks]:
   try:f.result()
   except Exception as e:print(e)
