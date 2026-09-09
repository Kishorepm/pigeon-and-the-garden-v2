"""Encode the approved generated artwork for local, dependency-free delivery."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Nexdo\.codex\generated_images\01a07f1d-1169-7d01-867f-22a50ca82c11')
ART = {
    'garden': 'exec-6ed7f51a-de56-4e49-9f86-e8dde393d6d7.png',
    'bridge': 'exec-184b3c8e-3ec5-4257-8a25-48c87df9ac4a.png',
    'table': 'exec-b875ddd6-06b9-4107-9f21-b8d0d8f799f6.png',
    'indoor': 'exec-0f1fdf4f-a592-4243-a6df-174d7c46e6ad.png',
    'pigeon': 'exec-2f47688d-36f7-4b16-b96a-278f8f992749.png',
}
(ROOT / 'scenery').mkdir(exist_ok=True)
for name, file in ART.items():
    image = Image.open(SOURCE / file)
    image.save(ROOT / 'scenery' / (name + '.webp'), 'WEBP', quality=82, method=6)
    print(name, image.size, image.mode, (ROOT / 'scenery' / (name + '.webp')).stat().st_size)
    if name == 'pigeon':
        assert image.mode == 'RGBA' and image.getextrema()[3][0] == 0, 'Pigeon must have transparency'
