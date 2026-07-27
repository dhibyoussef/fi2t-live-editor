import { HOME_DEFAULTS } from '../cms/defaults/home'
import type { Carousel, CarouselItem } from '../types/api'
import { readCache } from './dataCache'

export const HERO_SLIDE_KEYS = ['hero.slide_1', 'hero.slide_2', 'hero.slide_3'] as const

export function normalizeSlideUrl(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname
  } catch {
    return url
  }
}

export function slideListsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((url, i) => normalizeSlideUrl(url) === normalizeSlideUrl(b[i]))
}

export function cmsFallbackSlides(get: (key: string, fallback?: string) => string): string[] {
  return HERO_SLIDE_KEYS.map(k => get(k, HOME_DEFAULTS[k] ?? '')).filter(Boolean)
}

export function carouselSlideUrls(items: CarouselItem[]): string[] {
  return items.map(item => item.image_url).filter(Boolean)
}

export function defaultHeroSlides(): string[] {
  return HERO_SLIDE_KEYS.map(k => HOME_DEFAULTS[k] ?? '').filter(Boolean)
}

export function getInitialHeroSlides(): string[] {
  const cached = readCache<Carousel>('carousel:home-hero')
  const fromCarousel = carouselSlideUrls(cached?.active_items ?? [])
  return fromCarousel.length > 0 ? fromCarousel : defaultHeroSlides()
}

export function preloadSlide(url: string): Promise<void> {
  return new Promise(resolve => {
    if (!url) {
      resolve()
      return
    }
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}
