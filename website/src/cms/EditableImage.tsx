import { useState, useRef, useEffect } from 'react'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'
import { uploadWebsiteImage } from './uploadWebsiteImage'

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

function ImageEditPanel({
  label,
  src,
  altValue,
  uploading,
  onPathChange,
  onAltChange,
  onChangeFile,
  onClose,
}: {
  label?: string
  src: string
  altValue: string
  uploading: boolean
  onPathChange: (path: string) => void
  onAltChange: (alt: string) => void
  onChangeFile: () => void
  onClose: () => void
}) {
  return (
    <div
      className="cms-image-panel"
      role="dialog"
      aria-label={label || 'Modifier l’image'}
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
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickingRef = useRef(false)

  const src = value || fallback
  const displayAlt = (altStored || alt || '').trim()

  useEffect(() => {
    if (!panelOpen) return
    setPathDraft(src)
    setAltDraft(displayAlt)
  }, [panelOpen, src, displayAlt])

  useEffect(() => {
    if (!panelOpen) return
    const onDoc = (e: MouseEvent) => {
      if (pickingRef.current) return
      if (!rootRef.current?.contains(e.target as Node)) setPanelOpen(false)
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

  const panel = panelOpen ? (
    <ImageEditPanel
      label={label}
      src={pathDraft || src}
      altValue={altDraft}
      uploading={uploading}
      onPathChange={savePath}
      onAltChange={saveAlt}
      onChangeFile={openPicker}
      onClose={() => setPanelOpen(false)}
    />
  ) : null

  if (!isEditMode) {
    if (variant === 'chip') return null
    return <img src={src} alt={displayAlt || alt} className={className} style={style} />
  }

  if (variant === 'chip') {
    return (
      <div ref={rootRef} className={`cms-editable cms-editable--image-chip ${className}`.trim()} style={style}>
        {pencil}
        {panel}
        {fileInput}
      </div>
    )
  }

  return (
    <div ref={rootRef} className={`cms-editable cms-editable--image ${className}`} style={style}>
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
  return value || fallback
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
