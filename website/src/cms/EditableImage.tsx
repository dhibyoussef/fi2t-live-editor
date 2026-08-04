import { useState, useRef } from 'react'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'
import api from '../api/client'

interface Props {
  page: string
  blockKey: string
  label?: string
  className?: string
  alt?: string
  fallback?: string
  style?: React.CSSProperties
  /**
   * `default` — whole image surface is the edit target (with optional chip).
   * `chip` — renders only the upload chip in edit mode (pair with a plain `<img>` for display).
   *          Use for full-bleed heroes so title/text are not inside the image component.
   */
  variant?: 'default' | 'chip'
}

export default function EditableImage({
  page,
  blockKey,
  label,
  className = '',
  alt = '',
  fallback = '',
  style,
  variant = 'default',
}: Props) {
  const { isEditMode } = useEditMode()
  const { value, commit } = useContentBlock(page, blockKey, { type: 'image', label, fallback })
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => inputRef.current?.click()

  const upload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      const { data } = await api.post('/admin/content/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await commit(data.url)
    } catch {
      alert('Erreur lors du téléversement.')
    } finally {
      setUploading(false)
    }
  }

  const src = value || fallback
  const chip = label || 'Changer l\'image'

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) upload(file)
        e.target.value = ''
      }}
    />
  )

  /* Chip-only control: display image is a sibling plain <img>, text stays outside. */
  if (variant === 'chip') {
    if (!isEditMode) return null
    return (
      <>
        <button
          type="button"
          className={`cms-editable__img-label cms-editable__img-label--chip ${className}`.trim()}
          style={style}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            openPicker()
          }}
          title={label || 'Cliquer pour changer l\'image'}
          data-cms-page={page}
          data-cms-block={blockKey}
        >
          <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-image'}`} aria-hidden />
          {uploading ? 'Envoi…' : chip}
        </button>
        {fileInput}
      </>
    )
  }

  if (!isEditMode) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
        data-cms-page={page}
        data-cms-block={blockKey}
      />
    )
  }

  return (
    <div
      className={`cms-editable cms-editable--image ${className}`}
      style={style}
      onClick={openPicker}
      title={label || 'Cliquer pour changer l\'image'}
      data-cms-page={page}
      data-cms-block={blockKey}
    >
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {label ? (
        <span className="cms-editable__img-label" aria-hidden>
          {chip}
        </span>
      ) : null}
      <div className="cms-editable__overlay">
        {uploading ? (
          <span><i className="fa-solid fa-spinner fa-spin" /> Envoi...</span>
        ) : (
          <span><i className="fa-solid fa-camera" /> {chip}</span>
        )}
      </div>
      {fileInput}
    </div>
  )
}

/** Read the current image URL for a block (for pairing a plain <img> with variant="chip"). */
export function useEditableImageSrc(page: string, blockKey: string, fallback = '') {
  const { value } = useContentBlock(page, blockKey, { type: 'image', fallback })
  return value || fallback
}
