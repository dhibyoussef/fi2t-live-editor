import { useRef, useState, useCallback } from 'react'
import { X, Star, ImageIcon, Loader2 } from 'lucide-react'
import { uploadImageFile } from '../../lib/uploadImageFile'

export interface RoomImage {
  id?: number
  url: string
  alt_text?: string
  is_cover?: boolean
}

interface Props {
  images: RoomImage[]
  onChange: (images: RoomImage[]) => void
}

export function RoomImagesEditor({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const addImages = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!list.length) return

    setUploading(true)
    const added: RoomImage[] = []
    try {
      for (let i = 0; i < list.length; i++) {
        setProgress(`${i + 1} / ${list.length}`)
        const data = await uploadImageFile(list[i], '/admin/carousels/upload-image')
        added.push({
          url: data.url,
          alt_text: '',
          is_cover: images.length === 0 && added.length === 0,
        })
      }
      const hasCover = images.some(img => img.is_cover)
      const next = [...images, ...added.map((img, i) => ({
        ...img,
        is_cover: !hasCover && i === 0 ? true : img.is_cover,
      }))]
      onChange(next)
    } catch (e: any) {
      alert(e.message ?? 'Erreur lors du téléversement')
    } finally {
      setUploading(false)
      setProgress('')
    }
  }, [images, onChange])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files)
  }

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    if (next.length && !next.some(i => i.is_cover)) next[0] = { ...next[0], is_cover: true }
    onChange(next)
  }

  const setCover = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, is_cover: i === index })))
  }

  const updateAlt = (index: number, alt_text: string) => {
    onChange(images.map((img, i) => i === index ? { ...img, alt_text } : img))
  }

  return (
    <div className="room-images-editor">
      {images.length > 0 && (
        <div className="room-images-grid">
          {images.map((img, i) => (
            <div key={img.id ?? `new-${i}-${img.url}`} className={`room-image-card${img.is_cover ? ' is-cover' : ''}`}>
              <div className="room-image-thumb">
                <img src={img.url} alt={img.alt_text ?? ''} />
                {img.is_cover && <span className="room-image-cover-badge"><Star size={10} fill="currentColor" /> Principale</span>}
                <button type="button" className="room-image-remove" onClick={() => remove(i)} aria-label="Supprimer">
                  <X size={14} />
                </button>
              </div>
              <div className="room-image-meta">
                <input
                  className="room-image-alt"
                  placeholder="Texte alternatif"
                  value={img.alt_text ?? ''}
                  onChange={e => updateAlt(i, e.target.value)}
                />
                {!img.is_cover && (
                  <button type="button" className="room-image-set-cover" onClick={() => setCover(i)}>
                    <Star size={11} /> Définir principale
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={`room-images-dropzone${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files?.length) addImages(e.target.files)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <>
            <Loader2 size={28} className="room-images-spinner" />
            <p>Téléversement {progress}…</p>
          </>
        ) : (
          <>
            <div className="room-images-drop-icon"><ImageIcon size={26} /></div>
            <p className="room-images-drop-title">
              Glissez plusieurs images ici ou <span>parcourir</span>
            </p>
            <p className="room-images-drop-hint">Tous formats image — sélection multiple supportée</p>
          </>
        )}
      </div>
    </div>
  )
}
