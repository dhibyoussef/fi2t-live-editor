#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TARGET = ROOT.parent / "src/cms/defaults/groupement-custom-locales-extra.ts"
EN_REST = ROOT / "en_fragments/rest.ts"
AR_FRAG_DIR = ROOT / "ar_fragments"

NAUTIQUE_BLURB = (
    "مراسي ومحطات توقف وخدمات تقنية: "
    "الشعبة التي تستقطب تدفقات الإبحار الترفيهي من غرب المتوسط."
)

HEADER_END = "export const EXTRA_GROUPEMENT_LOCALES: Record<'en' | 'ar', Record<string, PageOverlay>> = {"

EN_THALASSO_END = "    },\n    'tourisme-senior':"

AR_ORDER = [
    "thalasso.ts",
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

text = TARGET.read_text(encoding="utf-8")
header = text[: text.index(HEADER_END) + len(HEADER_END)] + "\n  en: {\n"

# EN thalassotherapie from corrupted file (still valid)
start = text.index("    thalassotherapie: {")
end = text.index(EN_THALASSO_END)
en_thalasso = text[start:end].rstrip() + ",\n"

en_rest = EN_REST.read_text(encoding="utf-8").rstrip()
en_block = header + en_thalasso + en_rest + "\n  },\n  ar: {\n"

ar_parts = []
for name in AR_ORDER:
    p = AR_FRAG_DIR / name
    if not p.exists():
        raise SystemExit(f"missing: {name}")
    ar_parts.append(p.read_text(encoding="utf-8").rstrip())

ar_block = ",\n".join(ar_parts) + "\n  },\n}\n"
out = en_block + ar_block

out = out.replace(
    "'مراسi ومحطات توقف وخدمات تقنية: الشعبة التي تستقطب تدفقات اليachting من غرب المتوسط.'",
    f"'{NAUTIQUE_BLURB}'",
)
out = out.replace("تدفقات اليachting", "تدفقات الإبحار الترفيهي")

TARGET.write_text(out, encoding="utf-8")
print("lines:", len(out.splitlines()))
