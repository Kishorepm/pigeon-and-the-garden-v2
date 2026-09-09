"""Generate local-only screen previews, with all notifications disabled."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
out = ROOT / '.local-review'
out.mkdir(exist_ok=True)
page = (ROOT / 'index.html').read_text(encoding='utf-8')
script = (ROOT / 'script.js').read_text(encoding='utf-8')
script, count = re.subn(r'(function tell\([^)]*\) \{)', r'\1 return; // Local preview: never send notifications.\n', script)
assert count == 1
script = script.replace('opened: false', 'opened: true')
script = script.replace('applyDawn(DAWN_FROM);', 'applyLight(lightAt(state.i));')
links = []
for screen in range(23):
    preview_script = script.replace('i: 0,', f'i: {screen},', 1)
    preview = re.sub(r'<script src="[^\"]*script.js[^\"]*"></script>',
                     lambda _: '<script>' + preview_script + '</script>', page)
    assert preview != page
    (out / f's{screen}.html').write_text(preview, encoding='utf-8')
    links.append(f'<a href="s{screen}.html">Screen {screen:02}</a>')
(out / 'index.html').write_text('<!doctype html><title>Local screen previews</title><h1>Stop 02 screen previews</h1><p>Local review only. Notifications are disabled.</p><nav style="display:grid;gap:16px">' + ''.join(links) + '</nav>', encoding='utf-8')
print('Generated 23 local previews; notifications disabled.')
