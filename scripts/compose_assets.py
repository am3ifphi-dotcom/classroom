"""Composite external LPC motion with individually retouched, reference-led heads.
Source body frames are 64px, exported losslessly at 2x for finer head detail.
Head anchors are read from every source frame; feet/world/collision size stay fixed.
"""
from PIL import Image, ImageEnhance, ImageDraw
from pathlib import Path
import json
from pixel_heads import head, tone_skin, CELL
ROOT=Path(__file__).resolve().parents[1]
P=ROOT/'.work/lpc';A=ROOT/'assets'
DESIGNS=json.loads((ROOT/'scripts/character_designs.json').read_text())
COMMON=['body/bodies/male/light','legs/formal/male/navy','feet/shoes/male/black','torso/clothes/longsleeve/formal/male/white','torso/jacket/collared/male/navy','neck/tie/necktie/male/maroon']
def load(part):return Image.open(P/(part+'.png')).convert('RGBA').crop((0,0,832,1344))
def crop(sheet,col,row):return sheet.crop((col*64,row*64,col*64+64,row*64+64))
BASE=Image.new('RGBA',(832,1344))
for part in COMMON:
    layer=load(part)
    if part.startswith('body/'):layer=tone_skin(layer)
    if 'navy' in part:
        alpha=layer.getchannel('A');layer=ImageEnhance.Color(layer).enhance(.5)
        layer=ImageEnhance.Brightness(layer).enhance(.86);layer.putalpha(alpha)
    BASE.alpha_composite(layer)
HEAD=load('head/heads/human/male/light')
master_dir=ROOT/'art/heads';master_dir.mkdir(parents=True,exist_ok=True)
for name in DESIGNS:
    canonical=[crop(HEAD,0,8+d) for d in range(4)]
    heads=[head(name,d,canonical[d]) for d in range(4)]
    master=Image.new('RGBA',(CELL,CELL*4))
    for d,h in enumerate(heads):master.alpha_composite(h,(0,d*CELL))
    master.save(master_dir/f'{name}.png')
    outputs={}
    for animation,rows,cols in [('walk',range(8,12),9),('cast',range(0,4),7)]:
        sheet=Image.new('RGBA',(cols*CELL,4*CELL))
        for direction,row in enumerate(rows):
            refbox=canonical[direction].getbbox()
            for col in range(cols):
                frame=crop(BASE,col,row).resize((CELL,CELL),Image.Resampling.NEAREST)
                hb=crop(HEAD,col,row).getbbox()
                if not hb:raise ValueError(f'Missing LPC head anchor: {animation} {direction} {col}')
                dx=(hb[0]-refbox[0])*2;dy=(hb[1]-refbox[1])*2
                frame.alpha_composite(heads[direction],(dx,dy))
                sheet.alpha_composite(frame,(col*CELL,direction*CELL))
        outputs[animation]=sheet
        sheet.save(A/'characters'/f"{name}{'-cast' if animation=='cast' else ''}.png")
    outputs['walk'].crop((0,2*CELL,CELL,3*CELL)).resize((192,192),Image.Resampling.NEAREST).save(A/'characters'/f'{name}-portrait.png')
    original=next((ROOT/'google_drive').glob('chr_'+name+'_01_*.png'),None)
    if original:
        ref=Image.open(original).convert('RGBA');x,y,right,bottom=ref.getbbox()
        ref=ref.crop((x,y,right,y+int((bottom-y)*.36)));ref.thumbnail((280,300))
        (A/'portraits').mkdir(exist_ok=True);ref.save(A/'portraits'/f'{name}.png')
src=Image.open(A/'tiles/CoolSchool_tileset.png').convert('RGBA')
rgb=ImageEnhance.Brightness(ImageEnhance.Color(src.convert('RGB')).enhance(.46)).enhance(.87)
result=rgb.convert('RGBA');result.putalpha(src.getchannel('A'));result.save(A/'tiles/school.png')

# Four views at the same world scale for visual inspection.
out=Image.new('RGB',(1200,1040),'#263734');d=ImageDraw.Draw(out)
for i,name in enumerate(DESIGNS):
    sheet=Image.open(A/'characters'/f'{name}.png')
    for j,direction in enumerate([2,1,3,0]):
        f=sheet.crop((20,direction*CELL+8,108,direction*CELL+120)).resize((176,224),Image.Resampling.NEAREST)
        out.paste(f,(i*240+32,j*252),f)
    d.text((i*240+90,1018),name,fill='#efdfb5')
(ROOT/'.work').mkdir(exist_ok=True);out.save(ROOT/'.work/heads-rebuilt.png')
print('Composited 320 frames at 128px with reference-led head edits; body motion and 64px world size retained.')
