import { readCache } from './dataCache'
import { GLOBAL_DEFAULTS } from '../cms/defaults/global'
import { defaultHeroSlides } from './heroSlides'
import { preloadImages } from './dataCache'
import { preloadServiceIcons, SERVICE_ICON_URLS, SERVICE_SECTION_ASSETS } from './serviceIcons'

/** Warm logo + hero slides from cache before React paints. Call once at app boot. */
export function preloadBootAssets(): void {
  const urls: string[] = [
    '/logo-figma.svg',
    '/logo.svg',
    ...defaultHeroSlides(),
    ...SERVICE_SECTION_ASSETS,
    ...SERVICE_ICON_URLS,
  ]

  const settings = readCache<Record<string, string>>('content:global:fr')
    ?? readCache<Record<string, string>>('content:global:en')
  if (settings?.['settings.logo']) urls.push(settings['settings.logo'])

  const hero = readCache<{ active_items?: { image_url?: string }[] }>('carousel:home-hero')
  hero?.active_items?.forEach(item => {
    if (item.image_url) urls.push(item.image_url)
  })

  const rooms = readCache<{ media?: { url: string }[] }[]>('room-categories/public')
  rooms?.forEach(cat => {
    cat.media?.forEach(m => { if (m.url) urls.push(m.url) })
  })

  if (!settings?.['settings.logo'] && GLOBAL_DEFAULTS['settings.logo']) {
    urls.push(GLOBAL_DEFAULTS['settings.logo'])
  }

  preloadImages(urls)
  preloadServiceIcons()
}
