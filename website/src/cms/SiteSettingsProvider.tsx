import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { mergePageBlocks, getPageDefaults } from './pageDefaults'
import { onContentUpdated } from './contentSync'
import { CACHE_TTL, invalidateCache, preloadImages, readCache, writeCache } from '../lib/dataCache'
import { pickContentValue } from './resolveContent'

interface SiteSettingsContextValue {
  loading: boolean
  get: (key: string, fallback?: string) => string
  refresh: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null)

function settingsCacheKey(locale: string) {
  return `content:global:${locale}`
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const locale = (i18n.language || 'fr').split('-')[0]
  const cacheKey = settingsCacheKey(locale)

  const [blocks, setBlocks] = useState<Record<string, string>>(() => {
    const defaults = getPageDefaults('global', locale)
    const cached = readCache<Record<string, string>>(cacheKey)
    return cached ? mergePageBlocks('global', cached, locale) : defaults
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    const defaults = getPageDefaults('global', locale)
    const cached = readCache<Record<string, string>>(cacheKey)
    setBlocks(cached ? mergePageBlocks('global', cached, locale) : defaults)

    try {
      const { data: res } = await api.get('/content/global', { params: { locale } })
      let frApi: Record<string, string> | undefined
      if (locale !== 'fr') {
        try {
          const { data: frData } = await api.get('/content/global', { params: { locale: 'fr' } })
          frApi = frData.blocks || {}
        } catch {
          frApi = undefined
        }
      }
      const merged = mergePageBlocks('global', res.blocks || {}, locale, frApi)
      writeCache(cacheKey, merged, CACHE_TTL.settings)
      setBlocks(merged)
      const logo = merged['settings.logo']
      if (logo) preloadImages([logo])
    } catch {
      setBlocks(defaults)
    } finally {
      setLoading(false)
    }
  }, [locale, cacheKey])

  useEffect(() => {
    setLoading(true)
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    const unsub = onContentUpdated(msg => {
      if (msg.page === 'global') {
        invalidateCache(cacheKey)
        fetchSettings()
      }
    })
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchSettings()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      unsub()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchSettings, cacheKey])

  const get = useCallback((key: string, fallback = '') => {
    const defaults = getPageDefaults('global', locale)
    return pickContentValue(blocks[key], defaults[key], fallback)
  }, [blocks, locale])

  return (
    <SiteSettingsContext.Provider value={{ loading, get, refresh: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  return ctx
}

/** Build tel: href from display phone */
export function phoneHref(display: string): string {
  const digits = display.replace(/\D/g, '')
  return digits ? `tel:+${digits}` : '#'
}
