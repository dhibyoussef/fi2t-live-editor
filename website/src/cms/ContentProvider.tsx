import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { mergePageBlocks, getPageDefaults } from './pageDefaults'
import { notifyContentSaved, onContentUpdated } from './contentSync'
import { useBuilderPreview } from './BuilderPreviewProvider'
import { CACHE_TTL, invalidateCache, preloadImages, readCache, writeCache } from '../lib/dataCache'
import { pickContentValue } from './resolveContent'

export interface PendingBlock {
  page: string
  section: string
  key: string
  locale: string
  type: 'text' | 'image' | 'json'
  value: string
  label?: string
}

interface ContentContextValue {
  blocks: Record<string, string>
  loading: boolean
  get: (compoundKey: string, fallback?: string) => string
  getJson: <T>(compoundKey: string, fallback: T) => T
  setLocal: (compoundKey: string, value: string) => void
  pending: PendingBlock[]
  queueChange: (block: PendingBlock) => void
  savePending: () => Promise<void>
  clearPending: () => void
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentContextValue | null>(null)

function parseCompound(compound: string) {
  const dot = compound.indexOf('.')
  return { section: compound.slice(0, dot), key: compound.slice(dot + 1) }
}

interface Props {
  page: string
  children: ReactNode
}

export function ContentProvider({ page, children }: Props) {
  const { i18n } = useTranslation()
  const { overrides } = useBuilderPreview()
  const locale = (i18n.language || 'fr').split('-')[0]
  const cacheKey = `content:${page}:${locale}`

  const [blocks, setBlocks] = useState<Record<string, string>>(() => {
    const defaults = getPageDefaults(page, locale)
    const cached = readCache<Record<string, string>>(cacheKey)
    return cached ? mergePageBlocks(page, cached, locale) : defaults
  })
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingBlock[]>([])

  const fetchBlocks = useCallback(async () => {
    const defaults = getPageDefaults(page, locale)

    // Affichage rapide depuis le cache / defaults de la langue active
    const cached = readCache<Record<string, string>>(cacheKey)
    setBlocks(cached ? mergePageBlocks(page, cached, locale) : defaults)

    try {
      const { data } = await api.get(`/content/${page}`, { params: { locale } })
      const merged = mergePageBlocks(page, data.blocks || {}, locale)
      writeCache(cacheKey, merged, CACHE_TTL.settings)
      setBlocks(merged)
      if (page === 'home') {
        preloadImages([
          merged['hero.image'],
          merged['about.image'],
          merged['groupements.bg'],
          merged['adherer.image'],
          merged['cta.bg'],
        ].filter(Boolean) as string[])
      }
    } catch {
      setBlocks(defaults)
    } finally {
      setLoading(false)
    }
  }, [page, locale, cacheKey])

  useEffect(() => {
    // Switch language content immediately (before API round-trip)
    const defaults = getPageDefaults(page, locale)
    const cached = readCache<Record<string, string>>(cacheKey)
    setBlocks(cached ? mergePageBlocks(page, cached, locale) : defaults)
    setLoading(true)
    fetchBlocks()
  }, [fetchBlocks, page, locale, cacheKey])

  useEffect(() => {
    const unsub = onContentUpdated((msg) => {
      if (msg.source === 'website') return
      if (msg.page === page) {
        setPending([])
        invalidateCache(cacheKey)
        fetchBlocks()
      }
    })
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchBlocks()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      unsub()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [page, fetchBlocks, cacheKey])

  const get = useCallback((compoundKey: string, fallback = '') => {
    const defaults = getPageDefaults(page, locale)
    return pickContentValue(
      overrides[compoundKey],
      blocks[compoundKey],
      defaults[compoundKey],
      fallback,
    )
  }, [blocks, overrides, page, locale])

  const getJson = useCallback(<T,>(compoundKey: string, fallback: T): T => {
    const raw = pickContentValue(overrides[compoundKey], blocks[compoundKey])
    if (!raw) return fallback
    try { return JSON.parse(raw) as T } catch { return fallback }
  }, [blocks, overrides])

  const setLocal = useCallback((compoundKey: string, value: string) => {
    setBlocks((prev) => ({ ...prev, [compoundKey]: value }))
  }, [])

  const queueChange = useCallback((block: PendingBlock) => {
    setBlocks((prev) => ({ ...prev, [`${block.section}.${block.key}`]: block.value }))
    setPending((prev) => {
      const idx = prev.findIndex(
        (p) => p.page === block.page && p.section === block.section && p.key === block.key && p.locale === block.locale
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = block
        return next
      }
      return [...prev, block]
    })
  }, [])

  const savePending = useCallback(async () => {
    if (!pending.length) return
    await api.post('/admin/content/bulk', { blocks: pending })
    setPending([])
    invalidateCache(cacheKey)
    await fetchBlocks()
    notifyContentSaved(page, 'website')
  }, [pending, page, fetchBlocks, cacheKey])

  const clearPending = useCallback(() => {
    setPending([])
    invalidateCache(cacheKey)
    fetchBlocks()
  }, [fetchBlocks, cacheKey])

  return (
    <ContentContext.Provider value={{
      blocks, loading, get, getJson, setLocal, pending,
      queueChange, savePending, clearPending, refresh: fetchBlocks,
    }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}

export function useContentBlock(
  page: string,
  compoundKey: string,
  opts: {
    type?: 'text' | 'image' | 'json'
    label?: string
    fallback?: string
    /** When true, JSON/images are stored under locale `_all` (shared). Default: images shared, JSON per language. */
    shared?: boolean
  } = {}
) {
  const { get, queueChange } = useContent()
  const { i18n } = useTranslation()
  const lang = (i18n.language || 'fr').split('-')[0]
  const type = opts.type ?? 'text'
  const shared = opts.shared ?? type === 'image'
  const locale = shared ? '_all' : lang
  const { section, key } = parseCompound(compoundKey)
  const value = get(compoundKey, opts.fallback ?? '')

  const update = (newValue: string) => {
    queueChange({
      page,
      section,
      key,
      locale,
      type,
      value: newValue,
      label: opts.label,
    })
  }

  return { value, update }
}
