/**
 * Groupement hierarchy: Accueil grid leaves + hubs with children.
 * URLs stay flat (`/tourisme-medical`) so Figma-locked pages keep working;
 * hubs link to their children. Folder layout in product docs maps to this tree.
 */

export type GroupementChild = {
  slug: string
  label: string
  blurb: string
  /** Descriptive photo for the hub card. */
  face?: string
  /** Short qualifier shown as a chip on the hub card. */
  tag?: string
}

export type GroupementHub = {
  slug: string
  label: string
  children: GroupementChild[]
}

/**
 * Editorial banner photography, used in preference to a baked hero.
 *
 * Hubs and the new leaves have no artboard at all. The health / sport /
 * nautical children do, but every artboard banner reuses the same desert
 * placeholder, so the design carries no photograph worth keeping; these
 * banners describe their own subject instead. The title is rendered as live
 * text at the artboard's own metrics (40px, 64x4 accent 37px below), so the
 * banner still matches the design everywhere except the photograph.
 */
export const GROUPEMENT_PHOTO_HERO_BY_SLUG: Record<string, string> = {
  'agences-de-voyages': '/images/groupement-photos/hero-agences-de-voyages.jpg',
  'hebergements-alternatifs': '/images/groupement-photos/hero-hebergements-alternatifs.jpg',
  'tourisme-culturel': '/images/groupement-photos/hero-tourisme-culturel.jpg',
  'tourisme-de-sante': '/images/groupement-photos/hero-tourisme-de-sante.jpg',
  'tourisme-sportif': '/images/groupement-photos/hero-tourisme-sportif.jpg',
  'tourisme-nautique': '/images/groupement-photos/hero-tourisme-nautique.jpg',
  'tourisme-ecologique': '/images/groupement-photos/hero-tourisme-ecologique.jpg',
  'tourisme-aeronautique': '/images/groupement-photos/hero-tourisme-aeronautique.jpg',
  'tourisme-subaquatique': '/images/groupement-photos/hero-tourisme-subaquatique.jpg',
  'tourisme-medical': '/images/groupement-photos/hero-tourisme-medical.jpg',
  'thalassotherapie': '/images/groupement-photos/hero-thalassotherapie.jpg',
  'tourisme-thermal': '/images/groupement-photos/hero-tourisme-thermal.jpg',
  'tourisme-senior': '/images/groupement-photos/hero-tourisme-senior.jpg',
  'tourisme-golfique': '/images/groupement-photos/hero-tourisme-golfique.jpg',
  'tourisme-plaisance': '/images/groupement-photos/hero-tourisme-plaisance.jpg',
  'tourisme-aventure': '/images/groupement-photos/hero-tourisme-aventure.jpg',
  'tourisme-affaire': '/images/groupement-photos/hero-tourisme-affaire.jpg',
  'tourisme-automobile': '/images/groupement-photos/hero-tourisme-automobile.jpg',
}

/** Hubs on the Accueil grid that open a child card grid. */
export const GROUPEMENT_HUBS: GroupementHub[] = [
  {
    slug: 'tourisme-de-sante',
    label: 'Tourisme de santé',
    children: [
      {
        slug: 'tourisme-medical',
        label: 'Tourisme médical',
        tag: 'Soins & chirurgie',
        blurb:
          'Cliniques privées accréditées, plateaux techniques de pointe et prise en charge de patients internationaux, du diagnostic au suivi post-opératoire.',
        face: '/images/groupement-photos/face-tourisme-medical.jpg',
      },
      {
        slug: 'thalassotherapie',
        label: 'Thalassothérapie',
        tag: 'Santé par la mer',
        blurb:
          'Protocoles encadrés médicalement autour de l’eau de mer, des boues et des algues, dans des centres intégrés aux hôtels 4★ et 5★ du littoral.',
        face: '/images/groupement-photos/face-thalassotherapie.jpg',
      },
      {
        slug: 'tourisme-thermal',
        label: 'Tourisme thermal',
        tag: 'Sources & hammams',
        blurb:
          'Sources chaudes de Korbous, Jebel Oust ou Jerba et une tradition thermale ancienne à moderniser en véritables pôles de cure.',
        face: '/images/groupement-photos/face-tourisme-thermal.jpg',
      },
      {
        slug: 'tourisme-senior',
        label: 'Tourisme des séniors',
        tag: 'Séjours longue durée',
        blurb:
          'Hivernage, accessibilité et accompagnement dédié : une clientèle fidèle qui allonge la saison et consomme du soin comme du loisir.',
        face: '/images/groupement-photos/face-tourisme-senior.jpg',
      },
    ],
  },
  {
    slug: 'tourisme-sportif',
    label: 'Tourisme sportif',
    children: [
      {
        slug: 'tourisme-golfique',
        label: 'Tourisme golfique',
        tag: 'Parcours 18 trous',
        blurb:
          'Dix parcours de standard international, un climat jouable toute l’année et une clientèle européenne à fort pouvoir d’achat encore sous-exploitée.',
        face: '/images/groupement-photos/face-tourisme-golfique.jpg',
      },
    ],
  },
  {
    slug: 'tourisme-nautique',
    label: 'Tourisme nautique',
    children: [
      {
        slug: 'tourisme-plaisance',
        label: 'Tourisme de plaisance',
        tag: 'Marinas & yachting',
        blurb:
          'Ports de plaisance, escales et services techniques : la filière qui capte les flux de yachting de la Méditerranée occidentale.',
        face: '/images/groupement-photos/face-tourisme-plaisance.jpg',
      },
    ],
  },
]

const CHILD_TO_HUB = new Map<string, string>()
for (const hub of GROUPEMENT_HUBS) {
  for (const child of hub.children) CHILD_TO_HUB.set(child.slug, hub.slug)
}

export function getHub(slug: string): GroupementHub | undefined {
  return GROUPEMENT_HUBS.find((h) => h.slug === slug)
}

export function isHubSlug(slug: string): boolean {
  return GROUPEMENT_HUBS.some((h) => h.slug === slug)
}

export function getParentHubSlug(childSlug: string): string | undefined {
  return CHILD_TO_HUB.get(childSlug)
}

export function getParentHub(childSlug: string): GroupementHub | undefined {
  const parent = CHILD_TO_HUB.get(childSlug)
  return parent ? getHub(parent) : undefined
}
