/** Shared EN/AR overlays for all groupement detail pages. */

import { CUSTOM_GROUPEMENT_PAGES } from '../groupement-custom-pages'
import { getCustomPageBlocks } from '../groupements-index'

const PILLARS_EN = JSON.stringify([
  { title: 'Structured sector', icon: '/images/g-icon-structure.svg' },
  { title: 'Professional interests', icon: '/images/g-icon-interets.svg' },
  { title: 'Added value', icon: '/images/g-icon-valeur.svg' },
  { title: 'Regulatory framework', icon: '/images/g-icon-cadre.svg' },
])

const PILLARS_AR = JSON.stringify([
  { title: 'قطاع منظّم', icon: '/images/g-icon-structure.svg' },
  { title: 'المصالح المهنية', icon: '/images/g-icon-interets.svg' },
  { title: 'قيمة مضافة', icon: '/images/g-icon-valeur.svg' },
  { title: 'إطار تنظيمي', icon: '/images/g-icon-cadre.svg' },
])

const SHARED_EN: Record<string, string> = {
  'positioning.title': 'FI2T Positioning',
  'positioning.pillars': PILLARS_EN,
  'challenges.title': 'FI2T Positioning',
  'enjeux.title': 'Strategic stakes',
  'proposals.title': 'Strategic proposals',
}

const SHARED_AR: Record<string, string> = {
  'positioning.title': 'تموضع FI2T',
  'positioning.pillars': PILLARS_AR,
  'challenges.title': 'تموضع FI2T',
  'enjeux.title': 'التحديات الاستراتيجية',
  'proposals.title': 'المقترحات الاستراتيجية',
}

const AGENCES_EN: Record<string, string> = {
  'positioning.body':
    "The Interprofessional Federation of Tunisian Tourism (FI2T) represents actors committed to modernising, diversifying and professionalising Tunisian tourism.\nThrough its members, notably travel agencies, Fi2T works to:",
  'challenges.items': JSON.stringify([
    {
      number: '01',
      title: 'Outdated regulatory framework',
      body: '• Obsolete legislation that does not reflect the diversification of travel professions.\n• No formal recognition of:\n  - DMCs,\n  - specialised agencies,\n  - alternative, cultural, sports or sustainable tourism operators\n  - Tour Operator category (especially for outgoing operators and DMCs)\n• Heavy administrative procedures and discouraging financial guarantees.',
      constat: 'FI2T finding: the current framework slows innovation, encourages informality and penalises structured initiatives.',
    },
    {
      number: '02',
      title: 'Economic fragility of travel agencies',
      body: '• Commercial margins under constant pressure from platforms and international tour operators.\n• Heavy reliance on foreign tour operators and reduced commissions.\n• Strong seasonality limiting cash flow and investment capacity.\n• Difficult access to bank financing and support schemes.',
      constat: 'FI2T finding: without economic strengthening, agencies can neither modernise nor withstand shocks.',
    },
    {
      number: '03',
      title: 'Insufficient diversification',
      body: '• Offer still too focused on mass seaside tourism.\n• Underuse of high-value niches (cultural, sustainable, sports, MICE, senior).\n• Lack of packaging and go-to-market for differentiated products.\n• Insufficient coordination with the Federation’s other sectors.',
      constat: 'FI2T finding: diversification is the condition for value-driven and resilient tourism.',
    },
    {
      number: '04',
      title: 'Digital lag',
      body: '• Partial digitisation of internal processes (booking, CRM, reporting).\n• Weak presence and visibility on digital channels.\n• Distribution tools poorly suited to current customer behaviours.\n• Structural lag versus OTAs and international platforms.',
      constat: 'FI2T finding: without digital acceleration, agencies lose market share and clients.',
    },
    {
      number: '05',
      title: 'Skills gap',
      body: '• Need for continuous training on emerging travel professions.\n• Gaps in digital customer relations and e-commerce.\n• Lack of skills in designing experience products.\n• Weak data and yield-management culture.',
      constat: 'FI2T finding: upskilling is a priority lever for competitiveness.',
    },
  ]),
  'enjeux.items': JSON.stringify([
    'Position travel agencies as central actors of the national tourism strategy.',
    'Move from volume tourism to value, experience and sustainability tourism.',
    'Strengthen the economic resilience of agencies.',
    'Foster investment, innovation and skilled employment.',
    'Reduce informality through an incentive-based, modern framework.',
  ]),
  'proposals.items': JSON.stringify([
    {
      title: 'Regulatory reform (FI2T priority)',
      body: '• Revision of the law governing travel agencies.\n• Official recognition of new operator categories.\n• Simplification and digitisation of administrative procedures.\n• Revision of financial guarantees according to real activity and risk.\nFI2T role: proposal force and technical partner of the State in the reform.',
    },
    {
      title: 'Support for diversification and upmarket positioning',
      body: 'Support the development of differentiated, high-value products, in link with the Federation’s other groups.',
    },
    {
      title: 'Acceleration of digital transformation',
      body: 'Foster the adoption of digital tools, online distribution and the modernisation of booking systems.',
    },
    {
      title: 'Training and professionalisation',
      body: 'Continuous training programmes to strengthen the business, commercial and digital skills of teams.',
    },
    {
      title: 'Governance and public–private dialogue',
      body: 'Structure an ongoing dialogue with institutions to align regulation, investment and national strategy.',
    },
  ]),
}

