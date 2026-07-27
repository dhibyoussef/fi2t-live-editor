/** Collections homepage — slug → libellé section (admin) */
export const HOME_CAROUSEL_LABELS: Record<string, string> = {
  'home-hero': 'Section Hero',
  'reunions-evenements': 'Section Réunions & Événements',
  'home-spa-gallery': 'Section Galerie Spa',
  'home-gallery': 'Section Golden Carthage en Photos',
  'home-vip-lounge': 'Section VIP Lounge',
  'vip-loung': 'Section VIP Lounge',
  'spa-reservation': 'Page Réservation Spa',
  'about-us-gallery': 'Page À propos — Galerie',
}

export function isHomeCarousel(slug: string) {
  return slug in HOME_CAROUSEL_LABELS
}

export function homeCarouselLabel(slug: string) {
  return HOME_CAROUSEL_LABELS[slug] ?? null
}

/** Mode du champ layout pour les items de galerie */
export type GalleryLayoutMode = 'grid' | 'spa-slots' | 'vip-slots' | 'about-slots'

export function galleryLayoutMode(slug: string | undefined): GalleryLayoutMode {
  if (slug === 'home-spa-gallery') return 'spa-slots'
  if (slug === 'home-vip-lounge' || slug === 'vip-loung') return 'vip-slots'
  if (slug === 'about-us-gallery') return 'about-slots'
  return 'grid'
}

const ABOUT_SLOT_LABELS: Record<string, string> = {
  hero: 'Hero',
  'photo-1': 'Section photo 1',
  'photo-2': 'Section photo 2',
  '1': 'Mosaïque — photo 1 (gauche haut)',
  '2': 'Mosaïque — photo 2 (gauche bas)',
  '3': 'Mosaïque — photo 3 (centre, pleine hauteur)',
  '4': 'Mosaïque — photo 4 (droite haut)',
  '5': 'Mosaïque — photo 5 (droite bas)',
}

export function aboutSlotLabel(layout: string) {
  return ABOUT_SLOT_LABELS[layout] ?? layout
}
