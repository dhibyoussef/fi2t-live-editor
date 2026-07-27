import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'
import api from '../api/client'

export type EditableListField = {
  key: string
  label: string
  multiline?: boolean
  visible?: boolean
  /** When true, field is edited via image upload (path stored as string). */
  image?: boolean
}

type Props<T extends Record<string, string>> = {
  page: string
  blockKey: string
  label: string
  fields: EditableListField[]
  fallback: T[]
  shared?: boolean
  className?: string
  itemClassName?: string | ((item: T, index: number) => string)
  emptyItem: T | ((items: T[]) => T)
  renderItem: (item: T, index: number, ctx: {
    editable: boolean
    editField: (
      fieldKey: string,
      as?: 'h3' | 'p' | 'span' | 'strong' | 'time',
      className?: string,
    ) => ReactNode
    editImage: (fieldKey: string, className?: string, alt?: string) => ReactNode
  }) => ReactNode
  renderAfter?: (items: T[]) => ReactNode
  allowAddRemove?: boolean
  addLabel?: string
}

function parseItems<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

async function uploadListImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('image', file)
  const { data } = await api.post('/admin/content/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url as string
}

/**
 * Live-editable JSON list.
 * - Click text fields on the page to edit content only.
 * - Click images to upload a new picture.
 * - “Gérer la liste” opens the full list editor.
 */
