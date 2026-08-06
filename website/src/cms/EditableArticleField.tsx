import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'
import api from '../api/client'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from './defaults/actualites'
import { findArticleBySlug, parseArticles, type ArticleItem } from '../lib/articles'

const LANG_BADGE: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', ar: '🇹🇳 AR' }

type Props = {
  slug: string
  /** Top-level article key, or nested like `sections.0.question`. */
  field: string
  label?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'time' | 'blockquote' | 'div'
  className?: string
  multiline?: boolean
  /** When true, click opens image upload instead of text edit. */
  image?: boolean
  fallback?: string
}

function getFieldValue(article: ArticleItem, field: string): string {
  const parts = field.split('.')
  let cur: unknown = article
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : cur == null ? '' : String(cur)
}

function setFieldValue(article: ArticleItem, field: string, value: string): ArticleItem {
  const parts = field.split('.')
  const clone = structuredClone(article) as Record<string, unknown>
  let cur: Record<string, unknown> = clone
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const next = cur[key]
    if (next == null || typeof next !== 'object') {
      cur[key] = /^\d+$/.test(parts[i + 1] ?? '') ? [] : {}
    }
    cur = cur[key] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = value
  return clone as unknown as ArticleItem
}

function renderLines(value: string, multiline: boolean, asDiv: boolean) {
  if (!value) return '\u00A0'
  if (multiline && asDiv) {
    return value.split(/\n\n+/).filter(Boolean).map((para, i) => (
      <p key={i}>
        {para.split('\n').map((line, j, lines) => (
          <span key={j}>{line}{j < lines.length - 1 && <br />}</span>
        ))}
      </p>
    ))
  }
  if (multiline) {
    return value.split(/\n\n+/).filter(Boolean).map((para, i) => (
      <span key={i} style={{ display: 'block', marginBottom: i === 0 ? undefined : '0.75em' }}>
        {para.split('\n').map((line, j, lines) => (
          <span key={j}>{line}{j < lines.length - 1 && <br />}</span>
        ))}
      </span>
    ))
  }
  return value.split('\n').map((line, i, lines) => (
    <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
  ))
}

/**
 * Live-edit a single field inside `actualites.grid.items` for the given article slug.
 */
export default function EditableArticleField({
  slug,
  field,
  label,
  as: Tag = 'p',
  className = '',
  multiline = false,
  image = false,
  fallback = '',
}: Props) {
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const { value: raw, update } = useContentBlock('actualites', 'grid.items', {
    type: 'json',
    label: 'Grille — Articles',
    fallback: ACTUALITES_DEFAULTS['grid.items'],
  })
  const lang = (i18n.language || 'fr').split('-')[0]
  const articles = parseArticles(raw, parseArticles(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES))
  const article = findArticleBySlug(articles, slug)
  const fieldValue = article ? getFieldValue(article, field) : fallback
  const rawDisplay = fieldValue || fallback
  const display = rawDisplay

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(rawDisplay)
  const [uploading, setUploading] = useState(false)
  const textRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(rawDisplay) }, [rawDisplay])
  useEffect(() => {
    if (editing && textRef.current) textRef.current.focus()
  }, [editing])

  const patch = (nextValue: string) => {
    if (!article) return
    const nextArticles = articles.map((item) =>
      item.slug === slug ? setFieldValue(item, field, nextValue) : item,
    )
    update(JSON.stringify(nextArticles))
  }

  const save = () => {
    patch(draft)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(display)
    setEditing(false)
  }

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const { uploadWebsiteImage } = await import('./uploadWebsiteImage')
      const url = await uploadWebsiteImage(file)
      patch(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors du téléversement.')
    } finally {
      setUploading(false)
    }
  }

  if (image) {
    const src = display || fallback
    if (!isEditMode) {
      return <img src={src} alt="" className={className} />
    }
    return (
      <div
        className={`cms-editable cms-editable--image ${className}`}
        onClick={() => fileRef.current?.click()}
        title={label || 'Cliquer pour changer l\'image'}
      >
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="cms-editable__overlay">
          {uploading ? (
            <span><i className="fa-solid fa-spinner fa-spin" /> Envoi...</span>
          ) : (
            <span><i className="fa-solid fa-camera" /> Changer l'image</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
            e.target.value = ''
          }}
        />
      </div>
    )
  }

  if (!isEditMode) {
    return <Tag className={className}>{renderLines(display, multiline, Tag === 'div')}</Tag>
  }

  if (editing) {
    return (
      <div className="cms-edit-popup">
        {label && (
          <div className="cms-edit-popup__label">
            {label}
            <span className="cms-edit-popup__lang">{LANG_BADGE[lang] ?? lang}</span>
          </div>
        )}
        {multiline ? (
          <textarea
            ref={textRef as React.RefObject<HTMLTextAreaElement>}
            className="cms-edit-popup__input"
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            ref={textRef as React.RefObject<HTMLInputElement>}
            className="cms-edit-popup__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
        <div className="cms-edit-popup__actions">
          <button type="button" className="cms-btn cms-btn--save" onClick={save}>OK</button>
          <button type="button" className="cms-btn cms-btn--cancel" onClick={cancel}>Annuler</button>
        </div>
      </div>
    )
  }

  return (
    <Tag
      className={`cms-editable cms-editable--text ${className}`}
      onClick={() => setEditing(true)}
      title={label || 'Cliquer pour modifier'}
    >
      {renderLines(display, multiline, Tag === 'div')}
      <span className="cms-editable__badge"><i className="fa-solid fa-pen" /></span>
    </Tag>
  )
}
