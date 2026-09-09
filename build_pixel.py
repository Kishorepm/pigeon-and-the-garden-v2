"""Publish the authored pixel sequel as the local/static entry point."""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent

def build():
    source = (ROOT / 'pixel.html').read_text(encoding='utf-8')
    def stamp(match):
        attr, name = match.groups()
        path = ROOT / name
        assert path.is_file(), f'Missing runtime asset: {name}'
        return f'{attr}="/{name}?v={hashlib.sha256(path.read_bytes()).hexdigest()[:10]}"'
    page = re.sub(r'(src|href)="/([^"?]+)"', stamp, source)
    (ROOT / 'index.html').write_text(page, encoding='utf-8')
    print('Built the pixel sequel: Stop 01 to Stop 02.')

if __name__ == '__main__':
    build()
