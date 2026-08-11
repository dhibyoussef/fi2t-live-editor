import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContent, useContentBlock } from './ContentProvider'
import {
  FI2T_ICON_CATEGORIES,
  FI2T_ICON_OPTIONS,
  filterFi2tIcons,
  isFi2tIconPath,
  normalizeIconPath,
} from './fi2tIcons'
import { fanOutListItemMedia } from './fanOutMedia'
import { isMediaKey } from './mediaSync'

function IconLibraryPicker({
  selectedSrc,
  onPick,
}: {
  selectedSrc: string
  onPick: (path: string) => void
}) {
  const [category, setCategory] = useState<string>('Tous')
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => filterFi2tIcons({ category, query }),
    [category, query],
  )
  const selectedBase = normalizeIconPath(selectedSrc)

  return (
    <div className="cms-icon-picker" role="listbox" aria-label="Bibliothèque d'icônes FI2T">
      <div className="cms-icon-picker__toolbar">
        <input
          type="search"
          className="cms-icon-picker__search"
          placeholder="Rechercher une icône…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une icône"
        />
        <div className="cms-icon-picker__cats" role="tablist" aria-label="Catégories">
          {FI2T_ICON_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={category === cat}
              className={`cms-icon-picker__cat${category === cat ? ' is-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
              {cat === 'Tous' ? ` (${FI2T_ICON_OPTIONS.length})` : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="cms-icon-picker__grid">
        {filtered.length === 0 ? (
          <p className="cms-icon-picker__empty">Aucune icône ne correspond.</p>
        ) : (
          filtered.map((opt) => {
            const active = selectedBase === normalizeIconPath(opt.path)
            return (
              <button
                key={opt.path}
                type="button"
                role="option"
                aria-selected={active}
                className={`cms-icon-picker__btn${active ? ' is-active' : ''}`}
                title={`${opt.label} · ${opt.category}`}
                onClick={() => onPick(opt.path)}
              >
                <img src={opt.path} alt={opt.label} loading="lazy" />
              </button>
            )
          })
        )}
      </div>
      <p className="cms-icon-picker__hint">
        {filtered.length} icône{filtered.length > 1 ? 's' : ''} · upload possible ci-dessous pour une icône unique
      </p>
    </div>
  )
}

export type EditableListField = {
  key: string
  label: string
  multiline?: boolean
  visible?: boolean
  /** When true, field is edited via image upload (path stored as string). */
  image?: boolean
  /**
   * When true (with image), show the full FI2T icon library (search + categories)
   * in addition to optional file upload for custom icons.
   */
  iconPick?: boolean
  /** When true, field is a 0–100 percentage edited with a slider (not typed). */
  percent?: boolean
  min?: number
  max?: number
  step?: number
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
  /** Normalize items after parse (e.g. migrate legacy icon keys → paths). */
  transform?: (items: T[]) => T[]
  renderItem: (item: T, index: number, ctx: {
    editable: boolean
    editField: (
      fieldKey: string,
      as?: 'h3' | 'p' | 'span' | 'strong' | 'time',
      className?: string,
    ) => ReactNode
    /** Live percentage slider (0–100 by default). Prefer over editField for percent fields. */
    editPercent: (
      fieldKey: string,
      className?: string,
    ) => ReactNode
    editImage: (
      fieldKey: string,
      className?: string,
      alt?: string,
      /** Shown when the stored value is not an image URL (e.g. SVG icon key). */
      fallback?: ReactNode,
    ) => ReactNode
  }) => ReactNode
  renderAfter?: (items: T[]) => ReactNode
  allowAddRemove?: boolean
  addLabel?: string
  /** Label for the on-page list button (default: Gérer la liste). */
  manageLabel?: string
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
  const { uploadWebsiteImage } = await import('./uploadWebsiteImage')
  return uploadWebsiteImage(file)
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
  transform,
  renderItem,
  renderAfter,
  allowAddRemove = true,
  addLabel = 'Ajouter un élément',
  manageLabel = 'Gérer la liste',
}: Props<T>) {
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const lang = (i18n.language || 'fr').split('-')[0]
  const { refresh } = useContent()
  const { value, update } = useContentBlock(page, blockKey, {
    type: 'json',
    label,
    fallback: JSON.stringify(fallback),
    shared,
  })

  const items = useMemo(() => {
    const parsed = parseItems<T>(value, fallback)
    return transform ? transform(parsed) : parsed
  }, [value, fallback, transform])
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

  const queueItems = (next: T[]) => {
    update(JSON.stringify(next))
  }

  const updateField = (index: number, fieldKey: string, fieldValue: string) => {
    queueItems(
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
    queueItems(items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    const next = typeof emptyItem === 'function' ? emptyItem(items) : { ...emptyItem }
    queueItems([...items, next])
  }

  const restoreDefaults = () => {
    queueItems(fallback.map((item) => ({ ...item })))
  }

  const handleUpload = async (index: number, fieldKey: string, file: File) => {
    const key = `${index}:${fieldKey}`
    setUploading(key)
    try {
      const url = await uploadListImage(file)
      const next = items.map((item, i) =>
        i === index ? ({ ...item, [fieldKey]: url } as T) : item,
      )
      const json = JSON.stringify(next)
      update(json)
      if (!shared && isMediaKey(fieldKey)) {
        const dot = blockKey.indexOf('.')
        const section = blockKey.slice(0, dot)
        const blockKeyOnly = blockKey.slice(dot + 1)
        const slug = String(next[index]?.slug ?? '')
        await fanOutListItemMedia({
          page,
          section,
          key: blockKeyOnly,
          match: slug ? { slug } : { index },
          mediaPatch: { [fieldKey]: url },
          currentLocale: lang,
          currentValue: json,
          label,
        })
        await refresh()
      }
    } catch {
      alert('Erreur lors du téléversement.')
    } finally {
      setUploading(null)
    }
  }

  const applyMediaField = async (index: number, fieldKey: string, url: string) => {
    const next = items.map((item, i) =>
      i === index ? ({ ...item, [fieldKey]: url } as T) : item,
    )
    const json = JSON.stringify(next)
    update(json)
    if (!shared && isMediaKey(fieldKey)) {
      const dot = blockKey.indexOf('.')
      const section = blockKey.slice(0, dot)
      const blockKeyOnly = blockKey.slice(dot + 1)
      const slug = String(next[index]?.slug ?? '')
      try {
        await fanOutListItemMedia({
          page,
          section,
          key: blockKeyOnly,
          match: slug ? { slug } : { index },
          mediaPatch: { [fieldKey]: url },
          currentLocale: lang,
          currentValue: json,
          label,
        })
        await refresh()
      } catch {
        /* local update kept */
      }
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
      const min = fieldMeta?.min ?? 0
      const max = fieldMeta?.max ?? 100
      const step = fieldMeta?.step ?? 1
      return (
        <div className="cms-edit-popup cms-edit-popup--inline" onClick={(e) => e.stopPropagation()}>
          <div className="cms-edit-popup__label">
            {fieldMeta?.label ?? fieldKey}
            <span className="cms-edit-popup__lang">{shared ? 'ALL' : lang.toUpperCase()}</span>
          </div>
          {fieldMeta?.percent ? (
            <div className="cms-edit-popup__range">
              <input
                type="range"
                className="cms-edit-popup__slider"
                min={min}
                max={max}
                step={step}
                value={Number(draft) || 0}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <strong className="cms-edit-popup__range-value">{Number(draft) || 0}%</strong>
            </div>
          ) : fieldMeta?.multiline ? (
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

  const editPercent = (index: number, fieldKey: string, className = '') => {
    const fieldMeta = fields.find((f) => f.key === fieldKey)
    const min = fieldMeta?.min ?? 0
    const max = fieldMeta?.max ?? 100
    const step = fieldMeta?.step ?? 1
    const pct = Math.min(max, Math.max(min, Number(items[index]?.[fieldKey]) || 0))

    if (!isEditMode) {
      return <strong className={className || undefined}>{pct}%</strong>
    }

    return (
      <label
        className={`cms-percent-edit ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        title={`Modifier — ${fieldMeta?.label ?? fieldKey}`}
      >
        <input
          type="range"
          className="cms-percent-edit__slider"
          min={min}
          max={max}
          step={step}
          value={pct}
          onChange={(e) => updateField(index, fieldKey, e.target.value)}
          aria-label={fieldMeta?.label ?? fieldKey}
        />
        <strong className="cms-percent-edit__value">{pct}%</strong>
      </label>
    )
  }

  const isImageSrc = (value: string) =>
    value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')

  const editImage = (
    index: number,
    fieldKey: string,
    className = '',
    alt = '',
    fallback?: ReactNode,
  ) => {
    const raw = String(items[index]?.[fieldKey] ?? '')
    const src = isImageSrc(raw) ? raw : ''
    const inputKey = `${index}:${fieldKey}`
    const busy = uploading === inputKey

    if (!isEditMode) {
      if (src) return <img src={src} alt={alt} className={className || undefined} />
      return fallback ?? <img src="/images/icon1.png?v=5" alt={alt} className={className || undefined} />
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
        {src ? (
          <img src={src} alt={alt} />
        ) : (
          <span className="cms-list-image-btn__fallback">{fallback ?? (raw || 'Icône')}</span>
        )}
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
      const raw = String(item[field.key] ?? '')
      const src = isImageSrc(raw) ? raw : ''
      const inputKey = `modal:${index}:${field.key}`
      const busy = uploading === `${index}:${field.key}`
      const showPicker = field.iconPick === true || (
        field.iconPick !== false
        && (
          /icon/i.test(field.key)
          || /icône|icone|icon/i.test(field.label)
        )
        && (!src || isFi2tIconPath(src))
      )
      return (
        <div key={field.key} className="cms-list-panel__field cms-list-panel__field--image">
          <span>{field.label}</span>
          {showPicker && (
            <IconLibraryPicker
              selectedSrc={src}
              onPick={(path) => void applyMediaField(index, field.key, path)}
            />
          )}
          <div className="cms-list-panel__image-row">
            <button
              type="button"
              className="cms-list-panel__image-preview"
              onClick={() => fileRefs.current[inputKey]?.click()}
              title="Téléverser une image (optionnel)"
            >
              {src ? <img src={src} alt="" /> : <span>{raw || 'Aucune image'}</span>}
              <span>{busy ? 'Envoi…' : 'Upload'}</span>
            </button>
            <input
              className="cms-list-panel__field-input"
              type="text"
              value={raw}
              onChange={(e) => updateField(index, field.key, e.target.value)}
              placeholder="/images/icon1.png?v=5"
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

    if (field.percent) {
      const min = field.min ?? 0
      const max = field.max ?? 100
      const step = field.step ?? 1
      const pct = Math.min(max, Math.max(min, Number(item[field.key]) || 0))
      return (
        <label key={field.key} className="cms-list-panel__field cms-list-panel__field--percent">
          <span>{field.label}</span>
          <div className="cms-list-panel__range">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={pct}
              onChange={(e) => updateField(index, field.key, e.target.value)}
            />
            <strong>{pct}%</strong>
          </div>
        </label>
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
    <div
      className={`cms-json-list${isEditMode ? ' is-editing' : ''} ${className}`.trim()}
      data-cms-page={page}
      data-cms-block={blockKey}
    >
      {isEditMode && (
        <div className="cms-list-trigger-wrap">
          <button
            type="button"
            className="cms-list-trigger"
            onClick={() => setOpen(true)}
          >
            <i className="fa-solid fa-list" aria-hidden />
            {manageLabel}
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
              editPercent: (fieldKey, cls) => editPercent(index, fieldKey, cls),
              editImage: (fieldKey, cls, alt, fallback) => editImage(index, fieldKey, cls, alt, fallback),
            })}
          </div>
        )
      })}

      {renderAfter?.(items)}

      {isEditMode && open && createPortal(
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
        </div>,
        document.body,
      )}
    </div>
  )
}
