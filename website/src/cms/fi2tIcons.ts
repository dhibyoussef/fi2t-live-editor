/** Full FI2T icon library for CMS pickers (groupements + values + tourism set). */

export type Fi2tIconOption = {
  path: string
  label: string
  category: string
  keywords?: string
}

const GROUPEMENT_ICONS: Fi2tIconOption[] = [
  { path: '/images/icon1.png?v=5', label: 'Agences', category: 'Groupements', keywords: 'agences voyages' },
  { path: '/images/icon2.png?v=5', label: 'Hébergements', category: 'Groupements', keywords: 'hotel hebergement' },
  { path: '/images/icon3.png?v=5', label: 'Culturel', category: 'Groupements', keywords: 'culture' },
  { path: '/images/icon4.png?v=5', label: 'Santé', category: 'Groupements', keywords: 'medical sante' },
  { path: '/images/icon5.png?v=5', label: 'Aventure', category: 'Groupements', keywords: 'aventure' },
  { path: '/images/icon6.png?v=5', label: 'Affaires', category: 'Groupements', keywords: 'business' },
  { path: '/images/icon7.png?v=5', label: 'Écologique', category: 'Groupements', keywords: 'eco nature' },
  { path: '/images/icon8.png?v=5', label: 'Aéronautique', category: 'Groupements', keywords: 'avion air' },
  { path: '/images/icon9.png?v=5', label: 'Automobile', category: 'Groupements', keywords: 'voiture auto' },
  { path: '/images/icon10.png?v=5', label: 'Sportif', category: 'Groupements', keywords: 'sport' },
  { path: '/images/icon11.png?v=5', label: 'Nautique', category: 'Groupements', keywords: 'mer bateau' },
  { path: '/images/icon12.png?v=5', label: 'Subaquatique', category: 'Groupements', keywords: 'plongee' },
]

const VALUE_ICONS: Fi2tIconOption[] = [
  { path: '/images/value-durabilite.svg', label: 'Durabilité', category: 'Valeurs', keywords: 'durable' },
  { path: '/images/value-excellence.svg', label: 'Excellence', category: 'Valeurs' },
  { path: '/images/value-innovation.svg', label: 'Innovation', category: 'Valeurs' },
  { path: '/images/value-integrity.svg', label: 'Intégrité', category: 'Valeurs' },
  { path: '/images/value-representation.svg', label: 'Représentation', category: 'Valeurs' },
  { path: '/images/value-synergie.svg', label: 'Synergie', category: 'Valeurs' },
]

const STRUCTURE_ICONS: Fi2tIconOption[] = [
  { path: '/images/g-icon-cadre.svg', label: 'Cadre', category: 'Structure' },
  { path: '/images/g-icon-interets.svg', label: 'Intérêts', category: 'Structure' },
  { path: '/images/g-icon-structure.svg', label: 'Structure', category: 'Structure' },
  { path: '/images/g-icon-valeur.svg', label: 'Valeur', category: 'Structure' },
]

