"""Reference-led head retouching on LPC faces; hard-edged 2x pixel clusters.

The body and motion remain external LPC art. Only heads are edited here.
Unlike scaling a stock hairstyle, each silhouette and lock is authored separately.
Coordinates are in LPC's 64px world cell; the export grid is 128px. No antialiasing.
"""
from PIL import Image, ImageDraw, ImageColor, ImageChops, ImageFilter
import math
from pathlib import Path
from functools import lru_cache

SCALE=2
CELL=128
import json
DESIGNS=json.loads((Path(__file__).resolve().parents[1]/'scripts/character_designs.json').read_text())
PALETTES={name:spec['palette'] for name,spec in DESIGNS.items()}
# Closed contours, including the actual uneven lower edge of the fringe.
FRONT={
 'mie':[(21.5,27),(21,24),(21.8,23),(21,21),(22,21),(22,18.5),(23.5,17),(24,15.5),(27,14.5),(26.5,14),(30,14),(31,13.5),(34,14),(37,14.5),(39.5,16),(41,18.5),(41.5,21),(42,21.5),(41.5,26),(40.5,29),(40,25.5),(39,24.5),(38.5,26.5),(38,24),(36,27),(35.5,24.8),(34,27),(33.8,25.7),(32,28),(32,25),(30.5,27),(30,25.5),(29,27.5),(29,24.8),(27.5,27),(27,25),(25.5,28),(24.5,26),(24,29),(23,27),(22.5,28)],
 'ryoma':[(22,26),(21.5,22),(21,20),(22,20.5),(20.5,17.5),(22,18),(21.5,15.5),(23.5,16),(23.5,14),(25,15),(25.5,12.5),(27,14),(28.5,11.5),(30,13),(32,11),(33,12.5),(36,11.5),(36,13),(39,12.5),(38.5,14.5),(41,14.5),(40,16),(42,16),(41,19.5),(42,21),(40.5,26),(39.5,28),(39,24.5),(37,23),(35,23.5),(32,23),(29,23.5),(26,24.5),(24.5,26),(23.5,29),(22.5,26)],
 'rei':[(21,29),(20,26),(21,25),(19.5,23),(21,23),(20.5,20.5),(22,21),(21,18),(23,18.5),(24,16),(23,16),(26,14.5),(26,13.5),(29,14),(31,12.5),(34,13.5),(37,13),(36.5,14.5),(40,15),(39.5,16.5),(42,18),(41,19),(43,21),(42,22),(44,25),(42,24.5),(43,28),(41,27),(40,30.5),(39,28),(38,30),(37,28),(35.5,29),(34.5,27.5),(33.5,30),(32.5,28.5),(31,30.5),(30.5,28.5),(29,30),(28.5,28),(27.5,29.5),(26.5,28),(25,30.5),(24.5,28),(23,31),(22.5,28)],
 'terachi':[(21.5,30),(19.5,28),(21,27),(19,24.5),(20.5,25),(19.5,22),(21.5,22.5),(20.5,19.5),(22,20),(22.5,17.5),(24,18),(24,16),(27,16),(26,14),(29,14.5),(30,12.5),(31,11.5),(32,12),(31.5,13.5),(34,14),(35.5,13),(37,14.5),(40,14.5),(39,16),(42,17),(41,18.5),(43,20),(42,21),(44,23),(42.5,24),(44,26.5),(42,26),(42,29.5),(40.5,28),(39.5,31),(39,27.5),(37.5,28.5),(36.5,26.5),(35,28),(34,26.5),(32.5,29.5),(31.5,27.5),(30,30),(29,28),(27.5,30),(27,28.5),(25.5,31),(25,28),(24,31.5),(23,28.5),(22,31)],
 'satou':[(21,31),(20.5,28.5),(18.5,28),(20,26),(18,24.5),(20.5,24),(19,21.5),(21,22),(20.5,19),(22,20),(22,17),(24,17.5),(23.5,15),(26,15.5),(25,13.5),(28,14),(29,12),(31,13),(34,12),(33.5,13.5),(37,12.5),(36.5,14),(39.5,14.5),(38.5,16),(41,16.5),(40.5,18),(43,19),(42,20),(44,22),(42.5,23),(45,25),(42.5,25),(43.5,28),(41.5,27.5),(41.5,31),(40,29),(38.5,32),(38.5,29.5),(37,31),(36.5,29),(35,31),(34.5,29),(33,32),(32,30),(31,31.5),(30,29.5),(28.5,31),(28,29),(26.5,31.5),(26,29.5),(24.5,32.5),(24,30),(22.5,32),(22.5,29.5)],
}
# Root / control / tip / half-width, not identical parallel strokes.
LOCKS={
 'mie':[(30,15,23,16,23,26,1.6),(31,15,25,18,25.5,27,2),(32,15,28,19,28.5,26.8,1.8),(33,15,32,19,31.5,27,1.6),(34,15,36,20,34.5,26,2),(35,16,40,19,37.5,25.5,1.7),(37,17,41,22,40.5,27,1.3)],
 'ryoma':[(24,24,21.5,18,23.5,15.5,1.7),(27,23,24,17,26,13.5,1.7),(30,23,27,16,29,12.5,1.8),(33,23,31,16,32.5,12,1.6),(35,23,36,16,36.5,13,2),(38,24,40,18,40,15,1.6),(40,26,42,22,41,19,1.2)],
 'rei':[(30.5,14.5,22,17,22,28.5,2),(31,15,24,19,25,29.5,2.3),(31.5,15,27,19,28.5,29.5,2.5),(32,15,32,22,31,30,2.1),(33,15,37,20,34,29.2,2.5),(34,15,41,20,38,29,2.3),(36,16,44,22,41,28,1.9)],
 'terachi':[(30,15,21,17,22,29,2.1),(30.5,15,24,19,24.5,30,2.4),(31,15,29,20,27,30,2.5),(32,15,34,21,30.5,29.5,2.2),(33,15,39,21,34.5,27.5,2.1),(34,15,42,18,39,28,2.3),(36,16,44,22,41,29,1.6)],
 'satou':[(31,14,21,19,22.5,31,2.1),(32,14,23,20,25,31.5,2.7),(32,15,27,21,28.5,30.5,2.8),(33,15,33,22,32.5,31.5,2.3),(34,14,39,21,36,30.5,2.8),(35,15,44,22,40,31,2.4),(38,16,45,21,43,26.5,1.8)],
}
# Curved, overlapping locks distinguish the wavy and bed-head silhouettes.
LOCKS['terachi']=[(29,15,24,16,26,20,22.5,28.5,3.2),(31,14,24,18,31,23,25.5,30,3.2),(32.5,14.5,30,18,36,23,29,30,3.5),(33.5,14.5,34,18,40,22,34,28.5,3),(35,15,38,15,44,23,39.5,29,3.5)]
LOCKS['satou']=[(30,14,24,16,26,25,22.5,31,3.3),(31,14,26,18,30,25,27,31.5,3.5),(32,14,35,19,28,25,32,31.5,3.6),(33,14,30,19,41,24,36.5,31,3.2),(34,14,40,17,41,27,39.5,32,3.3),(37,15,40,14,46,20,42,27,2)]
FRONT['satou']=[(29,10.5) if (x,y)==(29,12) else (35,10.5) if (x,y)==(34,12) else (x,y) for x,y in FRONT['satou']]

