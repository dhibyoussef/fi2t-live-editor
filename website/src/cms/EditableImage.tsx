import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'
import { uploadWebsiteImage } from './uploadWebsiteImage'
import { publicUrl } from '../lib/publicUrl'

interface Props {
  page: string
  blockKey: string
  label?: string
  className?: string
  alt?: string
  /** Optional CMS text key for alt (default: derived from blockKey). */
  altBlockKey?: string
  fallback?: string
  style?: React.CSSProperties
  /**
   * `default` — wraps the visible image + pencil.
   * `chip` — pencil only (pair with a plain `<img>` for full-bleed heroes).
   */
  variant?: 'default' | 'chip'
}

function deriveAltBlockKey(imageKey: string) {
  return `${imageKey}_alt`
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function ImageEditPanel({
  label,
  src,
  altValue,
  uploading,
  style,
  panelRef,
  onPathChange,
  onAltChange,
  onChangeFile,
  onClose,
}: {
  label?: string
  src: string
  altValue: string
  uploading: boolean
  style?: React.CSSProperties
  panelRef?: React.Ref<HTMLDivElement>
  onPathChange: (path: string) => void
  onAltChange: (alt: string) => void
  onChangeFile: () => void
  onClose: () => void
}) {
  return (
    <div
      ref={panelRef}
      className="cms-image-panel cms-image-panel--fixed"
      role="dialog"
      aria-label={label || 'Modifier l’image'}
      style={style}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="cms-image-panel__head">
        <strong>{label || 'Image'}</strong>
        <button type="button" className="cms-image-panel__close" onClick={onClose} aria-label="Fermer">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="cms-image-panel__row">
        <button
          type="button"
          className="cms-image-panel__preview-btn"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChangeFile()
          }}
          disabled={uploading}
          title="Changer l’image"
        >
          {src ? <img src={src} alt="" /> : <span className="cms-image-panel__empty">Aucune image</span>}
          <span className="cms-image-panel__change">{uploading ? 'Envoi…' : 'Changer'}</span>
        </button>

        <label className="cms-image-panel__field cms-image-panel__field--grow">
          <span>Chemin / URL</span>
          <input
            className="cms-image-panel__input"
            value={src}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder="/images/…"
          />
        </label>
      </div>

      <label className="cms-image-panel__field">
        <span>Texte alternatif (alt)</span>
        <input
          className="cms-image-panel__input"
          value={altValue}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Description de l’image"
        />
      </label>
    </div>
  )
}

