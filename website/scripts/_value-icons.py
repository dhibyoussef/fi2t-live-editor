"""
Re-cut the hébergements "valeurs" icons from the artboard.

The shipped 56px crops were square slices of a 64px disc, so the disc was clipped flat at
the bottom and the glyph sat off-centre. Each icon is a flat light disc with a
single-colour line glyph, so the disc belongs in CSS: this writes the full 64x64 tile with
only the glyph painted (alpha solved along the disc→glyph colour line), which keeps the
glyph exactly where Figma put it instead of assuming it is centred.
"""
import numpy as np
from PIL import Image
from pathlib import Path
import glob

REF = glob.glob('public/design-refs/H*bergements Alternatifs touristiques.png')[0]
OUT = Path('public/images/groupement-media')
DISCS = {'durabilite': 141, 'authenticite': 469, 'interaction': 782, 'impact': 1049}
DISC_Y, SIZE = 1627, 64

art = np.asarray(Image.open(REF).convert('RGB')).astype(np.float32)
tiles = {n: art[DISC_Y:DISC_Y + SIZE, x:x + SIZE] for n, x in DISCS.items()}

# Disc fill: the modal colour across all four tiles. Glyph: the most saturated pixels.
stack = np.concatenate([t.reshape(-1, 3) for t in tiles.values()])
corner = np.concatenate([t[2:8, 26:38].reshape(-1, 3) for t in tiles.values()])
bg = np.median(corner, axis=0)
sat = stack[:, 1] - stack[:, 0]  # disc fill is near-neutral, the ink is strongly teal
glyph = np.median(stack[sat > 60], axis=0)
print(f'disc fill  rgb({bg.round().astype(int)})')
print(f'glyph ink  rgb({glyph.round().astype(int)})')

axis = glyph - bg
denom = float(axis @ axis)
for name, tile in tiles.items():
    alpha = np.clip(((tile - bg) @ axis) / denom, 0, 1)
    rgba = np.zeros((SIZE, SIZE, 4), np.uint8)
    rgba[:, :, :3] = glyph.round().astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).round().astype(np.uint8)
    ys, xs = np.where(alpha > 0.15)
    print(f'{name}: glyph bbox x{xs.min()}..{xs.max()} y{ys.min()}..{ys.max()} '
          f'within the {SIZE}px disc')
    Image.fromarray(rgba).save(OUT / f'heb-value-{name}.png', optimize=True)

# Contact sheet on the measured disc fill for review.
sheet = Image.new('RGB', (SIZE * 4 + 30 * 3, SIZE), 'white')
for i, name in enumerate(DISCS):
    disc = Image.new('RGB', (SIZE, SIZE), tuple(bg.round().astype(int)))
    icon = Image.open(OUT / f'heb-value-{name}.png')
    disc.paste(icon, (0, 0), icon)
    sheet.paste(disc, (i * (SIZE + 30), 0))
sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(
    'scripts/audit-out/_value-icons-zoom.png'
)
print('done')
