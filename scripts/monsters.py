"""Flying correction sheets, derived from NettySvit's CC0 school-paper sprite.
No skeletons. Recolor, page flex, drift, stamped cross and small particle accents
are project edits. External texture is retained, rather than a blank rectangle.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageColor
import math
ROOT=Path(__file__).resolve().parents[1]
source=Image.open(ROOT/'assets/tiles/CoolSchool_tileset.png').convert('RGBA').crop((290,541,327,574))
source=source.crop(source.getbbox())
palette=['#777477','#a6a1a0','#cec8bd','#e9e3d2','#fff7e0']
pixels=[]
for r,g,b,a in source.getdata():
    if not a:pixels.append((0,0,0,0));continue
    t=(r*.3+g*.59+b*.11-85)/140;rgb=ImageColor.getrgb(palette[max(0,min(4,round(t*4)))])
    pixels.append((*rgb,255))
source.putdata(pixels)
# Red correction mark on the existing sheet cluster (a small custom overlay).
d=ImageDraw.Draw(source);d.line((10,7,21,17),fill='#9e3f4d',width=3);d.line((10,17,21,6),fill='#b75459',width=3)
p=ROOT/'assets/monsters';p.mkdir(exist_ok=True)
for name,cols in [('walk',9),('cast',7)]:
    sheet=Image.new('RGBA',(cols*64,256))
    for direction in range(4):
        for i in range(cols):
            phase=(max(0,i-1)/(cols-1))*math.tau if name=='walk' else i/cols*math.tau
            flex=math.sin(phase);frame=Image.new('RGBA',(64,64))
            page=source.resize((36+round(2*flex),22+round(3*math.cos(phase))),Image.Resampling.NEAREST)
            if direction==1:page=page.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            angle=round(6*flex+[-4,-9,2,9][direction])
            if name=='cast':angle+=round(12*math.sin(phase));page=page.resize((page.width+4,page.height+2),Image.Resampling.NEAREST)
            page=page.rotate(angle,Image.Resampling.NEAREST,expand=True)
            frame.alpha_composite(page,((64-page.width)//2,23+round(flex*2)))
            # A few solid chalk flakes fall from the folded letters.
            d=ImageDraw.Draw(frame)
            for k in range(3):
                x=20+k*11+round(math.sin(phase+k)*2);y=49+(i+k*2)%7
                d.rectangle((x,y,x+1,y+1),fill='#d4ccbc')
            sheet.alpha_composite(frame,(i*64,direction*64))
    sheet.save(p/f'correction-{name}.png')
for old in p.glob('chalk-*.png'):old.unlink()
(p/'LICENSE.txt').write_text('Correction-sheet enemy textures: CC0 1.0.\nBased on Cool School by NettySvit: https://opengameart.org/content/cool-school-tileset\nSource crop: ../tiles/CoolSchool_tileset.png at (290,541,37,33).\nModifications: recoloring, page flex/rotation, red correction cross, chalk flakes.\nThe project additions to these two PNGs are also dedicated under CC0 1.0.\nSee ../../CREDITS.md. No skeleton images are included in the current build.\n')
print('Exported 64 opaque-cluster animated correction-sheet poses from the CC0 school-paper texture.')
