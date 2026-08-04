from PIL import Image, ImageFilter, ImageEnhance
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'public' / 'images'

# Prefer a single clean photo (hero) — groupements bg is mirrored and seams
candidates = [
    root / 'qui-sommes-nous-hero.jpg',
    root / 'Rectangle 27.png',
    root / 'act1.jpg',
]
src_path = next(p for p in candidates if p.exists())
src = Image.open(src_path).convert('RGB')
print('source', src_path.name, src.size)

tw, th = 858, 630
sw, sh = src.size
scale = max(tw / sw, th / sh)
nw, nh = int(sw * scale), int(sh * scale)
src = src.resize((nw, nh), Image.Resampling.LANCZOS)
left = (nw - tw) // 2
top = (nh - th) // 2
photo = src.crop((left, top, left + tw, top + th))
photo = photo.filter(ImageFilter.GaussianBlur(5))
photo = ImageEnhance.Brightness(photo).enhance(0.88)

photo.save(root / 'about-photo.jpg', quality=92, optimize=True)
print('wrote about-photo.jpg', photo.size)

rgba = photo.convert('RGBA')
teal = Image.new('RGBA', rgba.size, (0, 169, 141, 150))
tinted = Image.alpha_composite(rgba, teal).convert('RGB')
for name in ('qui-sommes-nous.jpg', 'qui-sommes-nous-mission.jpg'):
    tinted.save(root / name, quality=90, optimize=True)
tinted.save(root / 'qui-sommes-nous-card.png', optimize=True)
print('done')
