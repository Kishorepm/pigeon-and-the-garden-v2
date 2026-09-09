"""Fetch the original licensed LPC pet sheets selected from their source pages."""
import hashlib, json
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import urlopen
from urllib.parse import urljoin, unquote
ROOT=Path(__file__).resolve().parent.parent
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.urls=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a': self.urls.extend(v for k,v in attrs if k=='href')
SOURCES=[('https://opengameart.org/content/lpc-cats-and-dogs',{'cat_0.png':'cats.png','dog_2.png':'dogs.png'},'bluecarrot16'),('https://opengameart.org/content/lpc-style-farm-animals',{'chicken_walk.png':'hens.png','chicken_eat.png':'hens-eat.png'},'Daniel Eddeland')]
if __name__=='__main__':
    (ROOT/'game-art/pets').mkdir(exist_ok=True)
    manifest=[]
    for page,wanted,author in SOURCES:
        parser=Links();parser.feed(urlopen(page,timeout=30).read().decode())
        for basename,filename in wanted.items():
            matches=[urljoin(page,u) for u in parser.urls if unquote(u).split('/')[-1]==basename and '/files/' in u]
            assert matches,(page,basename)
            url=matches[0];data=urlopen(url,timeout=30).read();file='game-art/pets/'+filename;(ROOT/file).write_bytes(data)
            manifest.append({'file':file,'source':url,'page':page,'author':author,'license':'CC-BY-3.0','sha256':hashlib.sha256(data).hexdigest()});print(file)
    (ROOT/'game-art/pets/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')

