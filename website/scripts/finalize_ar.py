#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "src/cms/defaults/groupement-custom-locales-extra.ts"
FRAG_DIR = Path(__file__).resolve().parent / "ar_fragments"

ORDER = [
    "senior.ts",
    "thermal.ts",
    "aventure.ts",
    "affaire.ts",
    "golf.ts",
    "plaisance.ts",
    "auto.ts",
    "sportif_nautique.ts",
    "segments.ts",
]

NAUTIQUE_BLURB = (
    "مراسي ومحطات توقف وخدمات تقنية: "
    "الشعبة التي تستقطب تدفقات الإبحار الترفيهي من غرب المتوسط."
)

text = TARGET.read_text(encoding="utf-8")
text = text.replace(
    "'مراسi ومحطات توقف وخدمات تقنية: الشعبة التي تستقطب تدفقات اليachting من غرب المتوسط.'",
    f"'{NAUTIQUE_BLURB}'",
)
text = text.replace("تدفقات اليachting", "تدفقات الإبحار الترفيهي")

parts = []
for name in ORDER:
    p = FRAG_DIR / name
    if not p.exists():
        raise SystemExit(f"missing fragment: {name}")
    parts.append(p.read_text(encoding="utf-8").rstrip())

start = text.index("    'tourisme-senior': {")
end = text.index("    /* __APPEND_AR3__ */") + len("    /* __APPEND_AR3__ */")
body = ",\n".join(parts)
text = text[:start] + body + "\n  },\n}"
TARGET.write_text(text, encoding="utf-8")
print("lines:", len(text.splitlines()))
