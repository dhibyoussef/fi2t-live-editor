"""Strip the Figma-baked FR title from the three desert-artboard hero banners.

FR keeps the original flattened artboard (pixel-exact vs the design); EN/AR get
these cleaned photos with a live HTML title rendered on top.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

try:
    import cv2
except ImportError:
    cv2 = None

SOURCES = {
    'tourisme-aventure': 'tourisme-aventure.jpg',
    'tourisme-affaire': 'tourisme-affaire.png',
    'tourisme-automobile': 'tourisme-automobile.png',
}

# Title glyphs live around y 155-200, the accent bar around y 225-240.
BAND = (145, 250)
COLS = (380, 1080)

out_dir = Path('public/images/groupement-photos')
out_dir.mkdir(parents=True, exist_ok=True)

for slug, name in SOURCES.items():
    src = Path('public/images/groupement-heroes') / name
    arr = np.asarray(Image.open(src).convert('RGB')).copy()
    h, w = arr.shape[:2]

    rgb = arr.astype(np.int16)
    lum = rgb.mean(axis=2)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    bright = ((lum > 175) & (chroma < 55)).astype(np.uint8)

    mask = np.zeros((h, w), dtype=np.uint8)
    mask[BAND[0]:BAND[1], COLS[0]:COLS[1]] = bright[BAND[0]:BAND[1], COLS[0]:COLS[1]]
    mask = (np.asarray(Image.fromarray(mask * 255).filter(ImageFilter.MaxFilter(13))) > 0).astype(np.uint8)

    if cv2 is not None:
        result = cv2.inpaint(arr, mask, 6, cv2.INPAINT_TELEA)
    else:
        blur = np.asarray(Image.fromarray(arr).filter(ImageFilter.GaussianBlur(14))).astype(np.float32)
        m = mask.astype(np.float32)[..., None]
        result = np.clip(arr.astype(np.float32) * (1 - m) + blur * m, 0, 255).astype(np.uint8)

    dest = out_dir / f'hero-{slug}.jpg'
    Image.fromarray(result).save(dest, quality=93, optimize=True)

    check = np.asarray(Image.open(dest).convert('RGB')).astype(np.int16)
    band = check[BAND[0]:BAND[1], COLS[0]:COLS[1]]
    residual = int((((band.mean(axis=2) > 195) & (band.max(axis=2) - band.min(axis=2) < 40)).sum()))
    print(f'{dest} masked={int(mask.sum())} residual={residual} cv2={cv2 is not None}')
