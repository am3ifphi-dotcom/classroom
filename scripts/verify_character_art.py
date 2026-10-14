"""Structural checks, not an automated claim of resemblance to the references."""
from PIL import Image
from pathlib import Path
import json,hashlib
from pixel_heads import tone_skin
root=Path(__file__).resolve().parents[1]
names=list(json.loads((root/'scripts/character_designs.json').read_text()))
cell=128;heads=[];body_checks=0
for name in names:
    master=Image.open(root/'art/heads'/f'{name}.png').convert('RGBA')
    assert master.size==(cell,4*cell)
    heads.append(hashlib.sha256(master.tobytes()).hexdigest())
    for suffix,cols in [('',9),('-cast',7)]:
        p=root/'assets/characters'/f'{name}{suffix}.png';im=Image.open(p).convert('RGBA')
        assert im.size==(cols*cell,4*cell),(p,im.size)
        baseline=root/'.work/rejected-v2'/f'{name}{suffix}.png'
        prev=Image.open(baseline).convert('RGBA') if baseline.exists() else None
        for direction in range(4):
            frames=[]
            for col in range(cols):
                f=im.crop((col*cell,direction*cell,(col+1)*cell,(direction+1)*cell))
                box=f.getbbox();assert box and box[0]>0 and box[2]<cell and box[1]>0 and box[3]<cell,(name,suffix,direction,col,box)
                # Opaque pixel clusters, no softened/partly transparent sheet seams.
                assert set(f.getchannel('A').getdata())<={0,255}
                frames.append(hashlib.sha256(f.tobytes()).hexdigest())
                if prev:
                    old=prev.crop((col*64,direction*64,(col+1)*64,(direction+1)*64))
                    expected=tone_skin(old).resize((cell,cell),Image.Resampling.NEAREST)
                    assert f.crop((0,84,128,128)).tobytes()==expected.crop((0,84,128,128)).tobytes(),(name,suffix,direction,col,'lower-body motion changed')
                    body_checks+=1
            assert len(set(frames))>=4,(name,suffix,direction,'animation lost')
    assert Image.open(root/'assets/characters'/f'{name}-portrait.png').size==(192,192)
assert len(set(heads))==5,'Duplicated character head sheets'
print('PASS: 320 frames, 40 animation directions; no empty, clipped or static animations.')
print('PASS: 5 distinct head masters; all export alpha values are 0 or 255.')
print(f'PASS: {body_checks} frames retain the external lower-body pixels/motion (with documented skin palette remap).')
