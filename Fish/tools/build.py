"""Create the upload ZIP. No dependencies and no compilation required."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
dist.mkdir(exist_ok=True)
archive = dist / 'lovi-moment-yandex.zip'
files = [root / 'index.html', root / 'styles.css']
files.extend(sorted((root / 'src').glob('*.js')))
files.extend(sorted(p for p in (root / 'assets').rglob('*') if p.is_file()))
with ZipFile(archive, 'w', ZIP_DEFLATED) as output:
    for path in files:
        output.write(path, path.relative_to(root).as_posix())
with ZipFile(archive) as output:
    assert 'index.html' in output.namelist()
    assert output.testzip() is None
print(f'Built {archive} ({archive.stat().st_size:,} bytes, {len(files)} files)')
