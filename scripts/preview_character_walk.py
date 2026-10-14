"""Produce a review GIF of the exported game sheets (not separately drawn samples)."""
from PIL import Image,ImageDraw
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
names=list(json.loads((ROOT/'scripts/character_designs.json').read_text()))
sheets=[Image.open(ROOT/'assets/characters'/f'{n}.png') for n in names]
frames=[];durations=[]
for direction,label in [(2,'FRONT'),(1,'LEFT'),(0,'BACK'),(3,'RIGHT')]:
    for f in [0,1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8]:
        im=Image.new('RGB',(920,250),'#182725');d=ImageDraw.Draw(im)
        d.text((25,18),'REFERENCE-LED HEAD REVISION / '+label,fill='#d4c697')
        for i,src in enumerate(sheets):
            cell=src.height//4
            c=src.crop((f*cell+20,direction*cell+8,f*cell+108,direction*cell+120)).resize((132,168),Image.Resampling.NEAREST)
            im.paste(c,(i*184+26,54),c);d.text((i*184+65,232),names[i],fill='#bfccb7')
        frames.append(im);durations.append(300 if f==0 else 105)
(ROOT/'release').mkdir(exist_ok=True)
frames[0].save(ROOT/'release/walk-cycle.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=True,disposal=2)
