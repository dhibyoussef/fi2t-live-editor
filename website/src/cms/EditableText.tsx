import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'

const LANG_BADGE: Record<string, string> = { fr: '🇫🇷 FR', en: '🇬🇧 EN', ar: '🇹🇳 AR' }

function renderTextContent(value: string, multiline: boolean, as: string) {
  if (multiline && as === 'div') {
    return value.split(/\n\n+/).filter(Boolean).map((para, i) => (
      <p key={i}>
        {para.split('\n').map((line, j, lines) => (
          <span key={j}>{line}{j < lines.length - 1 && <br />}</span>
        ))}
      </p>
    ))
  }

  return value.split('\n').map((line, i, lines) => (
    <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
  ))
}

interface Props {
  page: string
  blockKey: string
  label?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div' | 'blockquote' | 'strong' | 'time'
  className?: string
  multiline?: boolean
  fallback?: string
}

export default function EditableText({
  page, blockKey, label, as: Tag = 'p', className = '', multiline = false, fallback = '',
}: Props) {
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const { value, update, commit } = useContentBlock(page, blockKey, { type: 'text', label, fallback })
  const lang = (i18n.language || 'fr').split('-')[0]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  const save = () => {
    // Footer / header live in a separate ContentProvider without the page toolbar —
    // commit immediately so edits aren't stranded in an unreachable pending queue.
    if (page === 'global') {
      void commit(draft)
    } else {
      update(draft)
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  // `data-cms-block` marks the real anatomy of the page: the back-office reads
  // it to build a structure that matches what visitors actually see.
  if (!isEditMode) {
    return (
      <Tag className={className} data-cms-page={page} data-cms-block={blockKey}>
        {renderTextContent(value, multiline, Tag)}
      </Tag>
    )
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
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            className="cms-edit-popup__input"
            rows={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
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
      data-cms-page={page}
      data-cms-block={blockKey}
    >
      {renderTextContent(value, multiline, Tag)}
      <span className="cms-editable__badge"><i className="fa-solid fa-pen" /></span>
    </Tag>
  )
}