# Terachi: fresh, lifted center part. Short temples; eyes and ears stay clear.
FRONT['terachi']=[(22,27),(21.5,24),(22,22),(21.5,21),(22.5,19),(24,17),(26,16),(28,15),(30.5,14.5),(32,15),(33.5,14.5),(36,15),(38,16),(40,18),(41,20),(41.5,22),(41,24),(41.5,27),(40,28.5),(39,27),(38,27.5),(37,25.5),(35.5,26.5),(34,24.5),(33,22.5),(32,23),(31,22.5),(29.5,25),(28,27),(27,26),(25.5,28),(24.5,27),(23.5,28.5),(23,26)]
LOCKS['terachi']=[(31,15.5,25,14.5,22.5,22,23.5,26.5,2.6),(31.5,16,26,16.5,24.5,23.5,26,27.5,2.8),(31.5,17,29,18,29,22.5,28,26.5,2.2),(32.5,17,35,18,35,23,36,26,2.2),(33,16,38,16,40,22,38.5,27,2.8),(33,15.5,40,16,42,22,40,26.5,2.2)]

# Individual side hairlines. The profile exposes an eye under, not above, bangs.
SIDE_FRINGE={
 'mie':[(41,27),(40,30),(37.5,30.5),(35.5,30),(35,28.5),(34,27.5),(33.5,25.5),(32,26.5),(31.5,25),(30,27),(29.5,25.5),(28,28),(27.5,25.5),(26,27.5),(25.5,25.5),(24,27.5),(23,26),(22.5,24)],
 'ryoma':[(41,27),(40,32),(37,32.5),(35,31),(34,28),(33,25),(30,23),(27,23.5),(24,24.5),(23,25),(22.5,22)],
 'rei':[(43,29),(41.5,29),(42,32),(40,31),(39,34),(37.5,33),(37,34.5),(35.5,32),(34,33),(33.5,30),(32.5,30.5),(32,28),(30.5,29.5),(30,27.5),(28.5,29.8),(28,27),(26.5,29),(26,27.5),(24.5,29.5),(24,27.5),(22.5,29),(22.5,26)],
 'terachi':[(41,27),(40,29.5),(38,31),(36,30.5),(35,29),(34,27),(33,25),(32,24),(30.5,25),(29,26.5),(27.5,27),(26,26.5),(24.5,27),(23,26),(22.5,24)],
 'satou':[(43,30.5),(41.5,30),(42,33),(40,32),(39,35),(37.5,33),(36,35),(35,32),(34,33),(33.5,30),(32,31.5),(31.5,29),(30,31.5),(29.5,29),(28,31),(27.5,29.5),(26,31),(25.5,29),(24,31),(23.5,29),(22,30),(22.5,27)]
}