const AGENCES_AR: Record<string, string> = {
  'positioning.body':
    'يمثل الاتحاد المهني المشترك للسياحة التونسية (FI2T) مجموعة من الفاعلين الملتزمين بتحديث وتنويع واحتراف السياحة التونسية.\nومن خلال أعضائه، ولا سيما وكالات الأسفار، تعمل Fi2T على:',
  'challenges.items': JSON.stringify([
    {
      number: '01',
      title: 'إطار تنظيمي متقادم',
      body: '• تشريع متقادم لا يأخذ بعين الاعتبار تنوّع مهن السفر.\n• غياب اعتراف رسمي بـ:\n  - منظمي الوجهات (DMC)،\n  - الوكالات المتخصصة،\n  - مشغّلي السياحة البديلة والثقافية والرياضية والمستدامة\n  - فئة منظّم الرحلات (خاصة للعمليات الصادرة وDMC)\n• إجراءات إدارية ثقيلة وضمانات مالية مُنفّرة.',
      constat: 'ملاحظة FI2T: الإطار الحالي يعيق الابتكار ويشجّع القطاع غير المنظم ويُعاقب المبادرات المنظّمة.',
    },
    {
      number: '02',
      title: 'هشاشة اقتصادية لوكالات الأسفار',
      body: '• هوامش تجارية تحت ضغط مستمر أمام المنصات ومنظمي الرحلات الدوليين.\n• اعتماد قوي على منظمي الرحلات الأجانب والعمولات المخفّضة.\n• موسمية حادة تحدّ من السيولة وقدرة الاستثمار.\n• صعوبة الولوج إلى التمويل البنكي وآليات الدعم.',
      constat: 'ملاحظة FI2T: بدون تعزيز اقتصادي، لا تستطيع الوكالات التحديث ولا مواجهة الصدمات.',
    },
    {
      number: '03',
      title: 'تنويع غير كافٍ',
      body: '• عرض ما زال مركّزاً أكثر من اللازم على السياحة الشاطئية الجماعية.\n• ضعف استغلال المجالات ذات القيمة العالية (ثقافي، مستدام، رياضي، أعمال، كبار السن).\n• نقص في تغليف المنتجات المميزة وتسويقها.\n• تنسيق غير كافٍ مع باقي فروع الجامعة.',
      constat: 'ملاحظة FI2T: التنويع شرط لسياحة ذات قيمة ومرونة.',
    },
    {
      number: '04',
      title: 'تأخّر رقمي',
      body: '• رقمنة جزئية للعمليات الداخلية (الحجز، إدارة العملاء، التقارير).\n• حضور ضعيف على القنوات الرقمية.\n• أدوات توزيع غير ملائمة لسلوك العملاء الحالي.\n• تأخّر هيكلي أمام منصات الحجز الدولية.',
      constat: 'ملاحظة FI2T: بدون تسريع رقمي، تفقد الوكالات حصص السوق والعملاء.',
    },
    {
      number: '05',
      title: 'عجز في الكفاءات',
      body: '• حاجة إلى تكوين مستمر في المهن الناشئة للسفر.\n• ثغرات في علاقة العميل الرقمية والتجارة الإلكترونية.\n• نقص كفاءات في تصميم منتجات التجربة.\n• ثقافة ضعيفة للبيانات وإدارة العائد.',
      constat: 'ملاحظة FI2T: رفع الكفاءات رافعة أولوية للقدرة التنافسية.',
    },
  ]),
  'enjeux.items': JSON.stringify([
    'تموضع وكالات الأسفار كفاعلين محوريين في الاستراتيجية السياحية الوطنية.',
    'الانتقال من سياحة الحجم إلى سياحة القيمة والتجربة والاستدامة.',
    'تعزيز المرونة الاقتصادية للوكالات.',
    'تشجيع الاستثمار والابتكار والتشغيل المؤهل.',
    'الحد من القطاع غير المنظم عبر إطار تحفيزي وحديث.',
  ]),
  'proposals.items': JSON.stringify([
    {
      title: 'إصلاح الإطار التنظيمي (أولوية FI2T)',
      body: '• مراجعة القانون المنظّم لوكالات الأسفار.\n• اعتراف رسمي بفئات المشغّلين الجديدة.\n• تبسيط ورقمنة الإجراءات الإدارية.\n• مراجعة الضمانات المالية وفق النشاط الفعلي والمخاطر.\nدور FI2T: قوة اقتراح وشريك تقني للدولة في الإصلاح.',
    },
    {
      title: 'دعم التنويع والارتقاء بالجودة',
      body: 'مواكبة تطوير منتجات مميزة وذات قيمة مضافة عالية، بالتنسيق مع باقي تجمعات الجامعة.',
    },
    {
      title: 'تسريع التحول الرقمي',
      body: 'تشجيع اعتماد الأدوات الرقمية والتوزيع عبر الإنترنت وتحديث أنظمة الحجز.',
    },
    {
      title: 'التكوين والاحتراف',
      body: 'برامج تكوين مستمر لتعزيز كفاءات الفرق المهنية والتجارية والرقمية.',
    },
    {
      title: 'الحوكمة والحوار بين القطاعين العام والخاص',
      body: 'هيكلة حوار دائم مع المؤسسات لمواءمة التنظيم والاستثمار والاستراتيجية الوطنية.',
    },
  ]),
}