export default function EditableJsonList<T extends Record<string, string>>({
  page,
  blockKey,
  label,
  fields,
  fallback,
  shared = false,
  className = '',
  itemClassName = '',
  emptyItem,
  renderItem,
  renderAfter,
  allowAddRemove = true,
  addLabel = 'Ajouter un élément',
}: Props<T>) {
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const lang = (i18n.language || 'fr').split('-')[0]
  const { value, update } = useContentBlock(page, blockKey, {
    type: 'json',
    label,
    fallback: JSON.stringify(fallback),
    shared,
  })

  const items = useMemo(() => parseItems<T>(value, fallback), [value, fallback])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ index: number; field: string } | null>(null)
  const [draft, setDraft] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (!isEditMode) {
      setOpen(false)
      setEditing(null)
    }
  }, [isEditMode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const commit = (next: T[]) => {
    update(JSON.stringify(next))
  }

  const updateField = (index: number, fieldKey: string, fieldValue: string) => {
    commit(
      items.map((item, i) =>
        i === index ? { ...item, [fieldKey]: fieldValue } as T : item,
      ),
    )
  }

  const startInlineEdit = (index: number, field: string) => {
    if (!isEditMode) return
    setDraft(String(items[index]?.[field] ?? ''))
    setEditing({ index, field })
  }

  const saveInline = () => {
    if (!editing) return
    updateField(editing.index, editing.field, draft)
    setEditing(null)
  }

  const cancelInline = () => setEditing(null)

  const removeItem = (index: number) => {
    commit(items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    const next = typeof emptyItem === 'function' ? emptyItem(items) : { ...emptyItem }
    commit([...items, next])
  }

  const restoreDefaults = () => {
    commit(fallback.map((item) => ({ ...item })))
  }

  const handleUpload = async (index: number, fieldKey: string, file: File) => {
    const key = `${index}:${fieldKey}`
    setUploading(key)
    try {
      const url = await uploadListImage(file)
      updateField(index, fieldKey, url)
    } catch {
      alert('Erreur lors du téléversement.')
    } finally {
      setUploading(null)
    }
  }

  const editField = (
    index: number,
    fieldKey: string,
    as: 'h3' | 'p' | 'span' | 'strong' | 'time' = 'span',
    className = '',
  ) => {
    const Tag = as
    const fieldMeta = fields.find((f) => f.key === fieldKey)
    const text = String(items[index]?.[fieldKey] ?? '')

    if (!isEditMode) {
      return <Tag className={className || undefined}>{text}</Tag>
    }

    if (editing?.index === index && editing.field === fieldKey) {
      return (
        <div className="cms-edit-popup cms-edit-popup--inline" onClick={(e) => e.stopPropagation()}>
          <div className="cms-edit-popup__label">
            {fieldMeta?.label ?? fieldKey}
            <span className="cms-edit-popup__lang">{shared ? 'ALL' : lang.toUpperCase()}</span>
          </div>
          {fieldMeta?.multiline ? (
            <textarea
              className="cms-edit-popup__input"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="cms-edit-popup__input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          )}
          <div className="cms-edit-popup__actions">
            <button type="button" className="cms-btn cms-btn--save" onClick={saveInline}>OK</button>
            <button type="button" className="cms-btn cms-btn--cancel" onClick={cancelInline}>Annuler</button>
          </div>
        </div>
      )
    }

    return (
      <Tag
        className={`cms-editable cms-editable--text ${className}`.trim()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          startInlineEdit(index, fieldKey)
        }}
        title={`Modifier — ${fieldMeta?.label ?? fieldKey}`}
      >
        {text || <em className="cms-editable__placeholder">…</em>}
        <span className="cms-editable__badge"><i className="fa-solid fa-pen" /></span>
      </Tag>
    )
  }

  const editImage = (index: number, fieldKey: string, className = '', alt = '') => {
    const src = String(items[index]?.[fieldKey] ?? '') || '/images/icon1.png'
    const inputKey = `${index}:${fieldKey}`
    const busy = uploading === inputKey

    if (!isEditMode) {
      return <img src={src} alt={alt} className={className || undefined} />
    }

    return (
      <button
        type="button"
        className={`cms-list-image-btn ${className}`.trim()}
        title="Cliquer pour changer l’icône"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          fileRefs.current[inputKey]?.click()
        }}
      >
        <img src={src} alt={alt} />
        <span className="cms-list-image-btn__overlay">
          {busy ? (
            <i className="fa-solid fa-spinner fa-spin" />
          ) : (
            <i className="fa-solid fa-camera" />
          )}
        </span>
        <input
          ref={(el) => { fileRefs.current[inputKey] = el }}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(index, fieldKey, file)
            e.target.value = ''
          }}
        />
      </button>
    )
  }

  const renderModalField = (item: T, index: number, field: EditableListField) => {
    if (field.image) {
      const src = String(item[field.key] ?? '') || '/images/icon1.png'
      const inputKey = `modal:${index}:${field.key}`
      const busy = uploading === `${index}:${field.key}`
      return (
        <div key={field.key} className="cms-list-panel__field cms-list-panel__field--image">
          <span>{field.label}</span>
          <div className="cms-list-panel__image-row">
            <button
              type="button"
              className="cms-list-panel__image-preview"
              onClick={() => fileRefs.current[inputKey]?.click()}
              title="Changer l’image"
            >
              <img src={src} alt="" />
              <span>{busy ? 'Envoi…' : 'Changer'}</span>
            </button>
            <input
              className="cms-list-panel__field-input"
              type="text"
              value={String(item[field.key] ?? '')}
              onChange={(e) => updateField(index, field.key, e.target.value)}
              placeholder="/images/icon1.png"
            />
            <input
              ref={(el) => { fileRefs.current[inputKey] = el }}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(index, field.key, file)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      )
    }

    return (
      <label key={field.key} className="cms-list-panel__field">
        <span>{field.label}</span>
        {field.multiline ? (
          <textarea
            rows={3}
            value={String(item[field.key] ?? '')}
            onChange={(e) => updateField(index, field.key, e.target.value)}
          />
        ) : (
          <input
            type="text"
            value={String(item[field.key] ?? '')}
            onChange={(e) => updateField(index, field.key, e.target.value)}
          />
        )}
      </label>
    )
  }

  return (
    <div className={`cms-json-list${isEditMode ? ' is-editing' : ''} ${className}`.trim()}>
      {isEditMode && (
        <div className="cms-list-trigger-wrap">
          <button
            type="button"
            className="cms-list-trigger"
            onClick={() => setOpen(true)}
          >
            <i className="fa-solid fa-list" aria-hidden />
            Gérer la liste
            <span className="cms-list-trigger__count">{items.length}</span>
          </button>
        </div>
      )}

      {items.map((item, index) => {
        const resolvedItemClass =
          typeof itemClassName === 'function' ? itemClassName(item, index) : itemClassName
        return (
          <div
            key={`${index}-${String(item[fields[0]?.key] ?? index)}`}
            className={`cms-json-list__item ${resolvedItemClass ?? ''}`.trim()}
          >
            {renderItem(item, index, {
              editable: isEditMode,
              editField: (fieldKey, as, cls) => editField(index, fieldKey, as, cls),
              editImage: (fieldKey, cls, alt) => editImage(index, fieldKey, cls, alt),
            })}
          </div>
        )
      })}

      {renderAfter?.(items)}

      {isEditMode && open && (
        <div
          className="cms-list-modal"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="cms-list-panel cms-list-panel--modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cms-list-panel__head">
              <span className="cms-list-panel__badge">
                <i className="fa-solid fa-layer-group" aria-hidden />
                LISTE
              </span>
              <span className="cms-list-panel__key">{blockKey}</span>
              <span className="cms-list-panel__lang">{shared ? 'ALL' : lang.toUpperCase()}</span>
              <button
                type="button"
                className="cms-list-panel__close"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </header>

            <h3 className="cms-list-panel__title">{label}</h3>
            <p className="cms-list-panel__hint">
              Cliquez une icône sur la page ou ici pour téléverser une image. Cliquez un texte pour le modifier.
            </p>

            {items.length === 0 && (
              <div className="cms-list-panel__empty">
                <p>Aucun élément dans cette liste.</p>
                {fallback.length > 0 && (
                  <button type="button" className="cms-list-panel__restore" onClick={restoreDefaults}>
                    Restaurer le contenu par défaut
                  </button>
                )}
              </div>
            )}

            <div className="cms-list-panel__items">
              {items.map((item, index) => (
                <article key={`edit-${index}`} className="cms-list-panel__card">
                  <div className="cms-list-panel__card-head">
                    <strong>Élément {index + 1}</strong>
                    {allowAddRemove && (
                      <button
                        type="button"
                        className="cms-list-panel__delete"
                        onClick={() => removeItem(index)}
                        title="Supprimer"
                      >
                        <i className="fa-solid fa-trash" aria-hidden />
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="cms-list-panel__fields">
                    {fields.map((field) => renderModalField(item, index, field))}
                  </div>
                </article>
              ))}
            </div>

            {allowAddRemove && (
              <button type="button" className="cms-list-panel__add" onClick={addItem}>
                + {addLabel}
              </button>
            )}

            <div className="cms-list-panel__footer">
              <button
                type="button"
                className="cms-list-panel__done"
                onClick={() => setOpen(false)}
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
