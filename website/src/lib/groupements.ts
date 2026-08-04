/** FI2T professional groups — labels & order from Figma Home « Les Groupements Professionnels ». */
export interface GroupementItem {
  [key: string]: string
  label: string
  slug: string
  icon: string
}

/**
 * Canonical 12 cards on Accueil (css.css Group Item 1–12).
 * Extra pages (e.g. séniors) can still exist as routes but are not on this grid.
 */
export const GROUPEMENTS: GroupementItem[] = [
  { label: 'Agences de voyages', slug: 'agences-de-voyages', icon: '/images/icon1.png?v=5' },
  { label: 'Hébergement alternatif', slug: 'hebergements-alternatifs', icon: '/images/icon2.png?v=5' },
  { label: 'Tourisme culturel', slug: 'tourisme-culturel', icon: '/images/icon3.png?v=5' },
  { label: 'Tourisme de santé', slug: 'tourisme-de-sante', icon: '/images/icon4.png?v=5' },
  { label: "Tourisme d'aventure", slug: 'tourisme-aventure', icon: '/images/icon5.png?v=5' },
  { label: "Tourisme d'affaires", slug: 'tourisme-affaire', icon: '/images/icon6.png?v=5' },
  { label: 'Tourisme écologique', slug: 'tourisme-ecologique', icon: '/images/icon7.png?v=5' },
  { label: 'Tourisme aéronautique', slug: 'tourisme-aeronautique', icon: '/images/icon8.png?v=5' },
  { label: 'Tourisme automobile', slug: 'tourisme-automobile', icon: '/images/icon9.png?v=5' },
  { label: 'Tourisme sportif', slug: 'tourisme-sportif', icon: '/images/icon10.png?v=5' },
  { label: 'Tourisme nautique', slug: 'tourisme-nautique', icon: '/images/icon11.png?v=5' },
  { label: 'Tourisme subaquatique', slug: 'tourisme-subaquatique', icon: '/images/icon12.png?v=5' },
]

/** Old slug → new slug (only keep aliases that are NOT full Figma pages). */
export const GROUPEMENT_REDIRECTS: Record<string, string> = {
  'tourisme-aero': 'tourisme-aeronautique',
  'tourisme-affaires': 'tourisme-affaire',
}

export function groupementsJson(): string {
  return JSON.stringify(GROUPEMENTS)
}
