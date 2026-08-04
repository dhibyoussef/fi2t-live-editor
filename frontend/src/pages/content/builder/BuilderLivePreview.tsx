import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ExternalLink, Monitor, Smartphone, Tablet,
  RefreshCw, Maximize2, Minimize2, Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { buildPreviewOverrides } from './buildPreviewOverrides'
import type { BuilderSection } from './PageBuilder'
import { createEditSessionToken, websiteOrigin } from '../../../api/editSession'

const WEBSITE_ORIGIN = websiteOrigin()
const PREVIEW_MSG = 'gc-builder-preview'
const PREVIEW_READY = 'gc-builder-preview-ready'

type Device = 'desktop' | 'tablet' | 'mobile'
type PreviewLocale = 'fr' | 'en' | 'ar'

/** Real CSS viewport widths — media queries (and Figma artboards) use these. */
const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
}

const DEVICE_HEIGHT: Record<Device, number> = {
  desktop: 3200,
  tablet: 2400,
  mobile: 2000,
}

interface PendingChange {
  section: string
  key: string
  locale: string
  value: string
}

interface Props {
  pageSlug: string
  sections: BuilderSection[]
  changes: Record<string, PendingChange>
  selectedSection: string | null
  expanded?: boolean
  onToggleExpand?: () => void
  showToolbar?: boolean
  onLocaleChange?: (locale: PreviewLocale) => void
}

const LOCALES: { code: PreviewLocale; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'ar', flag: '🇹🇳', label: 'AR' },
]

function buildPreviewUrl(pageSlug: string, token: string | null) {
  const path = pageSlug === 'home' ? '/' : `/${pageSlug}`
  const params = new URLSearchParams({ builder_preview: '1' })
  if (token) params.set('edit_token', token)
  return `${WEBSITE_ORIGIN}${path}?${params}`
}

