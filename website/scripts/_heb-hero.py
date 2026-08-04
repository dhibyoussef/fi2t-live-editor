"""Crop the new hébergements banner to the hero band used by every groupement page."""
from PIL import Image
from pathlib import Path

SRC = Path(
    'C:/Users/youss/.cursor/projects/c-Users-youss-OneDrive-Attachments-Desktop-fi2t-live-editor/'
    'assets/hero-hebergements-alternatifs-new.png'
)
DST = Path('public/images/groupement-photos/hero-hebergements-alternatifs.jpg')
TARGET = (1440, 393)

im = Image.open(SRC).convert('RGB')
w, h = im.size
band = round(w / (TARGET[0] / TARGET[1]))
# Sit the band on the horizon so the headline lands over open sea and sky, and the
# terrace still reads along the bottom edge.
top = min(max(round(h * 0.48) - band // 2, 0), h - band)
im.crop((0, top, w, top + band)).resize(TARGET, Image.LANCZOS).save(DST, quality=90, optimize=True)
print(f'source {w}x{h} -> band y{top}..{top + band} -> {TARGET} saved {DST}')
