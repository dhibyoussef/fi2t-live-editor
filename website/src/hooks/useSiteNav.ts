import { useEffect, useState } from 'react'
import i18n from '../i18n'
import api from '../api/client'
import { fetchCached } from '../lib/dataCache'
import { SITE_NAV, normalizeNavTree, type NavNode } from '../lib/siteNavConfig'

export type { NavNode }

export const FALLBACK_NAV = SITE_NAV

export function useSiteNav() {
  const locale = i18n.language?.split('-')[0] || 'fr'
  const [nav, setNav] = useState<NavNode[]>(FALLBACK_NAV)

  useEffect(() => {
    fetchCached(`site-nav:${locale}`, async () => {
      const r = await api.get('/site-nav', { params: { locale } })
      return Array.isArray(r.data) && r.data.length
        ? normalizeNavTree(r.data as NavNode[])
        : FALLBACK_NAV
    }).then(data => setNav(data)).catch(() => {})
  }, [locale])

  return nav
}
