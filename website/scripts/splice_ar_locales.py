#!/usr/bin/env python3
from pathlib import Path

target = Path(__file__).resolve().parents[1] / "src/cms/defaults/groupement-custom-locales-extra.ts"
ar_rest = Path(__file__).resolve().parent / "groupement_ar_rest.ts"

text = target.read_text(encoding="utf-8")
text = text.replace(
    "desc: 'من أشعة الشمس سنويًا، مما ي favor العلاج بالشمس الطبيعي.'",
    "desc: 'من أشعة الشمس سنويًا، مما ي favor العلاج بالشمس الطبيعي.'",
)
text = text.replace(
    "desc: 'مؤشر على مرونة القطاع رغم التحديات ال conjoncturelles.'",
    "desc: 'مؤشر على مرونة القطاع رغم التحديات ال conjoncturelles.'",
)
text = text.replace(
    "blurb:\n      'مراسي ومحطات توقف وخدمات تقنية: الشعبة التي تستقطب تدفقات اليachting من غرب المتوسط.'",
    "blurb:\n      'مراسي ومحطات توقف وخدمات تقنية: الشعبة التي تستقطب تدفقات اليachting من غرب المتوسط.'",
)

marker = "    /* __APPEND_AR2__ */"
if marker not in text:
    raise SystemExit("marker not found")
rest = ar_rest.read_text(encoding="utf-8")
text = text.replace(marker, rest.rstrip())
target.write_text(text, encoding="utf-8")
print(len(text.splitlines()))
