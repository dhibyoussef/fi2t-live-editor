import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Trash2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadImageFile } from '../../../lib/uploadImageFile'
import { resolvePreviewImageUrl } from '../builder/previewAssets'

/**
 * Generic editor for a whole page stored as one JSON document
 * (the Figma groupement layouts — `custom.page`).
 *
 * It walks the object and renders one control per leaf so every string the
 * visitor can read is reachable from the back-office, without having to write
 * a bespoke editor for each of the 13 layouts.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

const IMAGE_RE = /\.(png|jpe?g|svg|webp|gif|avif)(\?|$)/i
const AUTOMATIC_SEQUENCE_FIELD = /^(num|number)$/i
const IMAGE_LABEL_RE = /^(image|img|icon|photo|face|banner|blueprint|marina img)$/i

function isImagePath(value: string, label = ''): boolean {
  return IMAGE_LABEL_RE.test(label.trim()) || IMAGE_RE.test(value) || value.startsWith('/images/')
}

/** `splitTitle` / `hero_title` → `Split title`. */
function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Label a list row by its most title-like field so cards are scannable. */
function itemTitle(item: Json, index: number): string {
  if (typeof item === 'string') return item.slice(0, 60) || `Élément ${index + 1}`
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    for (const key of ['title', 'name', 'label', 'value', 'tag']) {
      const v = (item as Record<string, Json>)[key]
      if (typeof v === 'string' && v.trim()) return v.slice(0, 60)
    }
  }
  return `Élément ${index + 1}`
}

function emptyLike(sample: Json | undefined): Json {
  if (typeof sample === 'string') return ''
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  if (Array.isArray(sample)) return []
  if (sample && typeof sample === 'object') {
    return Object.fromEntries(
      Object.entries(sample)
        .filter(([key]) => !AUTOMATIC_SEQUENCE_FIELD.test(key))
        .map(([k, v]) => [k, emptyLike(v)]),
    ) as Json
  }
  return ''
}

function StringField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const upload = async (file: File) => {
    try {
      const data = await uploadImageFile(file, '/admin/content/upload-image')
      onChange(data.url)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors du téléversement')
    }
  }

  if (isImagePath(value, label)) {
    return (
      <div className="wc-field">
        <label className="wc-field-label">{label}</label>
        <div className="wc-card-image-row">
          <div className="wc-card-image-preview">
            {value ? <img src={resolvePreviewImageUrl(value)} alt="" /> : <span>Aucune image</span>}
          </div>
          <div className="wc-card-image-actions">
            <input
              className="wc-field-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="URL de l'image"
            />
            <label className="wc-upload-btn">
              <Upload size={13} /> Choisir une image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) upload(f)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
      </div>
    )
  }

  const multiline = value.includes('\n') || value.length > 80
  return (
    <div className="wc-field">
      <label className="wc-field-label">{label}</label>
      {multiline ? (
        <textarea
          className="wc-field-input"
          rows={Math.min(10, Math.max(2, value.split('\n').length + 1))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="wc-field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

function Node({
  label,
  value,
  onChange,
  depth,
}: {
  label: string
  value: Json
  onChange: (v: Json) => void
  depth: number
}) {
  const [open, setOpen] = useState(depth < 1)

  if (value === null || value === undefined) {
    return <StringField label={label} value="" onChange={(v) => onChange(v)} />
  }

  if (typeof value === 'string') {
    return <StringField label={label} value={value} onChange={(v) => onChange(v)} />
  }

  if (typeof value === 'number') {
    return (
      <div className="wc-field">
        <label className="wc-field-label">{label}</label>
        <input
          className="wc-field-input"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <div className="wc-field">
        <label className="wc-field-label">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />{' '}
          {label}
        </label>
      </div>
    )
  }

  if (Array.isArray(value)) {
    const replace = (i: number, next: Json) =>
      onChange(value.map((v, j) => (j === i ? next : v)))
    return (
      <div className="wc-tree-group">
        <button type="button" className="wc-tree-toggle" onClick={() => setOpen(!open)}>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>{label}</span>
          <em className="wc-tree-count">{value.length}</em>
        </button>
        {open && (
          <div className="wc-tree-body">
            {value.map((item, i) => (
              <div className="wc-item-card" key={i}>
                <div className="wc-item-card-head">
                  <span className="wc-item-card-title">{itemTitle(item, i)}</span>
                  <button
                    type="button"
                    className="wc-item-remove"
                    title="Supprimer"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="wc-item-card-body">
                  <Node
                    label={
                      typeof item === 'string'
                        ? /(photo|image|gallery|galerie)/i.test(label)
                          ? 'Image'
                          : 'Texte'
                        : ''
                    }
                    value={item}
                    onChange={(next) => replace(i, next)}
                    depth={depth + 1}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="wc-add-item-btn"
              onClick={() => onChange([...value, emptyLike(value[0])])}
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>
        )}
      </div>
    )
  }

  const entries = Object.entries(value)
    .filter(([key]) => !AUTOMATIC_SEQUENCE_FIELD.test(key))
  // An object rendered inside a list card needs no extra header.
  if (!label) {
    return (
      <>
        {entries.map(([k, v]) => (
          <Node
            key={k}
            label={humanize(k)}
            value={v}
            onChange={(next) => onChange({ ...value, [k]: next })}
            depth={depth + 1}
          />
        ))}
      </>
    )
  }

  return (
    <div className="wc-tree-group">
      <button type="button" className="wc-tree-toggle" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>{label}</span>
        <em className="wc-tree-count">{entries.length}</em>
      </button>
      {open && (
        <div className="wc-tree-body">
          {entries.map(([k, v]) => (
            <Node
              key={k}
              label={humanize(k)}
              value={v}
              onChange={(next) => onChange({ ...value, [k]: next })}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PageTreeEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (json: string) => void
}) {
  const parsed = useMemo<Json | undefined>(() => {
    if (!value?.trim()) return undefined
    try {
      return JSON.parse(value) as Json
    } catch {
      return undefined
    }
  }, [value])

  if (parsed === undefined || typeof parsed !== 'object' || parsed === null) {
    return (
      <div className="wc-list-editor">
        <p className="wc-list-hint">
          Contenu illisible — édition JSON brute.
        </p>
        <textarea
          className="wc-field-input"
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  // `layout` picks the React template — editing it would break the page.
  const { layout, ...editable } = parsed as Record<string, Json>

  return (
    <div className="wc-list-editor wc-tree-editor">
      <p className="wc-list-hint">
        Contenu complet de la page. Chaque champ correspond à un texte ou une image
        visible sur le site.
      </p>
      {Object.entries(editable).map(([k, v]) => (
        <Node
          key={k}
          label={humanize(k)}
          value={v}
          onChange={(next) =>
            onChange(JSON.stringify({ ...(layout !== undefined ? { layout } : {}), ...editable, [k]: next }))
          }
          depth={0}
        />
      ))}
    </div>
  )
}
