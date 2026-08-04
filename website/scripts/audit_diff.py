"""Section-wise visual diff: live screenshots vs Figma design refs at 1440px."""
from __future__ import annotations

from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"c:/Users/youss/OneDrive/Attachments/Desktop/fi2t-live-editor/website")
OUT = ROOT / "scripts" / "audit-out"
OUT.mkdir(parents=True, exist_ok=True)

PAGES = [
    {
        "name": "home",
        "live": OUT / "home-full.png",
        "design": ROOT / "public" / "design-refs" / "Home page.jpg",
        "design_h": None,  # use image size
        # Approximate section bands as fractions of design height (from visual layout)
        "sections": [
            ("header+hero", 0.00, 0.16),
            ("qui-sommes-nous", 0.16, 0.30),
            ("objectifs", 0.30, 0.42),
            ("groupements", 0.42, 0.62),
            ("adherer", 0.62, 0.74),
            ("actualites", 0.74, 0.88),
            ("cta+footer", 0.88, 1.00),
        ],
    },
    {
        "name": "about",
        "live": OUT / "about-full.png",
        "design": ROOT / "public" / "design-refs" / "qui somme ns.png",
        "sections": [
            ("header+hero", 0.00, 0.18),
            ("mission", 0.18, 0.38),
            ("objectifs", 0.38, 0.62),
            ("split-cta", 0.62, 0.86),
            ("footer", 0.86, 1.00),
        ],
    },
    {
        "name": "org",
        "live": OUT / "org-full.png",
        "design": ROOT / "public" / "design-refs" / "Organisation.png",
        "sections": [
            ("header+hero", 0.00, 0.16),
            ("stats", 0.16, 0.24),
            ("board", 0.24, 0.40),
            ("hq", 0.40, 0.48),
            ("regional", 0.48, 0.68),
            ("groupements", 0.68, 0.90),
            ("footer", 0.90, 1.00),
        ],
    },
]


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def to_1440(im: Image.Image, target_h: int | None = None) -> Image.Image:
    w, h = im.size
    if w != 1440:
        nh = int(round(h * (1440 / w)))
        im = im.resize((1440, nh), Image.Resampling.LANCZOS)
    if target_h is not None and im.size[1] != target_h:
        # pad or crop to match for fair section compare; stretch slightly if close
        if abs(im.size[1] - target_h) / target_h < 0.08:
            im = im.resize((1440, target_h), Image.Resampling.LANCZOS)
        elif im.size[1] < target_h:
            canvas = Image.new("RGB", (1440, target_h), (255, 255, 255))
            canvas.paste(im, (0, 0))
            im = canvas
        else:
            im = im.crop((0, 0, 1440, target_h))
    return im


def mae(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.mean(np.abs(a.astype(np.float32) - b.astype(np.float32))))


def diff_heatmap(a: np.ndarray, b: np.ndarray) -> Image.Image:
    d = np.abs(a.astype(np.float32) - b.astype(np.float32)).mean(axis=2)
    # red where different
    heat = np.zeros_like(a)
    heat[:, :, 0] = np.clip(d * 3, 0, 255)
    heat[:, :, 1] = np.clip(80 - d, 0, 80)
    heat[:, :, 2] = np.clip(80 - d, 0, 80)
    blend = (a.astype(np.float32) * 0.45 + heat.astype(np.float32) * 0.55).astype(np.uint8)
    return Image.fromarray(blend)


def side_by_side(design: Image.Image, live: Image.Image, heat: Image.Image, title: str) -> Image.Image:
    w, h = design.size
    gap = 8
    label_h = 36
    canvas = Image.new("RGB", (w * 3 + gap * 2, h + label_h), (30, 30, 30))
    draw = ImageDraw.Draw(canvas)
    draw.text((8, 8), f"{title} | DESIGN", fill=(255, 255, 255))
    draw.text((w + gap + 8, 8), "LIVE", fill=(255, 255, 255))
    draw.text((2 * (w + gap) + 8, 8), "DIFF (red=mismatch)", fill=(255, 200, 200))
    canvas.paste(design, (0, label_h))
    canvas.paste(live, (w + gap, label_h))
    canvas.paste(heat, (2 * (w + gap), label_h))
    return canvas


report_lines: list[str] = []

for page in PAGES:
    design = to_1440(load_rgb(page["design"]))
    live = to_1440(load_rgb(page["live"]))
    # normalize heights to design for section slicing (stretch live if within 10%)
    th = design.size[1]
    live_n = to_1440(live, th)
    design.save(OUT / f"{page['name']}-design-1440.png")
    live_n.save(OUT / f"{page['name']}-live-norm.png")

    dh, lh = design.size[1], live.size[1]
    report_lines.append(f"\n## {page['name'].upper()}")
    report_lines.append(f"design={design.size} live_raw={live.size} height_delta={lh - dh}px ({(lh-dh)/dh*100:.1f}%)")

    full_a = np.array(design)
    full_b = np.array(live_n)
    full_mae = mae(full_a, full_b)
    report_lines.append(f"full_page_MAE={full_mae:.1f} (0=identical, >25 noticeable)")

    heat_full = diff_heatmap(full_a, full_b)
    heat_full.save(OUT / f"{page['name']}-diff-full.png")
    side_by_side(design, live_n, heat_full, page["name"]).save(OUT / f"{page['name']}-compare-full.jpg", quality=85)

    for sec_name, y0f, y1f in page["sections"]:
        y0 = int(th * y0f)
        y1 = int(th * y1f)
        da = design.crop((0, y0, 1440, y1))
        lb = live_n.crop((0, y0, 1440, y1))
        aa, bb = np.array(da), np.array(lb)
        m = mae(aa, bb)
        # also % pixels with delta > 30
        pix_diff = float(np.mean(np.abs(aa.astype(np.float32) - bb.astype(np.float32)).mean(axis=2) > 30) * 100)
        flag = "OK" if m < 18 else ("WARN" if m < 35 else "BAD")
        report_lines.append(f"  [{flag}] {sec_name}: MAE={m:.1f} hard_diff_px={pix_diff:.1f}% y={y0}-{y1}")
        heat = diff_heatmap(aa, bb)
        side_by_side(da, lb, heat, f"{page['name']}/{sec_name}").save(
            OUT / f"{page['name']}-sec-{sec_name.replace('+','_').replace('/','_')}.jpg", quality=88
        )

(OUT / "AUDIT_REPORT.md").write_text("\n".join(report_lines), encoding="utf-8")
print("\n".join(report_lines))
print(f"\nWrote report + compares to {OUT}")
