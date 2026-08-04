#!/usr/bin/env python3
"""Generate groupement-custom-locales-extra.ts"""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "src/cms/defaults/groupement-custom-locales-extra.ts"

HEADER = """import type { CustomGroupementPage } from './groupement-custom-pages'
type PageOverlay = Partial<CustomGroupementPage> & { sections?: Record<string, unknown> }

const SPORTIF_CHILDREN_EN = [
  {
    slug: 'tourisme-golfique',
    label: 'Golf tourism',
    tag: '18-hole courses',
    blurb:
      'Ten international-standard courses, a climate playable year-round and a high-spending European clientele still largely untapped.',
    face: '/images/groupement-photos/face-tourisme-golfique.jpg',
  },
]

const SPORTIF_CHILDREN_AR = [
  {
    slug: 'tourisme-golfique',
    label: 'سياحة الغولف',
    tag: 'ملاعب 18 حفرة',
    blurb:
      'عشرة ملاعب بمعايير دولية، ومناخ قابل للعب طوال السنة، وزبائن أوروبيون ذوو قدرة شرائية عالية لا تزال تُستغلّ بشكل محدود.',
    face: '/images/groupement-photos/face-tourisme-golfique.jpg',
  },
]

const NAUTIQUE_CHILDREN_EN = [
  {
    slug: 'tourisme-plaisance',
    label: 'Pleasure boating tourism',
    tag: 'Marinas & yachting',
    blurb:
      'Marinas, stopovers and technical services: the segment that captures yachting flows from the western Mediterranean.',
    face: '/images/groupement-photos/face-tourisme-plaisance.jpg',
  },
]

const NAUTIQUE_CHILDREN_AR = [
  {
    slug: 'tourisme-plaisance',
    label: 'سياحة اليخوت',
    tag: 'مراسي ويachting',
    blurb:
      'مراسي ومحطات توقف وخدمات تقنية: الشعبة التي تستقطب تدفقات اليachting من غرب المتوسط.',
    face: '/images/groupement-photos/face-tourisme-plaisance.jpg',
  },
]

export const EXTRA_GROUPEMENT_LOCALES: Record<'en' | 'ar', Record<string, PageOverlay>> = {
"""

FOOTER = "}\n"

# Read the body from a companion data file we'll embed below
BODY = r'''
  en: {
    thalassotherapie: {
      heroTitle: 'Thalassotherapy – Dr Kaouthar Meddeb',
      intro:
        'Discover the unique alliance between Tunisian medical expertise and the millennia-old therapeutic virtues of the Mediterranean Sea.',
      sections: {
        splitTitle: 'At the Heart of Health by the Sea',
        splitBody: [
          'Thalassotherapy is the combined use, under medical supervision, of the benefits of the marine environment: climate, seawater, marine muds, algae and other substances extracted from the ocean.',
          'Today, faced with growing demand for preventive health tourism, Tunisia is asserting itself as an undisputed leader, offering rigorous care protocols in a prestigious setting.',
        ],
        splitImg: '/images/groupement-media/thalasso-split.jpg',
        atoutsTitle: 'Sector Strengths',
        atoutsSub: 'An ecosystem designed for excellence and performance.',
        atouts: [
          { title: '300+ Days', desc: 'Of sunshine per year, favouring natural heliotherapy.', icon: 'sun' },
          { title: 'Prestige Infrastructure', desc: 'Centres integrated into 4★ and 5★ high-end hotel units.', icon: 'building' },
          { title: 'Technology & Expertise', desc: 'State-of-the-art equipment and highly qualified medical staff for personalised care.', icon: 'tech' },
          { title: 'Legal Rigor', desc: 'Strict legislation and ISO 17680 standards applied.', icon: 'scale' },
          { title: 'Competitiveness', desc: 'An unmatched quality-price ratio on the international market.', icon: 'wallet' },
        ],
        diagnosticTitle: 'Economic Diagnosis',
        diagnostic: [
          { value: '60', label: 'ACTIVE CENTRES', desc: 'Including 15 centres currently idle for restructuring.' },
          { value: '10%', label: 'OCCUPANCY RATE', desc: 'Annual average reflecting strong untapped growth potential.' },
          { value: '48.7m', label: 'TURNOVER (TND)', desc: 'An indicator of sector resilience despite cyclical challenges.' },
        ],
        defisTitle: 'Strategic Challenges',
        defisSub: 'Identifying structural friction points for a clear forward-looking vision.',
        defis: [
          { title: 'Institutional Conflict', desc: 'Imbalance of oversight between the Ministry of Health and the Ministry of Tourism.' },
          { title: 'Investment Gap', desc: 'Absence of specific tax incentives for technical renewal.' },
          { title: 'Certification Gaps', desc: 'Need to accelerate compliance with international standards (ISO).' },
          { title: 'Competition', desc: 'Need for regulation against unfair competition from non-approved structures.' },
        ],
        planTitle: 'Recovery Plan: 6 Key Actions',
        plan: [
          { num: '01', title: 'Certification & Quality', desc: 'Generalisation of ISO standards to guarantee impeccable, certified care quality.' },
          { num: '02', title: 'Product Enrichment', desc: 'Integration of complementary energy treatments for a modern holistic offer.' },
          { num: '03', title: 'Strategic Marketing', desc: 'ONTT/ONTH collaboration to conquer Maghreb and Middle East markets.' },
          { num: '04', title: 'Tax Reform', desc: 'Revision of the finance law to correct the impact of 2018-2019 measures.' },
          { num: '05', title: 'Ethical Oversight', desc: 'Strict monitoring to ensure fair and healthy competition.' },
          { num: '06', title: 'Legal Framework', desc: 'Strengthening the role of the National Office of Thermalism and Hydrotherapy.' },
        ],
      },
    },
  },
}
'''

OUT.write_text(HEADER + BODY + FOOTER, encoding='utf-8')
print(f'Wrote {OUT} ({OUT.stat().st_size} bytes, {len(OUT.read_text(encoding=\"utf-8\").splitlines())} lines)')
