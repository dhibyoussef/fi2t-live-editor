import { GROUPEMENTS, type GroupementItem } from '../../lib/groupements'
import { AGENCES_DE_VOYAGES_DEFAULTS } from './agences-de-voyages'
import { buildGroupementDefaults } from './groupement-shared'
import { CUSTOM_GROUPEMENT_PAGES, getCustomGroupementPage } from './groupement-custom-pages'
import { pageToBlocks } from './groupement-page-schema'
import { GROUPEMENT_PHOTO_HERO_BY_SLUG } from '../../lib/groupement-tree'

/**
 * Split a custom (Figma) groupement page into one CMS block per band, so the
 * admin shows the page's real structure instead of a single opaque document.
 */
export function getCustomPageBlocks(slug: string, locale = 'fr'): Record<string, string> {
  const page = getCustomGroupementPage(slug, locale)
  return page ? pageToBlocks(page) : {}
}

/** Figma design-ref → baked hero path */
export const GROUPEMENT_HERO_BY_SLUG: Record<string, string> = {
  'agences-de-voyages': '/images/groupement-heroes/agences-de-voyages.png?v=3',
  'hebergements-alternatifs': '/images/groupement-heroes/hebergements-alternatifs.png?v=7',
  'tourisme-culturel': '/images/groupement-heroes/tourisme-culturel.jpg?v=2',
  'thalassotherapie': '/images/groupement-heroes/thalassotherapie.jpg?v=2',
  'tourisme-senior': '/images/groupement-heroes/tourisme-senior.jpg?v=1',
  'tourisme-thermal': '/images/groupement-heroes/tourisme-thermal.jpg?v=1',
  'tourisme-golfique': '/images/groupement-heroes/tourisme-golfique.png?v=2',
  'tourisme-plaisance': '/images/groupement-heroes/tourisme-plaisance.png?v=2',
  'tourisme-medical': '/images/groupement-heroes/tourisme-medical.jpg?v=2',
  'tourisme-automobile': '/images/groupement-heroes/tourisme-automobile.png?v=2',
  'tourisme-affaire': '/images/groupement-heroes/tourisme-affaire.png?v=5',
  'tourisme-aventure': '/images/groupement-heroes/tourisme-aventure.jpg?v=2',
}

/**
 * Unique Figma layouts — always real HTML (GroupementCustomBody).
 * Do NOT use full-page design-face images for visitors.
 */
export const GROUPEMENT_FACE_BY_SLUG: Record<string, string> = {}

function stubFor(label: string, slug?: string) {
  const heroImage = slug ? GROUPEMENT_HERO_BY_SLUG[slug] : undefined
  return buildGroupementDefaults({
    title: label.trim(),
    heroImage,
    intro: `La Fédération Interprofessionnelle du Tourisme Tunisien (FI2T) représente les acteurs du segment « ${label.trim()} » engagés dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÀ travers ce groupement, la Fi2T œuvre pour :`,
    challenges: [
      {
        number: '01',
        title: 'Cadre réglementaire à moderniser',
        body: 'Adapter la réglementation aux réalités actuelles du métier et reconnaître les nouvelles formes d’activité.',
        constat: 'Constat FI2T : un cadre plus clair favorise l’investissement et limite l’informel.',
      },
      {
        number: '02',
        title: 'Structuration professionnelle',
        body: 'Renforcer la structuration du groupement, la qualité de service et la représentation collective.',
      },
      {
        number: '03',
        title: 'Visibilité et valorisation',
        body: 'Améliorer la visibilité nationale et internationale de l’offre liée à ce groupement.',
      },
      {
        number: '04',
        title: 'Transformation digitale',
        body: 'Accélérer la digitalisation des outils, de la distribution et de la relation client.',
      },
      {
        number: '05',
        title: 'Compétences et formation',
        body: 'Développer des parcours de formation adaptés aux métiers spécifiques du groupement.',
      },
    ],
    enjeuxItems: [
      `Positionner « ${label.trim()} » comme un levier stratégique du tourisme tunisien.`,
      'Passer d’un tourisme de volume à un tourisme de valeur et d’expérience.',
      'Renforcer la résilience économique des opérateurs du groupement.',
      'Favoriser l’investissement, l’innovation et l’emploi qualifié.',
      'Réduire l’informel par un cadre incitatif et moderne.',
    ],
    proposals: [
      {
        title: 'Réforme et accompagnement réglementaire',
        body: 'Proposer des évolutions réglementaires adaptées et accompagner les opérateurs dans leur mise en conformité.',
      },
      {
        title: 'Diversification et montée en gamme',
        body: 'Soutenir le développement de produits différenciés et de qualité.',
      },
      {
        title: 'Transformation digitale',
        body: 'Accélérer l’adoption d’outils numériques et de nouveaux canaux de distribution.',
      },
      {
        title: 'Formation et professionnalisation',
        body: 'Mettre en place des programmes de formation continue pour les équipes.',
      },
      {
        title: 'Dialogue public–privé',
        body: 'Structurer un dialogue permanent avec les institutions et les partenaires du secteur.',
      },
    ],
  })
}