/** Tourism / organisation library — unique icons for new groupements. */
const LIBRARY_DEFS: { id: string; label: string; keywords?: string }[] = [
  { id: 'hotel', label: 'Hôtel', keywords: 'hebergement lodging' },
  { id: 'bed', label: 'Lit', keywords: 'chambre bed' },
  { id: 'restaurant', label: 'Restaurant', keywords: 'food cuisine' },
  { id: 'camera', label: 'Appareil photo', keywords: 'photo tourisme' },
  { id: 'map', label: 'Carte', keywords: 'carte itineraire' },
  { id: 'compass', label: 'Boussole', keywords: 'orientation' },
  { id: 'tent', label: 'Tente', keywords: 'camping aventure' },
  { id: 'mountain', label: 'Montagne', keywords: 'randonnee' },
  { id: 'palm', label: 'Palmier', keywords: 'plage tropique' },
  { id: 'wave', label: 'Vagues', keywords: 'mer ocean' },
  { id: 'anchor', label: 'Ancre', keywords: 'port plaisance' },
  { id: 'sail', label: 'Voile', keywords: 'bateau voile' },
  { id: 'fish', label: 'Poisson', keywords: 'peche' },
  { id: 'dive', label: 'Plongée', keywords: 'subaquatique' },
  { id: 'car', label: 'Voiture', keywords: 'auto' },
  { id: 'bus', label: 'Bus', keywords: 'transport' },
  { id: 'train', label: 'Train', keywords: 'rail' },
  { id: 'plane', label: 'Avion', keywords: 'aerien' },
  { id: 'helicopter', label: 'Hélicoptère', keywords: 'air' },
  { id: 'briefcase', label: 'Mallette', keywords: 'affaires business' },
  { id: 'calendar', label: 'Calendrier', keywords: 'evenement' },
  { id: 'users', label: 'Groupe', keywords: 'membres people' },
  { id: 'user', label: 'Personne', keywords: 'profil' },
  { id: 'handshake', label: 'Poignée de main', keywords: 'partenariat' },
  { id: 'megaphone', label: 'Mégaphone', keywords: 'communication' },
  { id: 'shield', label: 'Bouclier', keywords: 'protection' },
  { id: 'award', label: 'Médaille', keywords: 'prix' },
  { id: 'star', label: 'Étoile', keywords: 'favori' },
  { id: 'heart', label: 'Cœur', keywords: 'sante soin' },
  { id: 'leaf', label: 'Feuille', keywords: 'eco nature' },
  { id: 'sun', label: 'Soleil', keywords: 'climat' },
  { id: 'spa', label: 'Spa', keywords: 'thalasso wellness' },
  { id: 'medical', label: 'Médical', keywords: 'croix hopital' },
  { id: 'pill', label: 'Médicament', keywords: 'pharma' },
  { id: 'thermometer', label: 'Thermomètre', keywords: 'thermal' },
  { id: 'building', label: 'Immeuble', keywords: 'bureau' },
  { id: 'museum', label: 'Musée', keywords: 'culture' },
  { id: 'church', label: 'Patrimoine', keywords: 'heritage' },
  { id: 'flag', label: 'Drapeau', keywords: 'nation' },
  { id: 'trophy', label: 'Trophée', keywords: 'sport' },
  { id: 'golf', label: 'Golf', keywords: 'sport golf' },
  { id: 'bike', label: 'Vélo', keywords: 'cyclisme' },
  { id: 'ticket', label: 'Billet', keywords: 'entree' },
  { id: 'music', label: 'Musique', keywords: 'festival' },
  { id: 'film', label: 'Cinéma', keywords: 'film' },
  { id: 'gift', label: 'Cadeau', keywords: 'offre' },
  { id: 'shopping', label: 'Shopping', keywords: 'commerce' },
  { id: 'wifi', label: 'Wifi', keywords: 'digital' },
  { id: 'globe', label: 'Globe', keywords: 'international' },
  { id: 'chart', label: 'Graphique', keywords: 'stats' },
  { id: 'target', label: 'Cible', keywords: 'objectif' },
  { id: 'rocket', label: 'Fusée', keywords: 'innovation' },
  { id: 'lightbulb', label: 'Ampoule', keywords: 'idee' },
  { id: 'settings', label: 'Réglages', keywords: 'config' },
  { id: 'network', label: 'Réseau', keywords: 'federation' },
  { id: 'book', label: 'Livre', keywords: 'formation' },
  { id: 'graduation', label: 'Diplôme', keywords: 'education' },
  { id: 'briefcase_plus', label: 'Emploi+', keywords: 'recrutement' },
  { id: 'tree', label: 'Arbre', keywords: 'foret' },
  { id: 'flower', label: 'Fleur', keywords: 'jardin' },
  { id: 'campfire', label: 'Feu de camp', keywords: 'camping' },
  { id: 'binoculars', label: 'Jumelles', keywords: 'observation' },
  { id: 'key', label: 'Clé', keywords: 'acces' },
  { id: 'lock', label: 'Cadenas', keywords: 'securite' },
  { id: 'check', label: 'Validé', keywords: 'ok' },
  { id: 'spark', label: 'Éclat', keywords: 'qualite' },
  { id: 'coins', label: 'Pièces', keywords: 'finance' },
  { id: 'wallet', label: 'Portefeuille', keywords: 'budget' },
  { id: 'scale', label: 'Balance', keywords: 'justice' },
  { id: 'clipboard', label: 'Presse-papiers', keywords: 'checklist' },
  { id: 'phone', label: 'Téléphone', keywords: 'contact' },
  { id: 'mail', label: 'Email', keywords: 'courrier' },
  { id: 'pin_map', label: 'Épingle', keywords: 'localisation' },
  { id: 'home', label: 'Maison', keywords: 'accueil' },
  { id: 'store', label: 'Boutique', keywords: 'magasin' },
  { id: 'craft', label: 'Artisanat', keywords: 'fait main' },
  { id: 'wine', label: 'Vin', keywords: 'gastronomie' },
  { id: 'coffee', label: 'Café', keywords: 'hospitalite' },
]

const LIBRARY_ICONS: Fi2tIconOption[] = LIBRARY_DEFS.map((d) => ({
  path: `/images/icon-library/${d.id}.svg`,
  label: d.label,
  category: 'Bibliothèque',
  keywords: d.keywords,
}))

export const FI2T_ICON_OPTIONS: Fi2tIconOption[] = [
  ...GROUPEMENT_ICONS,
  ...VALUE_ICONS,
  ...STRUCTURE_ICONS,
  ...LIBRARY_ICONS,
]

export const FI2T_ICON_CATEGORIES = [
  'Tous',
  'Groupements',
  'Valeurs',
  'Structure',
  'Bibliothèque',
] as const

export function normalizeIconPath(path: string) {
  return path.split('?')[0]
}

export function isFi2tIconPath(path: string) {
  const base = normalizeIconPath(path)
  return FI2T_ICON_OPTIONS.some((o) => normalizeIconPath(o.path) === base)
}

export function filterFi2tIcons(opts: {
  category?: string
  query?: string
}): Fi2tIconOption[] {
  const cat = opts.category && opts.category !== 'Tous' ? opts.category : null
  const q = (opts.query ?? '').trim().toLowerCase()
  return FI2T_ICON_OPTIONS.filter((o) => {
    if (cat && o.category !== cat) return false
    if (!q) return true
    const hay = `${o.label} ${o.category} ${o.keywords ?? ''} ${normalizeIconPath(o.path)}`.toLowerCase()
    return hay.includes(q)
  })
}
