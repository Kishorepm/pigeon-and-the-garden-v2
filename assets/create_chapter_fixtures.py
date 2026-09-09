"""Generate local-only browser fixtures without touching the live chapter configuration."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
out=ROOT/'.local-review';out.mkdir(exist_ok=True)
source=(ROOT/'slice.html').read_text(encoding='utf-8')
for stage in ['proposed','completed']:
    config={'revision':'browser-test-'+stage,'stage':stage,'itinerary':{'venue':'Test Garden Cafe','address':'Sample address for browser verification','day':'2026-09-19','time':'2:00 pm','meeting':'I will meet you at the entrance.','note':'Food and two iced drinks.'},'memory':'A test memory for the completed chapter.'}
    (out/(stage+'-plan.json')).write_text(json.dumps(config),encoding='utf-8')
    page=source.replace('<html lang="en">','<html lang="en" data-chapter-storage="kingdom-later-review" data-chapter-config="/.local-review/'+stage+'-plan.json">').replace('<head>','<head><base href="/">')
    (out/(stage+'.html')).write_text(page,encoding='utf-8')
print('Created two local-only chapter fixtures.')
