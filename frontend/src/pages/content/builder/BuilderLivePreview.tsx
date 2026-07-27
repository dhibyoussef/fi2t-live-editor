import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ExternalLink, Monitor, Smartphone, Tablet,
  RefreshCw, Maximize2, Minimize2, Globe,
} from 'lucide-react'
import { buildPreviewOverrides } from './buildPreviewOverrides'
import type { BuilderSection } from './PageBuilder'

const WEBSITE_ORIGIN = 'http://localhost:3002'
const PREVIEW_MSG = 'gc-builder-preview'
const PREVIEW_READY = 'gc-builder-preview-ready'

type Device = 'desktop' | 'tablet' | 'mobile'
type PreviewLocale = 'fr' | 'en' | 'ar'

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
}

const DEVICE_WIDTH: Record<Device, string | number> = {
  desktop: '100%',
  tablet: 768,
  mobile: 390,
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
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const [locale, setLocale] = useState<PreviewLocale>('fr')
  const [zoom, setZoom] = useState(100)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('gc_token') : null
  const previewUrl = useMemo(() => buildPreviewUrl(pageSlug, token), [pageSlug, token, iframeKey])

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
    }, WEBSITE_ORIGIN)
  }, [pageSlug, locale, overrides, selectedSection])

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
  }, [iframeReady, overrides, locale, selectedSection, pushPreview])

  useEffect(() => {
    if (!iframeReady || !selectedSection) return
    const t = setTimeout(() => pushPreview(true), 200)
    return () => clearTimeout(t)
  }, [selectedSection, iframeReady, pushPreview])

  const frameWidth = DEVICE_WIDTH[device]
  const numericWidth = typeof frameWidth === 'number' ? frameWidth : null

  return (
    <div className={`pb-live${expanded ? ' pb-live--expanded' : ''}`}>
      {showToolbar && (
        <div className="pb-live__toolbar">
          <div className="pb-live__toolbar-group">
            <span className="pb-live__label">Aperçu live</span>
            <div className="pb-live__devices">
              {([
                ['desktop', Monitor, 'Bureau'],
                ['tablet', Tablet, 'Tablette'],
                ['mobile', Smartphone, 'Mobile'],
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
          </div>

          <div className="pb-live__toolbar-group">
            <Globe size={13} />
            <div className="pb-live__locales">
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  type="button"
                  className={locale === l.code ? 'active' : ''}
                  onClick={() => setLocale(l.code)}
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
              max={100}
              step={5}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              title={`Zoom ${zoom}%`}
            />
            <span>{zoom}%</span>
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
            <a href={`${WEBSITE_ORIGIN}${pageSlug === 'home' ? '/' : `/${pageSlug}`}`} target="_blank" rel="noopener noreferrer" title="Ouvrir dans un nouvel onglet">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      <div className="pb-live__frame-wrap">
        <div
          className={`pb-live__frame${device !== 'desktop' ? ' pb-live__frame--device' : ''}`}
          style={{
            width: numericWidth ? `${numericWidth}px` : '100%',
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={previewUrl}
            title="Aperçu du site"
            className="pb-live__iframe"
            onLoad={() => {
              setIframeReady(true)
              setTimeout(() => pushPreview(false), 300)
            }}
          />
        </div>
      </div>

      {Object.keys(changes).length > 0 && (
        <p className="pb-live__draft-hint">
          Modifications non enregistrées visibles dans l'aperçu
        </p>
      )}
    </div>
  )
}
