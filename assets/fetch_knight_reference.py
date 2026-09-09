"""Fetch original LPC variants for the user's approved character appearance."""
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://raw.githubusercontent.com/makrohn/Universal-LPC-spritesheet/master/'
FILES = {
    'assets/slice-source/skin-dark.png': 'body/male/dark.png',
    'assets/slice-source/skin-dark2.png': 'body/male/dark2.png',
    'assets/slice-source/skin-tanned2.png': 'body/male/tanned2.png',
    'game-art/characters/him-hair.png': 'hair/male/messy1/black.png',
    'game-art/characters/him-beard.png': 'facial/male/beard/black.png',
}
if __name__ == '__main__':
    manifest_path = ROOT/'game-art/character-manifest.json'
    manifest = json.loads(manifest_path.read_text())
    for file, source in FILES.items():
        data = urlopen(BASE + source, timeout=30).read()
        (ROOT/file).write_bytes(data)
        if file.startswith('game-art/'):
            manifest = [entry for entry in manifest if entry['file'] != file]
            manifest.append({'file': file, 'source': BASE+source, 'sha256': hashlib.sha256(data).hexdigest()})
        print(file)
    manifest_path.write_text(json.dumps(manifest, indent=2)+'\n')