def xy(points):return [(round(x*2),round(y*2)) for x,y in points]
def polygon(im,points,color):ImageDraw.Draw(im).polygon(xy(points),fill=color)
def line(im,points,color,width=1):ImageDraw.Draw(im).line(xy(points),fill=color,width=width)
def bezier(lock,t):
    if len(lock)==9:
        x0,y0,x1,y1,x2,y2,x3,y3,w=lock;u=1-t
        return (u**3*x0+3*u*u*t*x1+3*u*t*t*x2+t**3*x3,u**3*y0+3*u*u*t*y1+3*u*t*t*y2+t**3*y3)
    x0,y0,x1,y1,x2,y2,w=lock
    return ((1-t)**2*x0+2*t*(1-t)*x1+t*t*x2,(1-t)**2*y0+2*t*(1-t)*y1+t*t*y2)
def ribbon(im,lock,color):
    side1=[];side2=[]
    for i in range(33):
        t=i/32;x,y=bezier(lock,t);a=bezier(lock,max(0,t-.02));b=bezier(lock,min(1,t+.02))
        dx=b[0]-a[0];dy=b[1]-a[1];length=math.hypot(dx,dy) or 1
        width=lock[-1]*(math.sin(math.pi*t)**.7)*(.95-.45*t)
        side1.append((x-dy/length*width,y+dx/length*width));side2.append((x+dy/length*width,y-dx/length*width))
    polygon(im,side1+side2[::-1],color)

@lru_cache(maxsize=20)
def source_hair(name,direction):
    part={'mie':'plain/male/black','ryoma':'spiked/male/chestnut','rei':'bangsshort/male/black','terachi':'messy2/male/black','satou':'bangsshort/male/black'}[name]
    p=Path(__file__).resolve().parents[1]/'.work/lpc/hair'/f'{part}.png'
    im=Image.open(p).convert('RGBA').crop((0,(8+direction)*64,64,(9+direction)*64))
    return im.crop(im.getbbox())

