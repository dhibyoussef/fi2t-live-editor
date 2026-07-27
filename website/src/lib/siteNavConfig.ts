export interface NavNode {
  id: number
  label: string
  url: string
  open_in_new_tab?: boolean
  children?: NavNode[]
}

/** Canonical site navigation — kept in sync with backend SiteNavSeeder */
export const SITE_NAV: NavNode[] = [
  {
    id: 1,
    label: 'Hébergement',
    url: '/chambres',
    children: [
      { id: 11, label: 'Chambres', url: '/chambres', children: [] },
      { id: 13, label: 'Suites', url: '/suites', children: [] },
      { id: 12, label: 'Appartements', url: '/appartements', children: [] },
    ],
  },
  { id: 2, label: 'Restaurants', url: '/restaurants', children: [] },
  {
    id: 3,
    label: 'Séminaire',
    url: '/seminaire',
    children: [
      { id: 31, label: 'Salles de réunion', url: '/seminaire', children: [] },
      { id: 32, label: 'Événements', url: '/seminaire', children: [] },
    ],
  },
  {
    id: 4,
    label: 'Spa',
    url: '/spa',
    children: [
      { id: 42, label: 'Réservation', url: '/spa/reservation', children: [] },
    ],
  },
  { id: 5, label: 'À propos', url: '/about', children: [] },
  { id: 6, label: 'Services', url: '/services', children: [] },
  { id: 7, label: 'Contact', url: '/contact', children: [] },
]

/** NavLink `end={false}` for section roots that have sub-routes */
export function navSubpathMatch(url: string): boolean {
  const path = url.split('?')[0]
  return (
    path === '/chambres' ||
    path === '/appartements' ||
    path === '/hebergement-reservation' ||
    path === '/restaurants' ||
    path === '/seminaire' ||
    path === '/spa' ||
    path === '/about' ||
    path === '/services'
  )
}

const HEBERGEMENT_SECTION_PATHS = [
  '/chambres',
  '/appartements',
  '/hebergement-reservation',
  '/suites',
] as const

/** Custom active state — handles query params and hébergement sub-routes */
export function isNavItemActive(
  item: Pick<NavNode, 'url' | 'children'>,
  pathname: string,
  search: string,
): boolean {
  const [itemPath, itemQuery] = item.url.split('?')
  const hasChildren = (item.children?.length ?? 0) > 0

  if (itemQuery) {
    if (pathname !== itemPath) return false
    const expected = new URLSearchParams(itemQuery)
    const actual = new URLSearchParams(search)
    for (const [key, value] of expected) {
      if (actual.get(key) !== value) return false
    }
    return true
  }

  if (pathname === itemPath) return true

  if (navSubpathMatch(itemPath) && pathname.startsWith(`${itemPath}/`)) return true

  if (hasChildren && itemPath === '/chambres') {
    return HEBERGEMENT_SECTION_PATHS.some(
      p => pathname === p || pathname.startsWith(`${p}/`),
    )
  }

  if (!hasChildren && itemPath === '/chambres') {
    if (pathname === '/chambres' || pathname.startsWith('/chambres/')) return true
    if (pathname === '/hebergement-reservation') {
      const acc = new URLSearchParams(search).get('accommodation')
      return !acc || acc === 'CHAMBRE'
    }
  }

  if (item.url.includes('accommodation=SUITE') || itemPath === '/suites') {
    if (pathname === '/suites') return true
    if (pathname === '/hebergement-reservation') {
      return new URLSearchParams(search).get('accommodation') === 'SUITE'
    }
  }

  return false
}

export const RESERVATION_URL = '/hebergement-reservation'

const LEGACY_URL_FIXES: Record<string, string> = {
  '/evenements': '/seminaire',
  '/residences': '/chambres',
}

/** Normalize nav tree — fixes stale URLs from older DB seeders */
export function normalizeNavTree(items: NavNode[]): NavNode[] {
  return items.map(item => {
    const children = item.children?.length
      ? normalizeNavTree(item.children.filter(child => child.url !== '/spa/soins'))
      : item.children

    const normalized: NavNode = {
      ...item,
      url: LEGACY_URL_FIXES[item.url] ?? item.url,
      children,
    }

    // Hébergement: ensure 3 submenu items (chambres, suites, appartements)
    const isHebergementParent = normalized.children?.some(
      c => c.url === '/appartements' || c.url.startsWith('/appartements'),
    )
    if (isHebergementParent) {
      const children = normalized.children ?? []
      const chambres = children.find(c => c.url.split('?')[0] === '/chambres')
      const suites = children.find(
        c => c.url === '/suites' || c.url.includes('accommodation=SUITE'),
      )
      const appartements = children.find(c => c.url.split('?')[0] === '/appartements')

      normalized.children = [
        {
          ...(chambres ?? { id: 11, label: 'Chambres', url: '/chambres', children: [] }),
          url: '/chambres',
          label:
            chambres?.label && /chambres\s*&\s*suites/i.test(chambres.label)
              ? 'Chambres'
              : (chambres?.label ?? 'Chambres'),
        },
        {
          ...(suites ?? { id: 13, label: 'Suites', url: '/suites', children: [] }),
          url: '/suites',
          label: suites?.label ?? 'Suites',
        },
        {
          ...(appartements ?? { id: 12, label: 'Appartements', url: '/appartements', children: [] }),
          url: '/appartements',
          label: appartements?.label ?? 'Appartements',
        },
      ]
    }

    return normalized
  })
}
