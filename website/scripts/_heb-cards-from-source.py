"""
Rebuild the hébergements type cards from the original Figma layers.

The supplied assets are the untouched photos (no copy, no scrim) at exactly the card
sizes, plus the scrim layer itself. EN/AR use these photos with the scrim reproduced in
CSS so their own copy can be rendered live; FR keeps the artboard flatten, whose copy
Figma positioned by hand per card and which therefore cannot be reproduced by a single
CSS rule. This writes the photos as heb-*-photo.jpg, prints the scrim's measured alpha
ramp as CSS stops, and checks the composite against the artboard crops to confirm the
photos and ramp really are what Figma flattened.
"""
import numpy as np
from PIL import Image
from pathlib import Path

ASSETS = Path(
    'C:/Users/youss/.cursor/projects/c-Users-youss-OneDrive-Attachments-Desktop-fi2t-live-editor/assets'
)
MEDIA = Path('public/images/groupement-media')
OUT = Path('scripts/audit-out')
OUT.mkdir(parents=True, exist_ok=True)

SRC = {
    'heb-ecolodge': 'Rectangle_44',
    'heb-maisons': 'Rectangle_58',
    'heb-insolites': 'Rectangle_60',
    'heb-habitant': 'Rectangle_59',
}
SCRIM = 'Rectangle_65'
TEXT_TOP = 205  # baked copy starts at y213; stay clear of its anti-aliasing


def load(stem: str) -> Image.Image:
    hits = list(ASSETS.glob(f'*{stem}-*.png'))
    if not hits:
        raise SystemExit(f'missing source asset {stem}')
    return Image.open(hits[0]).convert('RGBA')


def fill_corners(im: Image.Image) -> Image.Image:
    """Figma exports the rounded corners as transparent; CSS re-clips them, so extend
    the nearest opaque pixel outwards to avoid halos before flattening to JPEG."""
    a = np.asarray(im).astype(np.float32)
    rgb, alpha = a[:, :, :3].copy(), a[:, :, 3]
    for y in np.where((alpha < 250).any(axis=1))[0]:
        opaque = np.where(alpha[y] >= 250)[0]
        if not len(opaque):
            continue
        rgb[y, : opaque[0]] = rgb[y, opaque[0]]
        rgb[y, opaque[-1] + 1:] = rgb[y, opaque[-1]]
    return Image.fromarray(rgb.astype(np.uint8))


# --- scrim ramp ---
scrim = np.asarray(load(SCRIM)).astype(np.float32)
h = scrim.shape[0]
alpha = scrim[:, :, 3].mean(axis=1) / 255.0
# The layer is a flat black wash, so one colour + a per-row alpha describes it fully.
weight = scrim[:, :, 3].sum()
colour = (scrim[:, :, :3] * scrim[:, :, 3:4]).sum(axis=(0, 1)) / max(weight, 1)
print(f'scrim {scrim.shape[1]}x{h} colour=rgb({colour.round(1)}) '
      f'alpha top={alpha[0]:.3f} mid={alpha[h // 2]:.3f} bottom={alpha[-1]:.3f}')

stops = []
for pct in range(0, 101, 5):
    y = min(int(round(pct / 100 * (h - 1))), h - 1)
    stops.append(f'    rgba(0, 0, 0, {alpha[y]:.3f}) {pct}%')
print('linear-gradient(\n    180deg,\n' + ',\n'.join(stops) + '\n  )')

ramp = alpha.reshape(-1, 1, 1)

# --- photos + validation ---
for name, stem in SRC.items():
    photo = fill_corners(load(stem))
    w, ph = photo.size
    baked = Image.open(MEDIA / f'{name}.jpg').convert('RGB')
    if baked.size != (w, ph):
        raise SystemExit(f'{name}: source {photo.size} != artboard crop {baked.size}')

    arr = np.asarray(photo).astype(np.float32)
    comp = arr * (1 - ramp) + colour.reshape(1, 1, 3) * ramp
    diff = np.abs(comp[:TEXT_TOP] - np.asarray(baked).astype(np.float32)[:TEXT_TOP])
    print(f'{name}: {w}x{ph} scrim-only MAE vs artboard (above copy) = {diff.mean():.2f}')

    photo.save(MEDIA / f'{name}-photo.jpg', quality=94, optimize=True)
    Image.fromarray(comp.astype(np.uint8)).save(OUT / f'_heb-comp-{name}.png')
print('done')
