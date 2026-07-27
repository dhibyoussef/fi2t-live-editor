/** FI2T professional groups — home grid labels match Figma; icons mapped to matching glyphs. */
export interface GroupementItem {
  label: string
  slug: string
  icon: string
}

/** Order + labels from Figma Home « Les Groupements Professionnels ». */
export const GROUPEMENTS: GroupementItem[] = [
  { label: 'Agences de voyages', slug: 'agences-de-voyages', icon: '/images/icon1.png?v=2' },
  { label: 'Hébergement alternatif', slug: 'hebergements-alternatifs', icon: '/images/icon2.png?v=2' },
  { label: 'Tourisme culturel', slug: 'tourisme-culturel', icon: '/images/icon3.png?v=2' },
  { label: 'Tourisme de santé', slug: 'thalassotherapie', icon: '/images/icon4.png?v=2' },
  { label: "Tourisme d'aventure", slug: 'tourisme-aventure', icon: '/images/icon5.png?v=2' },
  { label: "Tourisme d'affaires", slug: 'tourisme-affaire', icon: '/images/icon6.png?v=2' },
  { label: 'Tourisme écologique', slug: 'tourisme-thermal', icon: '/images/icon7.png?v=2' },
  { label: 'Tourisme aéronautique', slug: 'tourisme-senior', icon: '/images/icon8.png?v=2' },
  { label: 'Tourisme automobile', slug: 'tourisme-automobile', icon: '/images/icon9.png?v=2' },
  { label: 'Tourisme sportif', slug: 'tourisme-golfique', icon: '/images/icon10.png?v=2' },
  { label: 'Tourisme nautique', slug: 'tourisme-plaisance', icon: '/images/icon11.png?v=2' },
  { label: 'Tourisme subaquatique', slug: 'tourisme-medical', icon: '/images/icon12.png?v=2' },
]

export function groupementsJson(): string {
  return JSON.stringify(GROUPEMENTS)
}
