from fetch_assets import fetch
from concurrent.futures import ThreadPoolExecutor
files={
'Structure/Floor/Wood Floor A.png':'wood.png',
'Structure/Floor/Tile A.png':'tile.png',
'Structure/Floor/Herringbone A.png':'parquet.png',
'Structure/Walls/Painted Walls.png':'walls.png',
'Objects/Furniture/Planter.png':'plants.png',
'Objects/Furniture/Vending Machine.png':'vending.png',
'Objects/Furniture/Shelf.png':'shelf.png',
'Objects/Furniture/Clock, Grandfather.png':'clock.png',
'Objects/Furniture/Desk, Office.png':'desk.png',
'Objects/Furniture/Copy Machine.png':'copier.png',
'Objects/Furniture/Credits.txt':'furniture-credits.txt',
'Structure/Floor/Credits.txt':'floor-credits.txt',
'Structure/Walls/Credits.txt':'wall-credits.txt',
'Credits.txt':'eliza-credits.txt',
'README.md':'eliza-README.md'
}
with ThreadPoolExecutor(max_workers=5) as ex:
 for f in [ex.submit(fetch,'ElizaWy/LPC',p,('assets/licenses/' if n.endswith(('.md','.txt')) else 'assets/tiles/')+n) for p,n in files.items()]:f.result()
