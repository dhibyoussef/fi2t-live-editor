import { groupementsJson } from '../../lib/groupements'

export const ORGANISATION_DEFAULTS: Record<string, string> = {
  'hero.image': '/hero.jpg',
  'hero.title': 'Organisation',

  'stats.items': JSON.stringify([
    { value: '12', label: 'GROUPEMENTS' },
    { value: '11', label: 'RÉGIONS' },
    { value: '03', label: 'ANS DE MANDAT' },
  ]),

  'board.title': 'Composition Actuelle',
  'board.members': JSON.stringify([
    { name: 'Houssem Ben Azouz', role: 'PRÉSIDENT', image: '' },
    { name: 'Chahla Khekhia', role: 'SECRÉTAIRE GÉNÉRALE', image: '' },
    { name: 'Ahmed Oubaia', role: 'TRÉSORIER', image: '' },
    { name: 'Néjib Gana', role: 'VICE-PRÉSIDENT', image: '' },
    { name: 'Omar Cherif', role: 'CONSEILLER', image: '' },
  ]),

  'headquarters.title': 'Le bureau du siège de la Fi2T',
  'headquarters.staff': JSON.stringify([
    { initials: 'KB', name: "Khawla B'Chir", role: 'Directrice Administrative' },
    { initials: 'HI', name: 'Hiba Inoubli', role: 'Webmaster' },
    { initials: 'SS', name: 'Sarra Sallemi', role: 'Affaires administratives et comptables' },
  ]),

  'regional.title': 'Les Bureaux Régionaux',
  'regional.map_label': '11 Bureaux Régionaux',
  'regional.map_image': '/hero.jpg',
  'regional.items': JSON.stringify([
    { name: 'Mr Nebil Azouz', region: 'Bizerte' },
    { name: 'Mr Foued Ben Ammar', region: 'Hammamet/Nabeul' },
    { name: 'Mr Khaled Hayouni', region: 'Monastir/Mahdia' },
    { name: 'Mr Alaeddine Khodhri', region: 'Gabes' },
    { name: 'Mme Chahla Khekhia', region: 'Le Kef' },
    { name: 'Mr Akram Bouzguarrou', region: 'Sousse' },
    { name: 'Mr Belgacem Kalawi', region: 'Kairouan' },
    { name: 'Mr Hatem Mejlissi', region: 'Djerba' },
  ]),

  'groupements.title': 'Les Groupements Professionnels',
  'groupements.items': groupementsJson(),
}
