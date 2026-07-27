export type ServiceIconSet = {
  base: string
  overlay?: string
}

export const SERVICE_ITEMS: readonly { icons: ServiceIconSet; title: string }[] = [
  { icons: { base: '/imgs/wifi.svg' }, title: 'Internet\nhaut débit' },
  { icons: { base: '/imgs/energy.svg' }, title: 'Borne de recharge\nélectrique' },
  { icons: { base: '/imgs/parking.svg' }, title: 'Parking\nsécurisé' },
  {
    icons: { base: '/imgs/reception.svg', overlay: '/imgs/reception1.svg' },
    title: 'Réception\n24h/24',
  },
  {
    icons: { base: '/imgs/roomservice.svg', overlay: '/imgs/roomservice1.svg' },
    title: 'Room\nservice',
  },
  {
    icons: { base: '/imgs/banquet.svg', overlay: '/imgs/banquet1.svg' },
    title: 'Service\nBanquet',
  },
  {
    icons: { base: '/imgs/traiteur.svg', overlay: '/imgs/traiteur1.svg' },
    title: 'Service\nTraiteur',
  },
  {
    icons: { base: '/imgs/transport.svg', overlay: '/imgs/transfert1.svg' },
    title: 'Transfert\nHôtel-Aéroport',
  },
  {
    icons: { base: '/imgs/navette.svg', overlay: '/imgs/navette1.svg' },
    title: 'Service\nDe Navette',
  },
]

export const SERVICE_ICON_URLS = SERVICE_ITEMS.flatMap(({ icons }) =>
  icons.overlay ? [icons.base, icons.overlay] : [icons.base],
)

export const SERVICE_SECTION_ASSETS = [
  '/logo-figma.svg',
  '/imgs/bgvictor.svg',
  '/imgs/goldencarthafe.svg',
] as const

const blobCache = new Map<string, string>()
let preloadPromise: Promise<void> | null = null

function toBlobUrl(url: string, svg: string): string {
  const existing = blobCache.get(url)
  if (existing) return existing
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  blobCache.set(url, blobUrl)
  return blobUrl
}

async function fetchSvg(url: string): Promise<string | null> {
  if (blobCache.has(url)) return blobCache.get(url)!
  try {
    const res = await fetch(url, { cache: 'force-cache' })
    if (!res.ok) return null
    return toBlobUrl(url, await res.text())
  } catch {
    return null
  }
}

/** Prefetch service SVGs once — icons are ready before the section scrolls into view. */
export function preloadServiceIcons(
  urls: readonly string[] = SERVICE_ICON_URLS,
): Promise<void> {
  const pending = urls.filter(url => !blobCache.has(url))
  if (!pending.length) return Promise.resolve()

  if (!preloadPromise) {
    preloadPromise = Promise.all(pending.map(fetchSvg)).then(() => {})
  } else {
    preloadPromise = preloadPromise.then(() => Promise.all(pending.map(fetchSvg))).then(() => {})
  }

  return preloadPromise
}

export function getServiceIconUrl(url: string): string | undefined {
  return blobCache.get(url)
}

export async function resolveServiceIconUrl(url: string): Promise<string> {
  const cached = getServiceIconUrl(url)
  if (cached) return cached
  const loaded = await fetchSvg(url)
  return loaded ?? url
}
