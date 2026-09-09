"""Build the illustrated second chapter. No deploy-time dependencies."""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent

def build():
    source = (ROOT / 'journey.html').read_text(encoding='utf-8')
    def stamp(match):
        attribute, name = match.groups()
        file = ROOT / name
        assert file.is_file(), f'Missing chapter asset: {name}'
        digest = hashlib.sha256(file.read_bytes()).hexdigest()[:10]
        return f'{attribute}="/{name}?v={digest}"'
    output = re.sub(r'(src|href|data-src)="/([^"?]+)"', stamp, source)
    assert '<main id="chapter"' in output and 'journey.js?v=' in output
    (ROOT / 'index.html').write_text(output, encoding='utf-8')
    print('Built the illustrated Stop 02 chapter with local, content-hashed assets.')

if __name__ == '__main__':
    build()
