import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
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
  /** Persist a single block right away (used by image uploads). */
  saveBlock: (block: PendingBlock) => Promise<void>
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
  const pendingRef = useRef(pending)
  pendingRef.current = pending

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
      if (document.visibilityState !== 'visible') return
      if (pendingRef.current.length > 0) return
      void fetchBlocks()
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
    // Priority: local draft → parent Aperçu overrides → API blocks → defaults.
    // Overrides MUST beat blocks, or side-panel edits never appear in Aperçu instantané.
    const pendingHit = pending.find(
      (p) => `${p.section}.${p.key}` === compoundKey,
    )
    if (pendingHit) return pendingHit.value
    return pickContentValue(
      overrides[compoundKey],
      blocks[compoundKey],
      defaults[compoundKey],
      fallback,
    )
  }, [blocks, overrides, page, locale, pending])

  const getJson = useCallback(<T,>(compoundKey: string, fallback: T): T => {
    const pendingHit = pending.find(
      (p) => `${p.section}.${p.key}` === compoundKey,
    )
    const raw = pickContentValue(
      pendingHit?.value,
      overrides[compoundKey],
      blocks[compoundKey],
    )
    if (!raw) return fallback
    try { return JSON.parse(raw) as T } catch { return fallback }
  }, [blocks, overrides, pending])

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
    // Mirror into the admin draft so the header « Enregistrer » works from Aperçu.
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*'
        window.parent.postMessage({
          type: 'gc-builder-preview-edit',
          page: block.page,
          section: block.section,
          key: block.key,
          locale: block.locale,
          blockType: block.type,
          value: block.value,
          label: block.label,
        }, parentOrigin)
      } catch {
        /* ignore */
      }
    }
  }, [])

  /**
   * Images have no "draft" value worth keeping — the file is already uploaded,
   * so persist immediately and drop any queued entry for the same block.
   */
  const saveBlock = useCallback(async (block: PendingBlock) => {
    setBlocks((prev) => ({ ...prev, [`${block.section}.${block.key}`]: block.value }))
    await api.post('/admin/content/bulk', { blocks: [block] })
    setPending((prev) =>
      prev.filter(
        (p) =>
          !(p.page === block.page && p.section === block.section && p.key === block.key),
      ),
    )
    // Drop every locale cache so FR/EN/AR all reload the shared value
    invalidateCache(`content:${block.page}:`)
    await fetchBlocks()
    notifyContentSaved(block.page, 'website')
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*'
        window.parent.postMessage({
          type: 'gc-builder-preview-saved',
          page: block.page,
          cleared: true,
        }, parentOrigin)
      } catch { /* ignore */ }
    }
  }, [fetchBlocks])

  const savePending = useCallback(async () => {
    if (!pending.length) return
    await api.post('/admin/content/bulk', { blocks: pending })
    setPending([])
    invalidateCache(`content:${page}:`)
    await fetchBlocks()
    notifyContentSaved(page, 'website')
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*'
        window.parent.postMessage({
          type: 'gc-builder-preview-saved',
          page,
          cleared: true,
        }, parentOrigin)
      } catch { /* ignore */ }
    }
  }, [pending, page, fetchBlocks])

  const clearPending = useCallback(() => {
    setPending([])
    invalidateCache(cacheKey)
    fetchBlocks()
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        const parentOrigin = document.referrer ? new URL(document.referrer).origin : '*'
        window.parent.postMessage({
          type: 'gc-builder-preview-saved',
          page,
          cleared: true,
        }, parentOrigin)
      } catch { /* ignore */ }
    }
  }, [fetchBlocks, cacheKey, page])

  return (
    <ContentContext.Provider value={{
      blocks, loading, get, getJson, setLocal, pending,
      queueChange, saveBlock, savePending, clearPending, refresh: fetchBlocks,
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
    /**
     * Shared across FR/EN/AR (`_all`).
     * Default: images (and position JSON) are shared; text/json stay per language.
     */
    shared?: boolean
  } = {}
) {
  const { get, queueChange } = useContent()
  // saveBlock kept available on context for rare explicit callers (e.g. admin tools)
  const { i18n } = useTranslation()
  const lang = (i18n.language || 'fr').split('-')[0]
  const type = opts.type ?? 'text'
  const { section, key } = parseCompound(compoundKey)
  const shared =
    opts.shared ??
    (type === 'image' || key === 'badge_pos' || key.endsWith('_pos') || key.endsWith('_alt'))
  const locale = shared ? '_all' : lang
  const value = get(compoundKey, opts.fallback ?? '')

  const asBlock = (newValue: string): PendingBlock => ({
    page,
    section,
    key,
    locale,
    type,
    value: newValue,
    label: opts.label,
  })

  const update = (newValue: string) => queueChange(asBlock(newValue))
  /** Queue only — nothing persists until the toolbar « Enregistrer » button. */
  const commit = (newValue: string) => queueChange(asBlock(newValue))

  return { value, update, commit, shared, locale }
}
