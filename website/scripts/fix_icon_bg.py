from pathlib import Path
from PIL import Image

root = Path(r"c:\Users\youss\OneDrive\Attachments\Desktop\fi2t-live-editor\website\public\images")
for i in range(1, 13):
    path = root / f"icon{i}.png"
    if not path.exists():
        print("missing", path)
        continue
    im = Image.open(path).convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r < 45 and g < 45 and b < 45:
                pixels[x, y] = (0, 0, 0, 0)
    im.save(path, "PNG")
    print(f"converted {path.name} {w}x{h}")