/**
 * Banner a groupement actually renders: the clean photo when one exists (the
 * title is then live text), otherwise the Figma artboard with the title baked
 * in. The stored default has to match, or the CMS value would silently
 * override the design.
 */
function heroImageFor(slug: string): string | undefined {
  return GROUPEMENT_PHOTO_HERO_BY_SLUG[slug] ?? GROUPEMENT_HERO_BY_SLUG[slug]
}

const BY_SLUG: Record<string, Record<string, string>> = {
  'agences-de-voyages': {
    ...AGENCES_DE_VOYAGES_DEFAULTS,
    'hero.image': heroImageFor('agences-de-voyages')!,
  },
}

for (const g of GROUPEMENTS) {
  if (!BY_SLUG[g.slug]) {
    BY_SLUG[g.slug] = stubFor(g.label, g.slug)
  }
  const hero = heroImageFor(g.slug)
  if (hero) BY_SLUG[g.slug] = { ...BY_SLUG[g.slug], 'hero.image': hero }
}

/**
 * Extra pages from Figma design-refs (may differ from Accueil grid labels).
 * Each gets its own route so every Figma screen is reachable.
 */
const EXTRA_GROUPEMENTS: GroupementItem[] = [
  { label: 'Thalassothérapie', slug: 'thalassotherapie', icon: '/images/icon4.png?v=5' },
  { label: 'Tourisme des séniors', slug: 'tourisme-senior', icon: '/images/icon9.png?v=5' },
  { label: 'Tourisme thermal', slug: 'tourisme-thermal', icon: '/images/icon7.png?v=5' },
  { label: 'Tourisme golfique', slug: 'tourisme-golfique', icon: '/images/icon10.png?v=5' },
  { label: 'Tourisme de plaisance', slug: 'tourisme-plaisance', icon: '/images/icon11.png?v=5' },
  { label: 'Tourisme médical', slug: 'tourisme-medical', icon: '/images/icon4.png?v=5' },
]

for (const g of EXTRA_GROUPEMENTS) {
  if (!BY_SLUG[g.slug]) {
    BY_SLUG[g.slug] = stubFor(g.label, g.slug)
  }
  const hero = heroImageFor(g.slug)
  if (hero) BY_SLUG[g.slug] = { ...BY_SLUG[g.slug], 'hero.image': hero }
}

// Expose every band of every Figma-custom page as an editable CMS block (FR baseline).
for (const slug of Object.keys(CUSTOM_GROUPEMENT_PAGES)) {
  BY_SLUG[slug] = { ...(BY_SLUG[slug] ?? {}), ...getCustomPageBlocks(slug, 'fr') }
}

export const GROUPEMENT_SLUGS = [
  ...new Set([...GROUPEMENTS.map((g) => g.slug), ...EXTRA_GROUPEMENTS.map((g) => g.slug)]),
]

export function isGroupementSlug(slug: string): boolean {
  return GROUPEMENT_SLUGS.includes(slug)
}

export function getGroupementDefaults(slug: string): Record<string, string> {
  return BY_SLUG[slug] ?? {}
}
