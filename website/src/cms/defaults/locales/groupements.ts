/** Shared EN/AR overlays for all groupement detail pages. */

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

const TITLES_EN: Record<string, string> = {
  'agences-de-voyages': 'Travel agencies',
  'hebergements-alternatifs': 'Alternative tourist accommodation',
  'tourisme-culturel': 'Cultural tourism',
  thalassotherapie: 'Thalassotherapy',
  'tourisme-senior': 'Senior tourism',
  'tourisme-thermal': 'Thermal tourism',
  'tourisme-medical': 'Medical tourism',
  'tourisme-aventure': 'Adventure / alternative tourism',
  'tourisme-affaire': 'Business tourism',
  'tourisme-golfique': 'Golf tourism',
  'tourisme-plaisance': 'Pleasure boating tourism',
  'tourisme-automobile': 'Automotive tourism',
}

const TITLES_AR: Record<string, string> = {
  'agences-de-voyages': 'وكالات الأسفار',
  'hebergements-alternatifs': 'الإقامات السياحية البديلة',
  'tourisme-culturel': 'السياحة الثقافية',
  thalassotherapie: 'العلاج بمياه البحر',
  'tourisme-senior': 'سياحة كبار السن',
  'tourisme-thermal': 'السياحة الحرارية',
  'tourisme-medical': 'السياحة الطبية',
  'tourisme-aventure': 'سياحة المغامرة / البديلة',
  'tourisme-affaire': 'سياحة الأعمال',
  'tourisme-golfique': 'سياحة الغولف',
  'tourisme-plaisance': 'سياحة اليخوت',
  'tourisme-automobile': 'السياحة السياراتية',
}

export const GROUPEMENT_EN: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(TITLES_EN).map(([slug, title]) => [slug, { ...SHARED_EN, 'hero.title': title }]),
)

export const GROUPEMENT_AR: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(TITLES_AR).map(([slug, title]) => [slug, { ...SHARED_AR, 'hero.title': title }]),
)
