"""Download aligned, licensed LPC character layers without modifying their pixels."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen
ROOT=Path(__file__).resolve().parent.parent
BASE='https://raw.githubusercontent.com/makrohn/Universal-LPC-spritesheet/master/'
FILES={
 'her-body':'body/female/light.png',
 'her-dress':'torso/robes_female_no_th-sh/forest green.png',
 'her-skirt':'legs/skirt/female/robe_skirt_female_incomplete.png',
 'her-shoes':'feet/shoes/female/brown_shoes_female.png',
 'her-hair':'hair/female/long/brown.png',
 'him-body':'body/male/dark2.png',
 'him-legs':'legs/armor/male/metal_pants_male.png',
 'him-shoes':'feet/shoes/male/brown_shoes_male.png',
 'him-chest':'torso/plate/chest_male.png',
 'him-arms':'torso/plate/arms_male.png',
 'him-hair':'hair/male/messy1/black.png',
 'him-beard':'facial/male/beard/black.png',
}
def fetch(item):
 name,path=item;data=urlopen(BASE+quote(path,safe='/'),timeout=40).read()
 target=ROOT/'game-art'/'characters'/(name+'.png');target.write_bytes(data)
 return {'file':str(target.relative_to(ROOT)).replace('\\','/'),'source':BASE+quote(path,safe='/'),'sha256':hashlib.sha256(data).hexdigest()}
if __name__=='__main__':
 (ROOT/'game-art'/'characters').mkdir(exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:manifest=list(pool.map(fetch,FILES.items()))
 for name in ['AUTHORS.txt','cc-by-sa-3.0.txt']:
  (ROOT/'game-art'/'credits'/('characters-'+name)).write_bytes(urlopen(BASE+name,timeout=30).read())
 (ROOT/'game-art'/'character-manifest.json').write_text(json.dumps(manifest,indent=2))
 print(f'Fetched {len(FILES)} aligned character layers and original attribution/licence.')
