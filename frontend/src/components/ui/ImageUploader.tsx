import { useRef, useState, useCallback } from 'react'
import { Upload, X, Link2, ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'
import { uploadImageFile } from '../../lib/uploadImageFile'

// ─── Types ────────────────────────────────────────────────────────────────────

const DEFAULT_ACCEPT = 'image/*'

interface Props {
  value: string
  onChange: (url: string) => void
  uploadedPath?: string
  onPathChange?: (path: string) => void
  /** MIME filter for file input — default accepts all image types */
  accept?: string
  hint?: string
}

type UploadState = 'idle' | 'compressing' | 'uploading' | 'success' | 'error'

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageUploader({
  value,
  onChange,
  onPathChange,
  accept = DEFAULT_ACCEPT,
  hint = 'Tous formats image (JPEG, PNG, WebP, GIF, SVG, ICO, AVIF…) — compression auto si besoin',}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [statusHint, setStatusHint] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')

  const upload = useCallback(async (file: File) => {
    setError('')
    setStatusHint('')
    setState('compressing')
    setProgress(0)

    try {
      const data = await uploadImageFile(
        file,
        '/admin/content/upload-image',
        setProgress,
        phase => setState(phase),
      )
      onChange(data.url)
      if (data.path) onPathChange?.(data.path)
      setState('success')
      if (data.compressed) {
        setStatusHint('Image optimisée automatiquement avant envoi')
      }
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const validation = err.response?.data?.errors?.image?.[0]
      setError(
        validation
          ?? err.response?.data?.message
          ?? err.message
          ?? 'Erreur lors du téléversement.',
      )
      setState('error')
    }
  }, [onChange, onPathChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) upload(file)
    else setError('Veuillez déposer un fichier image.')
  }, [upload])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const clear = () => {
    onChange('')
    onPathChange?.('')
    setState('idle')
    setProgress(0)
    setError('')
    setStatusHint('')
  }

  const busy = state === 'compressing' || state === 'uploading'

  return (
    <div className="img-uploader">
      <div className="img-uploader-tabs">
        <button type="button" className={`img-tab${mode === 'upload' ? ' active' : ''}`} onClick={() => setMode('upload')}>
          <Upload size={12} /> Téléverser depuis le PC
        </button>
        <button type="button" className={`img-tab${mode === 'url' ? ' active' : ''}`} onClick={() => setMode('url')}>
          <Link2 size={12} /> Coller une URL
        </button>
      </div>

      {mode === 'upload' && (
        <>
          {!value && (
            <div
              className={`img-dropzone${dragOver ? ' drag-over' : ''}${state === 'error' ? ' has-error' : ''}`}
              onClick={() => !busy && inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={onFileChange}
              />

              {busy ? (
                <div className="img-uploading">
                  <div className="img-progress-bar">
                    <div className="img-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="img-uploading-label">
                    {state === 'compressing' ? 'Optimisation de l\'image…' : `Téléversement… ${progress}%`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="img-drop-icon"><ImageIcon size={28} /></div>
                  <p className="img-drop-main">
                    Glissez une image ici, ou <span className="img-drop-link">parcourir</span>
                  </p>
                  <p className="img-drop-hint">{hint}</p>
                </>
              )}
            </div>
          )}

          {value && (
            <div className="img-preview-zone">
              <img
                src={value}
                alt="preview"
                className="img-preview-img"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x300/1C1811/D4A017?text=Erreur' }}
              />
              <div className="img-preview-overlay">
                <div className="img-preview-actions">
                  {state === 'success' && (
                    <span className="img-badge-ok"><CheckCircle2 size={12} /> Téléversée</span>
                  )}
                  <button type="button" className="img-preview-change" onClick={() => inputRef.current?.click()} disabled={busy}>
                    <Upload size={12} /> Remplacer
                  </button>
                  <button type="button" className="img-preview-remove" onClick={clear}>
                    <X size={12} />
                  </button>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
            </div>
          )}

          {statusHint && state === 'success' && (
            <p className="img-hint-ok">{statusHint}</p>
          )}
          {state === 'error' && (
            <p className="img-error"><AlertCircle size={12} /> {error}</p>
          )}
        </>
      )}

      {mode === 'url' && (
        <div className="img-url-tab">
          <div style={{ position: 'relative' }}>
            <input
              className="gc-field"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={value}
              onChange={e => { onChange(e.target.value); setState('idle') }}
              style={{ paddingRight: value ? 32 : undefined }}
            />
            {value && (
              <button
                type="button"
                onClick={clear}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0,
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {value && (
            <div className="img-url-preview">
              <img
                src={value}
                alt="preview"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x300/1C1811/D4A017?text=Image+introuvable' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
