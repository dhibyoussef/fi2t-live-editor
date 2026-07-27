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
}

export default function EditableImage({
  page, blockKey, label, className = '', alt = '', fallback = '', style,
}: Props) {
  const { isEditMode } = useEditMode()
  const { value, update } = useContentBlock(page, blockKey, { type: 'image', label, fallback })
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      const { data } = await api.post('/admin/content/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      update(data.url)
    } catch {
      alert('Erreur lors du téléversement.')
    } finally {
      setUploading(false)
    }
  }

  const src = value || fallback

  if (!isEditMode) {
    return <img src={src} alt={alt} className={className} style={style} loading="lazy" />
  }

  return (
    <div
      className={`cms-editable cms-editable--image ${className}`}
      style={style}
      onClick={() => inputRef.current?.click()}
      title={label || 'Cliquer pour changer l\'image'}
    >
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div className="cms-editable__overlay">
        {uploading ? (
          <span><i className="fa-solid fa-spinner fa-spin" /> Envoi...</span>
        ) : (
          <span><i className="fa-solid fa-camera" /> Changer l'image</span>
        )}
      </div>
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
    </div>
  )
}