const TITLES_EN: Record<string, string> = {
  'agences-de-voyages': 'Travel agencies',
  'hebergements-alternatifs': 'Alternative tourist accommodation',
  'tourisme-culturel': 'Cultural tourism',
  'tourisme-de-sante': 'Health tourism',
  'tourisme-aventure': 'Adventure tourism',
  'tourisme-affaire': 'Business tourism',
  'tourisme-ecologique': 'Ecological tourism',
  'tourisme-aeronautique': 'Aeronautical tourism',
  'tourisme-automobile': 'Automotive tourism',
  'tourisme-sportif': 'Sports tourism',
  'tourisme-nautique': 'Nautical tourism',
  'tourisme-subaquatique': 'Underwater tourism',
  'tourisme-senior': 'Senior tourism',
  'tourisme-medical': 'Medical tourism',
  'tourisme-thermal': 'Thermal tourism',
  'thalassotherapie': 'Thalassotherapy',
  'tourisme-golfique': 'Golf tourism',
  'tourisme-plaisance': 'Pleasure-boating tourism',
}

const TITLES_AR: Record<string, string> = {
  'agences-de-voyages': 'وكالات الأسفار',
  'hebergements-alternatifs': 'الإيواء السياحي البديل',
  'tourisme-culturel': 'السياحة الثقافية',
  'tourisme-de-sante': 'سياحة الصحة',
  'tourisme-aventure': 'سياحة المغامرة',
  'tourisme-affaire': 'سياحة الأعمال',
  'tourisme-ecologique': 'السياحة البيئية',
  'tourisme-aeronautique': 'السياحة الجوية',
  'tourisme-automobile': 'السياحة السياراتية',
  'tourisme-sportif': 'السياحة الرياضية',
  'tourisme-nautique': 'السياحة البحرية',
  'tourisme-subaquatique': 'السياحة تحت الماء',
  'tourisme-senior': 'سياحة كبار السن',
  'tourisme-medical': 'السياحة الطبية',
  'tourisme-thermal': 'السياحة الحرارية',
  'thalassotherapie': 'العلاج بمياه البحر',
  'tourisme-golfique': 'سياحة الغولف',
  'tourisme-plaisance': 'سياحة اليخوت',
}

/**
 * Locale overlays are keyed by slug. The custom Figma pages contribute one
 * block per band and exist for slugs that have no TITLES_* entry, so build the
 * map from the custom-page registry as well.
 */
function buildOverlay(
  titles: Record<string, string>,
  shared: Record<string, string>,
  agences: Record<string, string>,
  locale: 'en' | 'ar',
): Record<string, Record<string, string>> {
  const slugs = new Set([...Object.keys(titles), ...Object.keys(CUSTOM_GROUPEMENT_PAGES)])
  const out: Record<string, Record<string, string>> = {}
  for (const slug of slugs) {
    const entry: Record<string, string> = { ...shared }
    const title = titles[slug]
    if (title) entry['hero.title'] = title
    if (slug === 'agences-de-voyages') Object.assign(entry, agences)
    Object.assign(entry, getCustomPageBlocks(slug, locale))
    out[slug] = entry
  }
  return out
}

export const GROUPEMENT_EN = buildOverlay(TITLES_EN, SHARED_EN, AGENCES_EN, 'en')
export const GROUPEMENT_AR = buildOverlay(TITLES_AR, SHARED_AR, AGENCES_AR, 'ar')