export default function BuilderLivePreview({
  pageSlug,
  sections,
  changes,
  selectedSection,
  expanded = false,
  onToggleExpand,
  showToolbar = true,
  onLocaleChange,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const [locale, setLocale] = useState<PreviewLocale>('fr')
  const [zoom, setZoom] = useState(100)
  const [wrapWidth, setWrapWidth] = useState(0)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [editToken, setEditToken] = useState<string | null>(null)

  // Short-lived Live Editor token — never put the long admin PAT in the iframe URL
  useEffect(() => {
    let cancelled = false
    setEditToken(null)
    createEditSessionToken()
      .then((t) => { if (!cancelled) setEditToken(t) })
      .catch(() => { if (!cancelled) setEditToken(null) })
    return () => { cancelled = true }
  }, [iframeKey, pageSlug])

  const previewUrl = useMemo(
    () => (editToken ? buildPreviewUrl(pageSlug, editToken) : null),
    [pageSlug, editToken],
  )

  const setPreviewLocale = (next: PreviewLocale) => {
    setLocale(next)
    onLocaleChange?.(next)
  }

  const overrides = useMemo(
    () => buildPreviewOverrides(pageSlug, sections, changes, locale),
    [pageSlug, sections, changes, locale],
  )

  const pushPreview = useCallback((scrollTo = false) => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    win.postMessage({
      type: PREVIEW_MSG,
      page: pageSlug,
      locale,
      overrides,
      highlightSection: selectedSection,
      scrollToSection: scrollTo ? selectedSection : null,
      device,
    }, WEBSITE_ORIGIN)
  }, [pageSlug, locale, overrides, selectedSection, device])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== WEBSITE_ORIGIN) return
      if (e.data?.type === PREVIEW_READY) setIframeReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!iframeReady) return
    const t = setTimeout(() => pushPreview(false), 120)
    return () => clearTimeout(t)
  }, [iframeReady, overrides, locale, selectedSection, device, pushPreview])

  useEffect(() => {
    if (!iframeReady || !selectedSection) return
    const t = setTimeout(() => pushPreview(true), 200)
    return () => clearTimeout(t)
  }, [selectedSection, iframeReady, pushPreview])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const measure = () => setWrapWidth(wrap.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [expanded, device])

  const artboardW = DEVICE_WIDTH[device]
  const artboardH = DEVICE_HEIGHT[device]
  /*
   * Fit the artboard to the panel (no forced 75% floor — that clipped the hero).
   * Zoom above 100% still lets editors get closer when they want.
   */
  const available = Math.max(280, wrapWidth - (device === 'desktop' ? 0 : 24))
  const fitScale = wrapWidth > 0 ? Math.min(1, available / artboardW) : 1
  const scale = fitScale * (zoom / 100)
  const shellW = Math.round(artboardW * scale)
  const shellH = Math.round(artboardH * scale)
  const effectivePct = Math.round(scale * 100)

  const openInTab = async () => {
    try {
      const token = await createEditSessionToken()
      const path = pageSlug === 'home' ? '/' : `/${pageSlug}`
      const url = new URL(`${WEBSITE_ORIGIN}${path}`)
      url.searchParams.set('edit_token', token)
      window.open(url.toString(), '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Session d’édition indisponible — reconnectez-vous')
    }
  }

  return (
    <div className={`pb-live${expanded ? ' pb-live--expanded' : ''}`}>
      {showToolbar && (
        <div className="pb-live__toolbar">
          <div className="pb-live__toolbar-group">
            <span className="pb-live__label">Aperçu live</span>
            <div className="pb-live__devices">
              {([
                ['desktop', Monitor, 'Bureau 1440px'],
                ['tablet', Tablet, 'Tablette 768px'],
                ['mobile', Smartphone, 'Mobile 390px'],
              ] as const).map(([d, Icon, title]) => (
                <button
                  key={d}
                  type="button"
                  title={title}
                  className={device === d ? 'active' : ''}
                  onClick={() => setDevice(d)}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <span className="pb-live__device-size">{artboardW}px</span>
          </div>

          <div className="pb-live__toolbar-group">
            <Globe size={13} />
            <div className="pb-live__locales">
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={locale === l.code ? 'active' : ''}
                  onClick={() => setPreviewLocale(l.code)}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-live__toolbar-group pb-live__zoom">
            <input
              type="range"
              min={50}
              max={160}
              step={5}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              title={`Zoom ${zoom}% (affichage ${effectivePct}%)`}
            />
            <span>{effectivePct}%</span>
          </div>

          <div className="pb-live__toolbar-actions">
            <button type="button" title="Actualiser" onClick={() => { setIframeReady(false); setIframeKey(k => k + 1) }}>
              <RefreshCw size={14} />
            </button>
            {onToggleExpand && (
              <button type="button" title={expanded ? 'Réduire' : 'Plein écran'} onClick={onToggleExpand}>
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}
            <button type="button" title="Ouvrir dans un nouvel onglet" onClick={() => void openInTab()}>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="pb-live__frame-wrap" ref={wrapRef}>
        {!previewUrl ? (
          <p className="pb-live__loading">Préparation de la session sécurisée…</p>
        ) : (
          <div
            className={`pb-live__frame${device !== 'desktop' ? ' pb-live__frame--device' : ''}`}
            style={{ width: shellW, height: shellH }}
          >
            <iframe
              ref={iframeRef}
              key={`${iframeKey}-${artboardW}-${editToken?.slice(-8) ?? 'x'}`}
              src={previewUrl}
              title="Aperçu du site"
              className="pb-live__iframe"
              width={artboardW}
              height={artboardH}
              style={{
                width: artboardW,
                height: artboardH,
                maxWidth: 'none',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              onLoad={() => {
                setIframeReady(true)
                setTimeout(() => pushPreview(false), 300)
              }}
            />
          </div>
        )}
      </div>

      {Object.keys(changes).length > 0 && (
        <p className="pb-live__draft-hint">
          Modifications non enregistrées visibles dans l'aperçu
        </p>
      )}
    </div>
  )
}
