"""Build the approved connected-world invitation without touching Stop 01 outside this worktree."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def build():
    config=json.loads((ROOT/'chapter-plan.json').read_text(encoding='utf-8-sig'))
    assert config['stage'] in ['inviting','proposed','completed'], 'Unknown chapter stage'
    if config['stage']!='inviting':
        assert config.get('itinerary') and all(config['itinerary'].get(k) for k in ['venue','day','time']), 'A later stage needs real itinerary details'
    page=(ROOT/'slice.html').read_text(encoding='utf-8-sig')
    assert 'chapter-story.js' in page and 'chapter-world.js' in page
    for file in ['chapter-model.js','chapter-cinema.js','chapter-world.js','chapter-story.js','slice-world.js','slice.css','vendor/phaser-3.90.0.min.js']:
        assert (ROOT/file).is_file(), file
    (ROOT/'index.html').write_text(page,encoding='utf-8')
    print('Built the connected Stop 02 journey. Chapter stage: '+config['stage'])
if __name__=='__main__':build()
