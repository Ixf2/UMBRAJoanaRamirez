"""Verify source coverage and extract text from this Chrome-generated PDF."""
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import zlib
from lxml import html

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'documentacion'
pdf = (OUT / 'UMBRA-manual-completo.pdf').read_bytes()
manifest = json.loads((OUT / 'manifiesto.json').read_text(encoding='utf-8'))
document = html.parse(str(OUT / 'UMBRA-manual-completo.html'))
for file in manifest['files']:
    original = (ROOT / file['path']).read_bytes()
    assert sha256(original).hexdigest() == file['sha256'], file['path']
    nodes = document.xpath('//div[@data-source-path=$path]//span[@class="source-text"]', path=file['path'])
    actual = [node.text_content().replace('\u200b', '') for node in nodes]
    assert actual == original.decode('utf-8').splitlines(), file['path']

# Chrome uses uncompressed indirect dictionaries and Flate content streams here.
objects = {int(match.group(1)): match.group(2) for match in re.finditer(rb'(?m)^(\d+) 0 obj\s*\n(.*?)(?=\nendobj)', pdf, re.S)}
def stream(number):
    header, data = objects[number].split(b'stream\n', 1)
    raw = data.rsplit(b'\nendstream', 1)[0]
    return zlib.decompress(raw) if b'/FlateDecode' in header else raw

font_maps = {}
for number, data in objects.items():
    reference = re.search(rb'/ToUnicode (\d+) 0 R', data)
    if not reference:
        continue
    cmap = stream(int(reference.group(1)))
    mapping = {}
    for block in re.findall(rb'beginbfchar\s*(.*?)endbfchar', cmap, re.S):
        for key, value in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
            mapping[int(key, 16)] = bytes.fromhex(value.decode()).decode('utf-16-be')
    for block in re.findall(rb'beginbfrange\s*(.*?)endbfrange', cmap, re.S):
        for start, end, base in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
            for key in range(int(start, 16), int(end, 16) + 1):
                mapping[key] = chr(int(base, 16) + key - int(start, 16))
    font_maps[number] = mapping

catalog_id, catalog = next((number, data) for number, data in objects.items() if data.startswith(b'<</Type /Catalog'))
pages_id = int(re.search(rb'/Pages (\d+) 0 R', catalog).group(1))
def pages_under(number):
    data = objects[number]
    if re.search(rb'/Type /Page\b', data):
        return [number]
    kids = re.search(rb'/Kids \[(.*?)\]', data, re.S).group(1)
    return [page for child in re.findall(rb'(\d+) 0 R', kids) for page in pages_under(int(child))]

page_ids = pages_under(pages_id)
texts = []
for number in page_ids:
    data = objects[number]
    fonts = {name: int(ref) for name, ref in re.findall(rb'/(F\d+) (\d+) 0 R', data)}
    contents = stream(int(re.search(rb'/Contents (\d+) 0 R', data).group(1)))
    font = None
    parts = []
    for match in re.finditer(rb'/(F\d+) [-\d.]+ Tf|<([0-9A-Fa-f]+)>\s*Tj|\bET\b', contents):
        if match.group(1):
            font = fonts.get(match.group(1))
        elif match.group(2):
            value = match.group(2).decode()
            parts.append(''.join(font_maps.get(font, {}).get(int(value[i:i+4], 16), '\ufffd') for i in range(0, len(value), 4)))
        else:
            parts.append('\n')
    texts.append(''.join(parts))

compact = ''.join(''.join(texts).split())
missing = []
for file in manifest['files']:
    for number, line in enumerate((ROOT / file['path']).read_text(encoding='utf-8').splitlines(), 1):
        # UTF-8 BOM is preserved in the original files/HTML but has no visible glyph in a PDF.
        token = ''.join(line.replace('\ufeff', '').split())
        if token and token not in compact:
            missing.append({'file': file['path'], 'line': number, 'text': line[:180]})

verification = json.loads((OUT / 'verificacion.json').read_text(encoding='utf-8'))
verification.update({
    'exact_html_source_match': True,
    'source_files_hashes_match': True,
    'pdf_text_characters': sum(len(text) for text in texts),
    'pdf_missing_source_lines': len(missing),
    'nonprinting_bom_ignored_in_text_check': True,
})
(OUT / 'verificacion.json').write_text(json.dumps(verification, ensure_ascii=False, indent=2), encoding='utf-8')
temp = Path(os.environ['TEMP'])
(temp / 'umbra-pdf-texto.txt').write_text('\n\n'.join(f'PÁGINA {i+1}\n{text}' for i, text in enumerate(texts)), encoding='utf-8')

# Single-page copies allow visual checks with an Inkscape build that imports page 1 only.
previous_xref = int(re.search(rb'startxref\s*(\d+)\s*%%EOF\s*$', pdf).group(1))
size = max(objects) + 1
for desired in [1, 4, 25, 30, 60, len(page_ids)]:
    page_id = page_ids[desired - 1]
    new_page = re.sub(rb'/Parent \d+ 0 R', f'/Parent {pages_id} 0 R'.encode(), objects[page_id])
    updates = {page_id: new_page, pages_id: f'<</Type /Pages /Count 1 /Kids [{page_id} 0 R]>>'.encode()}
    result = bytearray(pdf)
    offsets = {}
    for object_id, body in updates.items():
        offsets[object_id] = len(result)
        result.extend(f'\n{object_id} 0 obj\n'.encode() + body + b'\nendobj\n')
    xref_offset = len(result)
    result.extend(b'xref\n')
    for object_id in sorted(offsets):
        result.extend(f'{object_id} 1\n{offsets[object_id]:010d} 00000 n \n'.encode())
    result.extend(f'trailer\n<</Size {size} /Root {catalog_id} 0 R /Prev {previous_xref}>>\nstartxref\n{xref_offset}\n%%EOF\n'.encode())
    (temp / f'umbra-manual-pagina-{desired}.pdf').write_bytes(result)

print(json.dumps({'pages': len(page_ids), 'text_characters': verification['pdf_text_characters'], 'missing_source_lines': missing[:20]}, ensure_ascii=True))
assert not missing, 'Some source lines are missing from the extracted PDF text.'
