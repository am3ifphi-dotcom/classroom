from fetch_assets import fetch,ROOT
import concurrent.futures,json
repo='sanderfrenken/Universal-LPC-Spritesheet-Character-Generator'
parts=['body/bodies/male/light','head/heads/human/male/light','eyes/human/adult/brown','legs/formal/male/navy','feet/shoes/male/black','torso/clothes/longsleeve/formal/male/white','torso/jacket/collared/male/navy','neck/tie/necktie/male/maroon','hair/spiked/male/chestnut','hair/bangs/male/black','hair/plain/male/black','hair/bangsshort/male/black','hair/parted/male/dark_brown','hair/bedhead/male/black','hair/messy2/male/black','hair/mop/male/black','facial/glasses/glasses/adult/black']
defs=['body','heads_human_male','eyes','legs_formal','feet_shoes','torso_clothes_longsleeve_formal','torso_jacket_collared','neck_necktie','hair_spiked','hair_bangs','hair_plain','hair_bangsshort','hair_parted','hair_bedhead','hair_messy2','hair_mop','facial_glasses']
tasks=[(repo,'spritesheets/'+p+'.png','.work/lpc/'+p+'.png') for p in parts]
tasks +=[(repo,'sheet_definitions/'+p+'.json','assets/licenses/lpc/'+p+'.json') for p in defs]
tasks +=[(repo,'CREDITS.csv','assets/licenses/lpc/CREDITS.csv'),(repo,'LICENSE','assets/licenses/lpc/LICENSE')]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for f in [ex.submit(fetch,*t) for t in tasks]:
  try:f.result()
  except Exception as e:print(e)
from PIL import Image
for p in parts:
 im=Image.open(ROOT/'.work/lpc'/f'{p}.png');print(p,im.size)
