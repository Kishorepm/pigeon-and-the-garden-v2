"""Fetch only the public, attributed LPC assets used by the slice."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
 'terrain': 'Terrain/terrain_spring.png',
 'trees': 'Terrain/trees_spring.png',
 'plants': 'Terrain/plants_spring.png',
 'flowers': 'Terrain/flowers.png',
 'wildflowers': 'Terrain/wildflowers_spring.png',
 'rocks': 'Terrain/Rocks, Grasslands.png',
 'cliffs': 'Terrain/cliff_spring.png',
 'bridge': 'Structure/Bridges/Wood Bridge A - Rails.png',
 'bridge-floor': 'Structure/Bridges/Wood Bridge A - No Rails.png',
 'walls': 'Structure/Walls/Jagged Stone Walls.png',
 'roof': 'Structure/Roofing/Gable Shingle Roof A.png',
 'doors': 'Structure/Doors/64x64px Arched Doors/Arched Double Doors A.png',
 'doorframe': 'Structure/Doors/64x64px Arched Doors/Arched Doorway A.png',
 'fence': 'Structure/Fences/Plain Fence A.png',
 'signs': 'Structure/Signs/Sign Backgrounds A.png',
 'floor': 'Structure/Floor/Tile B.png',
 'trellis': 'Structure/Misc/Trellis A.png',
 'baskets': 'Objects/Small Items/Baskets A.png',
 'barrels': 'Objects/Furniture/Barrel.png',
 'crates': 'Objects/Furniture/Crate.png',
 'ladder': 'Objects/Furniture/Ladder.png',
 'lumber': 'Objects/Small Items/Lumber.png',
 'table': 'Objects/Furniture/Table, Rough Wood.png',
 'flowerpots': 'Objects/Small Items/Flowers.png',
 'lamps': 'Objects/Furniture/Lighting, Outdoors.png',
}
CREDITS=['Credits.txt','Terrain/Credits.txt','Structure/Bridges/Credits.txt','Structure/Walls/Credits.txt','Structure/Roofing/Credits.txt','Structure/Doors/Credits.txt','Structure/Fences/Credits.txt','Structure/Signs/Credits.txt','Structure/Floor/Credits.txt','Structure/Misc/Credits.txt','Objects/Small Items/Credits.txt','Objects/Furniture/Credits.txt']
BASE='https://raw.githubusercontent.com/ElizaWy/LPC/main/'

def fetch(item):
 name,path=item
 url=BASE+quote(path,safe='/')
 target=ROOT/'game-art'/('credits' if name.startswith('credit-') else 'lpc')/(name+('.txt' if name.startswith('credit-') else '.png'))
 data=urlopen(Request(url,headers={'User-Agent':'Garden-Slice-Asset-Fetch'}),timeout=40).read()
 target.write_bytes(data)
 return {'file':str(target.relative_to(ROOT)).replace('\\','/'),'source':url,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}

if __name__=='__main__':
 items=list(SOURCES.items())+[(f'credit-{i:02d}',p) for i,p in enumerate(CREDITS)]
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
  manifest=list(executor.map(fetch,items))
 (ROOT/'game-art'/'source-manifest.json').write_text(json.dumps(manifest,indent=2))
 print(f'Fetched {len(manifest)} attributed assets and credit files.')
