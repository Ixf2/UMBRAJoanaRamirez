"""Package the manual and an explicit source-only project snapshot."""
from hashlib import sha256
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'documentacion'
manifest = json.loads((OUT / 'manifiesto.json').read_text(encoding='utf-8'))
archive_path = OUT / 'UMBRA-documentacion-y-codigo.zip'
originals = {entry['path'] for entry in manifest['files']}
originals.add('package-lock.json')
originals.update(path.relative_to(ROOT).as_posix() for path in (ROOT / 'public').rglob('*') if path.is_file())
documentation_tools = [
    'contenido_manual.json', 'generar_manual.py', 'exportar_pdf.mjs',
    'verificar_manual.py', 'empaquetar_manual.py', 'manifiesto.json', 'verificacion.json', 'LEEME.md',
]
entries = {}
for relative in originals:
    path = (ROOT / relative).resolve()
    assert path.is_relative_to(ROOT), relative
    entries[f'codigo/{relative}'] = path
for name in documentation_tools:
    entries[f'codigo/documentacion/{name}'] = OUT / name
for name in ['UMBRA-manual-completo.pdf', 'UMBRA-manual-completo.html', 'LEEME.md', 'manifiesto.json', 'verificacion.json']:
    entries[name] = OUT / name

with ZipFile(archive_path, 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for name, path in sorted(entries.items()):
        archive.write(path, name)

with ZipFile(archive_path) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(entries)
    for entry in manifest['files']:
        original = (ROOT / entry['path']).read_bytes()
        assert sha256(original).hexdigest() == entry['sha256'], entry['path']
        assert archive.read(f'codigo/{entry["path"]}') == original, entry['path']
    assert archive.read('UMBRA-manual-completo.pdf') == (OUT / 'UMBRA-manual-completo.pdf').read_bytes()
    assert not any('/node_modules/' in name or '/.git/' in name or '/dist/' in name for name in archive.namelist())

print(json.dumps({'archive': str(archive_path), 'entries': len(entries), 'bytes': archive_path.stat().st_size, 'verified_source_files': len(manifest['files'])}, ensure_ascii=True))