def hair(name,direction):
    p=PALETTES[name];shape=FRONT[name];locks=LOCKS[name]
    if direction in (1,3):
        # Reuse the character's own crown contour, not another stock hairstyle.
        # Crown ends at the first return below the temple on the right.
        k=next(i for i,(x,y) in enumerate(shape) if i>len(shape)//3 and x>=40 and y>=26)
        crown=shape[:k]
        shape=crown+SIDE_FRINGE[name]
        whorl=34 if name=='ryoma' else 32
        ends=[(23,27),(26,28),(29,29),(32,29),(35,32),(38,33),(41,30)]
        if name in ('mie','terachi'):ends=[(x,y-1.5) for x,y in ends]
        if name=='satou':ends=[(x,y+1) for x,y in ends]
        locks=[(whorl,14.5,23+i*3,19+(i%2),x,y,2.1) for i,(x,y) in enumerate(ends)]
        if name=='ryoma':locks=[(25+i*2,24,25+i*2,18,24+i*2.5,13.5+i%3,1.4) for i in range(7)]
    elif direction==0:
        k=next(i for i,(x,y) in enumerate(shape) if i>len(shape)//3 and x>=40 and y>=26)
        crown=shape[:k]
        nape=32.5 if name=='terachi' else 33 if name in ('mie','ryoma') else 35
        shape=crown+[(42,28),(41,30),(40,29.5),(39,32),(38,31),(37,nape),(35.5,nape-.8),(34,nape+.5),(32,nape),(30,nape+.5),(28.5,nape-1),(27,nape),(26,32),(24.5,31),(24,29),(22,30),(22,27)]
        locks=[(32,15,23+i*3,23,23.5+i*2.8,nape-(2 if i in (0,6) else 0),2.6) for i in range(7)]
    mask=Image.new('L',(CELL,CELL));polygon(mask,shape,255)
    im=Image.new('RGBA',(CELL,CELL));polygon(im,shape,p[0])
    inside=mask.filter(ImageFilter.MinFilter(3))
    im.paste(ImageColor.getrgb(p[1])+(255,),(0,0),inside)
    # Keep the hand-shaded volume of the external LPC hair beneath the edited
    # contour/locks. This is texture retargeting, not a flat procedural wig.
    original=source_hair(name,1 if direction==3 else direction)
    b=inside.getbbox();fitted=original.resize((b[2]-b[0],b[3]-b[1]),Image.Resampling.NEAREST)
    pixels=[];lumas=[sum(c[:3])/3 for c in original.getdata() if c[3]];lo=min(lumas);hi=max(lumas)
    for r,g,bl,a in fitted.getdata():
        if not a:pixels.append((*ImageColor.getrgb(p[1]),255));continue
        t=(sum((r,g,bl))/3-lo)/(hi-lo)
        index=min(4,max(0,round(t*4)))
        pixels.append((*ImageColor.getrgb(p[index]),255))
    fitted.putdata(pixels)
    volume=Image.new('RGBA',(CELL,CELL));volume.alpha_composite(fitted,(b[0],b[1]));volume.putalpha(inside)
    im.alpha_composite(volume)
    texture=Image.new('RGBA',(CELL,CELL))
    for i,lock in enumerate(locks):
        ribbon(texture,lock,ImageColor.getrgb(p[2])+(145,))
        # Irregular short highlight clusters: avoid one glossy plastic helmet.
        pts=[bezier(lock,t/40) for t in range(11+(i%3),25-(i%2))]
        line(texture,pts,ImageColor.getrgb(p[3])+(175,),1)
        if i in (1,4):line(texture,[bezier(lock,t/40) for t in range(15,18)],p[4],1)
        edge=[(x-.7,y+.2) for x,y in [bezier(lock,t/40) for t in range(24,37)]]
        line(texture,edge,ImageColor.getrgb(p[0])+(180,),1)
    if name=='satou':
        # Small crooked strands at the whorl, not forehead-exposing center parts.
        line(texture,[(28,16),(30,14),(33,15),(34.5,17)],p[3])
        line(texture,[(29.5,17),(31.5,15.5),(34,17.5)],p[0])
    texture.putalpha(ImageChops.multiply(texture.getchannel('A'),inside));im.alpha_composite(texture)
    if direction==3:
        mirrored=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        im=Image.new('RGBA',(CELL,CELL));im.alpha_composite(mirrored,(1,0))
    return im

SKIN={(249,213,186):(234,207,190),(250,236,231):(245,224,210),(228,164,124):(218,183,163),(204,134,101):(190,150,136),(153,66,60):(146,108,103)}
def tone_skin(im,outline=False):
    colors=[]
    for r,g,b,a in im.getdata():
        rgb=SKIN.get((r,g,b),(r,g,b))
        if outline and (r,g,b)==(39,25,32):rgb=(119,92,90)
        colors.append((*rgb,a))
    im.putdata(colors);return im

def eye(im,x,y,angle=0,sleepy=False):
    # Four-world-pixel-wide, half-lidded grey eyes instead of round LPC pupils.
    polygon(im,[(x,y),(x+4,y+angle),(x+3.5,y+1.2),(x+.5,y+1.2)],'#ddd2c9')
    line(im,[(x+.2,y),(x+2,y+.3),(x+4,y+angle)],'#514a50')
    line(im,[(x+2.3,y+.5),(x+2.3,y+(1 if sleepy else 1.4))],'#4e4b56',2)
    line(im,[(x+.8,y+1.6),(x+3.5,y+1.5)],'#bd9990')

def glasses(im,direction):
    # One export-pixel-wide rims; no huge dark goggles or blue lenses.
    ink='#383438'
    if direction==2:
        for x in [24,33.5]:
            line(im,[(x,27.5),(x+6.5,27.5),(x+6,30.3),(x+1,30.3),(x,27.5)],ink)
        line(im,[(30.5,28),(33.5,28)],ink);line(im,[(22.5,27.5),(24,28)],ink);line(im,[(40,28),(41.5,27.5)],ink)
    elif direction in (1,3):
        temp=Image.new('RGBA',(CELL,CELL))
        line(temp,[(26.5,27.5),(32.5,27.5),(32,30.3),(27,30.3),(26.5,27.5)],ink)
        line(temp,[(32.5,28),(36.5,27.5),(37,28)],ink)
        if direction==3:
            other=Image.new('RGBA',(CELL,CELL));other.alpha_composite(temp.transpose(Image.Transpose.FLIP_LEFT_RIGHT),(1,0));temp=other
        im.alpha_composite(temp)

def head(name,direction,source):
    im=tone_skin(source.resize((CELL,CELL),Image.Resampling.NEAREST),True)
    if name=='terachi':
        # Remove exposed old scalp outside the new, shorter temple contour.
        px=im.load()
        for yy in range(52):
            for xx in range(CELL):
                if xx<50 or xx>=78:px[xx,yy]=(0,0,0,0)
    face=Image.new('RGBA',(CELL,CELL))
    if direction==2:
        # Replace the eye/brow area of the LPC face, preserving its ears and jaw.
        polygon(face,[(24,27),(26,26.5),(38,26.5),(40,28),(39,32.5),(25,32.5)],'#eacfbe')
        line(face,[(24,28),(25,31),(27,33)],'#dab7a3')
        line(face,[(39.5,28),(39,31),(37,33)],'#dab7a3')
        sleepy=name in ('rei','terachi','satou')
        y={'mie':28,'ryoma':28,'rei':29.5,'terachi':29.6,'satou':30.2}[name]
        eye(face,25.5,y,.5 if name=='ryoma' else .1,sleepy)
        eye(face,34.3,y+.1,-.5 if name=='ryoma' else -.3,sleepy)
        line(face,[(25.5,26.3 if name=='ryoma' else 26.8),(29,27.2 if name=='ryoma' else 26.6)],'#483230' if name=='ryoma' else '#6e5b58',2 if name=='ryoma' else 1)
        line(face,[(34.5,27.2 if name=='ryoma' else 26.8),(38,26.3 if name=='ryoma' else 26.5)],'#483230' if name=='ryoma' else '#6e5b58',2 if name=='ryoma' else 1)
        line(face,[(32.5,30.8),(32,32),(33,32)],'#bd988b')
        line(face,[(30.7,33.8),(32.5,33.5),(33.5,33.7)],'#a1847b')
    elif direction in (1,3):
        polygon(face,[(25.5,27),(33.5,27),(33.5,32.3),(26,32.5)],'#eacfbe')
        y=29 if name in ('mie','ryoma') else 29.6
        eye(face,27.5,y,-.2,name in ('rei','terachi','satou'))
        line(face,[(27.5,27.5),(31,27)],'#806761')
        line(face,[(25.5,31.5),(25,32),(26,32)],'#b89083')
        line(face,[(27,33.5),(29,33.5)],'#a1847b')
        if direction==3:
            other=Image.new('RGBA',(CELL,CELL));other.alpha_composite(face.transpose(Image.Transpose.FLIP_LEFT_RIGHT),(1,0));face=other
    im.alpha_composite(face)
    if name in ('mie','ryoma'):glasses(im,direction)
    im.alpha_composite(hair(name,direction))
    if name=='terachi':
        if direction==2:
            line(im,[(24,33.5),(25,37),(30,39),(35,38.5),(39,35)],'#202730',2)
            for x,y in [(24,34.5),(37,34)]:
                polygon(im,[(x,y+1),(x+1,y),(x+3.5,y+.5),(x+4,y+3.5),(x+3,y+5),(x+.5,y+4)],'#151c24')
                line(im,[(x+.5,y+1),(x+.5,y+3.5),(x+1.5,y+4)],'#46515c')
        elif direction in (1,3):
            x=32 if direction==1 else 28
            polygon(im,[(x,34),(x+3,34),(x+4,37),(x+2,39),(x,38)],'#19212b')
            line(im,[(x+.5,35),(x+.5,37.5),(x+1.5,38)],'#46515c')
        else:line(im,[(26,34),(31,35),(37,34)],'#202730',2)
    return im
