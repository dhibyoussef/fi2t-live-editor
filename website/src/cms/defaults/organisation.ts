import { groupementsJson } from '../../lib/groupements'

export const ORGANISATION_DEFAULTS: Record<string, string> = {
  'hero.image': '/images/qui-sommes-nous-banner.png?v=8',
  'hero.title': 'Organisation',

  /* Values are auto-calculated on the page — only labels are CMS-editable. */
  'stats.label_groupements': 'GROUPEMENTS',
  'stats.label_regions': 'RÉGIONS',
  'stats.label_mandate': 'ANS DE MANDAT',

  'board.title': 'Composition Actuelle',
  'board.members': JSON.stringify([
    { name: 'Houssem Ben Azouz', role: 'PRÉSIDENT', image: '/images/org-board/houssem-ben-azouz.svg?v=1' },
    { name: 'Chahla Khekhia', role: 'SECRÉTAIRE GÉNÉRALE', image: '/images/org-board/chahla-khekhia.svg?v=1' },
    { name: 'Ahmed Oubaia', role: 'TRÉSORIER', image: '/images/org-board/ahmed-oubaia.svg?v=1' },
    { name: 'Néjib Gana', role: 'VICE-PRÉSIDENT', image: '/images/org-board/nejib-gana.svg?v=1' },
    { name: 'Omar Cherif', role: 'CONSEILLER', image: '/images/org-board/omar-cherif.svg?v=1' },
  ]),

  'headquarters.title': 'Le bureau du siège de la Fi2T',
  'headquarters.staff': JSON.stringify([
    { initials: 'KB', name: "Khawla B'Chir", role: 'Directrice Administrative' },
    { initials: 'HI', name: 'Hiba Inoubli', role: 'Webmaster' },
    { initials: 'SS', name: 'Sarra Sallemi', role: 'Affaires administratives et comptables' },
  ]),

  'regional.title': 'Les Bureaux Régionaux',
  'regional.map_label': 'Bureaux Régionaux',
  'regional.map_image': '/images/org-regional-map-card.png?v=2',
  'regional.items': JSON.stringify([
    { name: 'Mr Nebil Azouz', region: 'Bizerte' },
    { name: 'Mme Chahla Khekhia', region: 'Le Kef' },
    { name: 'Mr Foued Ben Ammar', region: 'Hammamet/Nabeul' },
    { name: 'Mr Akram Bouzguarrou', region: 'Sousse' },
    { name: 'Mr Khaled Hayouni', region: 'Monastir/Mahdia' },
    { name: 'Mr Belgacem Kalawi', region: 'Kairouan' },
    { name: 'Mr Alaeddine Khodhri', region: 'Gabes' },
    { name: 'Mr Hatem Mejlissi', region: 'Djerba' },
  ]),

  'groupements.title': 'Les Groupements Professionnels',
  'groupements.items': groupementsJson(),
}