export default function EditableImage({
  page,
  blockKey,
  label,
  className = '',
  alt = '',
  altBlockKey,
  fallback = '',
  style,
  variant = 'default',
}: Props) {
  const { isEditMode } = useEditMode()
  const { value, update } = useContentBlock(page, blockKey, { type: 'image', label, fallback })
  const resolvedAltKey = altBlockKey || deriveAltBlockKey(blockKey)
  const { value: altStored, update: updateAlt } = useContentBlock(page, resolvedAltKey, {
    type: 'text',
    label: `${label || 'Image'} — Alt`,
    fallback: alt,
    shared: true,
  })
  const [uploading, setUploading] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [pathDraft, setPathDraft] = useState('')
  const [altDraft, setAltDraft] = useState('')
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickingRef = useRef(false)

  const src = publicUrl(value || fallback)
  const displayAlt = (altStored || alt || '').trim()

  useEffect(() => {
    if (!panelOpen) return
    setPathDraft(src)
    setAltDraft(displayAlt)
  }, [panelOpen, src, displayAlt])

  useLayoutEffect(() => {
    if (!panelOpen) {
      setPanelPos(null)
      return
    }

    const place = () => {
      const anchor = rootRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const margin = 12
      const gap = 8
      const width = Math.min(340, window.innerWidth - margin * 2)
      const height = panelRef.current?.offsetHeight || 220

      let left = rect.left
      // Prefer opening to the right of the anchor; if that overflows, flip left.
      if (left + width > window.innerWidth - margin) {
        left = rect.right - width
      }
      left = clamp(left, margin, window.innerWidth - width - margin)

      let top = rect.bottom + gap
      if (top + height > window.innerHeight - margin) {
        top = rect.top - height - gap
      }
      top = clamp(top, margin, Math.max(margin, window.innerHeight - height - margin))

      setPanelPos({ top, left })
    }

    place()
    // Re-measure after paint (panel height known) and on resize/scroll.
    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [panelOpen])

  useEffect(() => {
    if (!panelOpen) return
    const onDoc = (e: MouseEvent) => {
      if (pickingRef.current) return
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setPanelOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickingRef.current) setPanelOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [panelOpen])

  const openPicker = () => {
    pickingRef.current = true
    // Keep panel open while the OS file dialog is up (mousedown would otherwise close it).
    inputRef.current?.click()
    window.setTimeout(() => {
      pickingRef.current = false
    }, 1500)
  }

  const upload = async (file: File) => {
    setUploading(true)
    pickingRef.current = false
    try {
      const url = await uploadWebsiteImage(file)
      update(url)
      setPathDraft(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du téléversement.'
      alert(msg)
    } finally {
      setUploading(false)
    }
  }

  const savePath = (next: string) => {
    setPathDraft(next)
    update(next)
  }

  const saveAlt = (next: string) => {
    setAltDraft(next)
    updateAlt(next)
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (f) void upload(f)
        else pickingRef.current = false
      }}
    />
  )

  const pencil = (
    <button
      type="button"
      className="cms-editable__badge cms-editable__badge--always"
      title={label || 'Modifier l’image'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setPanelOpen(true)
      }}
    >
      <i className="fa-solid fa-pen" />
    </button>
  )

  const panel = panelOpen && typeof document !== 'undefined'
    ? createPortal(
        <ImageEditPanel
          label={label}
          src={pathDraft || src}
          altValue={altDraft}
          uploading={uploading}
          panelRef={panelRef}
          style={panelPos
            ? {
                top: panelPos.top,
                left: panelPos.left,
                width: Math.min(340, window.innerWidth - 24),
              }
            : { visibility: 'hidden', top: 0, left: 0 }}
          onPathChange={savePath}
          onAltChange={saveAlt}
          onChangeFile={openPicker}
          onClose={() => setPanelOpen(false)}
        />,
        document.body,
      )
    : null

  const cmsAttrs = {
    'data-cms-page': page,
    'data-cms-block': blockKey,
    'data-cms-type': 'image',
  } as const

  if (!isEditMode) {
    if (variant === 'chip') {
      // Invisible marker so structure export still finds chip-only images (hero bg, CTA bg…).
      return (
        <span
          {...cmsAttrs}
          hidden
          aria-hidden="true"
          data-cms-fallback={fallback || undefined}
        />
      )
    }
    return (
      <img
        src={src}
        alt={displayAlt || alt}
        className={className}
        style={style}
        {...cmsAttrs}
      />
    )
  }

  if (variant === 'chip') {
    return (
      <div
        ref={rootRef}
        className={`cms-editable cms-editable--image-chip ${className}`.trim()}
        style={style}
        {...cmsAttrs}
      >
        {pencil}
        {panel}
        {fileInput}
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={`cms-editable cms-editable--image ${className}`}
      style={style}
      {...cmsAttrs}
    >
      <img src={src} alt={displayAlt || alt} />
      {pencil}
      {panel}
      {fileInput}
    </div>
  )
}

/** Resolve a CMS image URL for pairing with a plain `<img>` (heroes, backgrounds). */
export function useEditableImageSrc(page: string, blockKey: string, fallback = '') {
  const { value } = useContentBlock(page, blockKey, { type: 'image', fallback })
  return publicUrl(value || fallback)
}

/** Resolve CMS alt text for a paired image key. */
export function useEditableImageAlt(page: string, blockKey: string, fallback = '') {
  const { value } = useContentBlock(page, `${blockKey}_alt`, {
    type: 'text',
    fallback,
    shared: true,
  })
  return value || fallback
}
