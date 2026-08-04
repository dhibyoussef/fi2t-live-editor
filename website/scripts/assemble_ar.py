#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Complete AR section for groupement-custom-locales-extra.ts"""
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "src/cms/defaults/groupement-custom-locales-extra.ts"
FRAG = Path(__file__).resolve().parent / "ar_fragments"

# Read header + EN + thalassotherapie AR from current file up to senior
text = TARGET.read_text(encoding="utf-8")
start = text.index("  ar: {")
senior_start = text.index("    'tourisme-senior': {")
header = text[:senior_start]

# Read all fragment files
parts = []
for name in ["senior.ts", "thermal.ts", "aventure_affaire.ts", "golf_plaisance_auto.ts", "hubs_segments.ts"]:
    p = FRAG / name
    if p.exists():
        parts.append(p.read_text(encoding="utf-8").rstrip())

footer = "\n  },\n}\n"
TARGET.write_text(header + ",\n".join(parts) + footer, encoding="utf-8")
print("lines:", len(TARGET.read_text(encoding="utf-8").splitlines()))
