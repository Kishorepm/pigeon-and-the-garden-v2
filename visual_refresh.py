"""Semantic presentation hooks for the existing canvas, without changing bindings.

Runs after canvas transforms. Assertions keep source changes from silently losing
the presentation layer. No runtime dependency and no client-side DOM rewriting.
"""
from html.parser import HTMLParser


class CanvasTree(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.offsets = [0]
        for line in source.splitlines(keepends=True):
            self.offsets.append(self.offsets[-1] + len(line))
        self.nodes = []
        self.stack = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        line, col = self.getpos()
        node = dict(tag=tag, attrs=dict(attrs), children=[], pos=self.offsets[line-1]+col)
        if self.stack:
            self.stack[-1]['children'].append(node)
        self.nodes.append(node)
        if tag not in {'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i]['tag'] == tag:
                del self.stack[i:]
                break


def refine(markup):
    tree = CanvasTree(markup)
    edits = []

    def hook(node, value):
        assert 'class' not in node['attrs'], 'Presentation anchor already has a class'
        edits.append((node['pos'] + len(node['tag']) + 1, f' class="{value}"'))

    chapters = {3: 'A little company', 4: 'A small correction', 7: 'A table for two',
                8: 'Make a little time', 9: 'Pick your light', 10: 'At your pace',
                11: 'Something good', 12: 'The usual order', 13: 'House rules',
                14: 'A work in progress', 15: 'An honoured guest', 16: 'The finishing touch'}
    variants = {3: 'companions', 7: 'landscapes', 8: 'calendar', 9: 'hours',
                10: 'duration', 11: 'food', 13: 'topics', 15: 'tortoise', 16: 'crowns'}
    screens = [n for n in tree.nodes if 'data-screen-label' in n['attrs']]
    assert len(screens) == 23, f'Expected 23 screens, found {len(screens)}'
    for screen in screens:
        number = int(screen['attrs']['data-screen-label'].split()[0])
        if number in variants:
            hook(screen, 'garden-screen' + (' choice-screen choice-' + variants[number] if number in variants else ''))
            heading = next((c for c in screen['children'] if any(k['tag'] == 'h1' for k in c['children'])), None)
            assert heading, f'Screen {number} lost its heading'
            hook(heading, 'garden-heading')
            edits.append((heading['pos'] + len(heading['tag']) + 1, f' data-chapter="{chapters[number]}"'))
            for child in screen['children']:
                if child['tag'] == 'p':
                    hook(child, 'garden-subtitle')
                buttons = [k for k in child['children'] if k['tag'] == 'button']
                if number in variants and buttons:
                    if len(buttons) >= 3:
                        hook(child, 'choice-tray')
                        for button in buttons:
                            hook(button, 'garden-choice')
                    else:
                        hook(child, 'choice-footer')
        if number == 17:
            hook(screen, 'decree-screen')
        if number in (5, 18):
            panel = screen['children'][-1]
            assert any(c['tag'] == 'button' for c in panel['children']), 'Map lost its closing panel'
            hook(panel, 'map-caption')
    curtain = next(n for n in tree.nodes if n['attrs'].get('id') == 'curtain')
    note = next(c for c in curtain['children'] if '--noteH:' in c['attrs'].get('style', ''))
    hook(note, 'opening-note')
    for pos, value in sorted(edits, reverse=True):
        markup = markup[:pos] + value + markup[pos:]
    return markup
