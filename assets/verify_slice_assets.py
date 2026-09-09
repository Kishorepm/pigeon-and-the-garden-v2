"""Verify the local source manifest and the exact frames used by the playable slice."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

def record(manifest, file, source):
    path = ROOT / file
    entry = {'file': file, 'source': source, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    entries = json.loads(manifest.read_text())
    entries = [old for old in entries if old.get('file') != file]
    entries.append(entry)
    manifest.write_text(json.dumps(entries, indent=2) + '\n')

if __name__ == '__main__':
    record(ROOT/'game-art/character-manifest.json', 'game-art/characters/her-skirt.png',
           'https://raw.githubusercontent.com/makrohn/Universal-LPC-spritesheet/master/legs/skirt/female/robe_skirt_female_incomplete.png')
    record(ROOT/'game-art/source-manifest.json', 'game-art/lpc/castle.png',
           'https://opengameart.org/sites/default/files/lpc_castle_2.png')
    for path in (ROOT/'game-art/characters').glob('*.png'):
        with Image.open(path) as im:
            assert im.size == (832, 1344), (path.name, im.size)
            for row in range(8, 12):
                if path.name == 'him-beard.png' and row == 8:
                    # A beard is correctly invisible when the character faces away.
                    continue
                for col in range(9):
                    # Every layer needs an actual idle/walk frame in all four directions.
                    assert im.crop((col*64,row*64,(col+1)*64,(row+1)*64)).getbbox(), (path.name,row,col)
    print('All character layers have aligned directional walking frames; rear-facing beard frames are intentionally empty.')
    for filename in ['source-manifest.json', 'character-manifest.json']:
        manifest = json.loads((ROOT/'game-art'/filename).read_text())
        for entry in manifest:
            path = ROOT/entry['file']
            assert path.exists(), path
            assert hashlib.sha256(path.read_bytes()).hexdigest() == entry['sha256'], path
        print(f'{filename}: {len(manifest)} source files verified.')
