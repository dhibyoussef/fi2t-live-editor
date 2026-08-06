import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContentBlock } from './ContentProvider'

export type BlockOffset = {
  left?: number
  right?: number
  top?: number
  bottom?: number
}

type Props = {
  page: string
  /** Content key storing JSON offsets, e.g. `about.badge_pos` */
  blockKey: string
  label?: string
  className?: string
  fallback: BlockOffset
  children: ReactNode
}

function parseOffset(raw: string, fallback: BlockOffset): BlockOffset {
  try {
    const parsed = JSON.parse(raw) as BlockOffset
    if (parsed && typeof parsed === 'object') {
      const merged = { ...fallback, ...parsed }
      // One horizontal anchor only — left+right together stretches the badge
      // (looks like two overlapping cards, especially in Arabic).
      if (merged.left != null && merged.right != null) {
        if (fallback.left != null) delete merged.right
        else delete merged.left
      }
      return merged
    }
  } catch {
    /* keep fallback */
  }
  return fallback
}

function offsetToStyle(pos: BlockOffset, rtl = false): CSSProperties {
  const style: CSSProperties = { position: 'absolute', left: '', right: '' }
  /*
   * Offsets are authored for LTR (left:-29 hangs the about badge into the
   * text column). In RTL the media column flips sides, so the same physical
   * left/right would push the badge off the page — mirror the horizontal
   * anchors instead.
   */
  if (rtl) {
    if (pos.left != null) style.right = `${pos.left}px`
    else if (pos.right != null) style.left = `${pos.right}px`
  } else {
    if (pos.left != null) style.left = `${pos.left}px`
    else if (pos.right != null) style.right = `${pos.right}px`
  }
  if (pos.top != null) style.top = `${pos.top}px`
  if (pos.bottom != null) style.bottom = `${pos.bottom}px`
  return style
}

/**
 * Absolutely positions a block relative to its parent, with live-edit
 * drag + X/Y numeric controls (Figma-style).
 */
export default function EditablePositioned({
  page,
  blockKey,
  label = 'Position',
  className = '',
  fallback,
  children,
}: Props) {
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const { value, update } = useContentBlock(page, blockKey, {
    type: 'json',
    label,
    fallback: JSON.stringify(fallback),
    shared: true,
  })
  const lang = (i18n.language || 'fr').split('-')[0]
  const rtl = (typeof document !== 'undefined' && document.documentElement.dir === 'rtl')
    || lang === 'ar'
  const pos = parseOffset(value, fallback)

  const [panelOpen, setPanelOpen] = useState(false)
  const [draft, setDraft] = useState(pos)
  const dragRef = useRef<{
    startX: number
    startY: number
    origin: BlockOffset
    moved: boolean
  } | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)
  const skipClickRef = useRef(false)

  const draftRef = useRef(pos)
  useEffect(() => {
    setDraft(pos)
    draftRef.current = pos
  }, [value])

  const commit = (next: BlockOffset) => {
    const cleaned: BlockOffset = {}
    if (next.left != null) cleaned.left = Math.round(next.left)
    else if (next.right != null) cleaned.right = Math.round(next.right)
    if (next.top != null) cleaned.top = Math.round(next.top)
    if (next.bottom != null) cleaned.bottom = Math.round(next.bottom)
    update(JSON.stringify(cleaned))
  }

  const preview = (next: BlockOffset) => {
    draftRef.current = next
    setDraft(next)
    if (nodeRef.current) {
      // Clear both sides before applying so a left↔right swap never sticks.
      nodeRef.current.style.left = ''
      nodeRef.current.style.right = ''
      Object.assign(nodeRef.current.style, offsetToStyle(next, rtl))
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isEditMode) return
    const target = e.target as HTMLElement
    if (!target.closest('.cms-pos-handle')) return
    if (e.button !== 0) return

    e.preventDefault()
    e.stopPropagation()
    setPanelOpen(false)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...draftRef.current },
      moved: false,
    }
    nodeRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true
    const origin = dragRef.current.origin
    const next: BlockOffset = { ...origin }

    // In RTL the visual X axis is flipped (left offset → right style).
    const sx = rtl ? -dx : dx
    if (origin.left != null) next.left = origin.left + sx
    else if (origin.right != null) next.right = origin.right - sx

    if (origin.bottom != null) next.bottom = origin.bottom - dy
    else if (origin.top != null) next.top = origin.top + dy

    preview(next)
  }

  const onPointerUp = () => {
    if (!dragRef.current) return
    const moved = dragRef.current.moved
    dragRef.current = null
    if (moved) {
      skipClickRef.current = true
      commit(draftRef.current)
    }
  }

  const openPanel = (e: React.MouseEvent) => {
    if (!isEditMode) return
    e.stopPropagation()
    if (skipClickRef.current) {
      skipClickRef.current = false
      return
    }
    setDraft(draftRef.current)
    setPanelOpen(true)
  }

  if (!isEditMode) {
    return (
      <div
        className={className}
        style={offsetToStyle(pos, rtl)}
        data-cms-page={page}
        data-cms-block={blockKey}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={nodeRef}
      data-cms-page={page}
      data-cms-block={blockKey}
      className={`cms-editable cms-editable--position ${className}`}
      style={offsetToStyle(draft, rtl)}
      onPointerDown={undefined}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={openPanel}
      title="Position éditable"
    >
      {children}
      <button
        type="button"
        className="cms-pos-handle"
        onPointerDown={onPointerDown}
        onClick={(e) => {
          e.stopPropagation()
          openPanel(e)
        }}
        title="Glisser pour déplacer · clic pour X/Y"
        aria-label="Régler la position"
      >
        <i className="fa-solid fa-arrows-up-down-left-right" />
      </button>

      {panelOpen && (
        <div className="cms-edit-popup cms-pos-popup" onPointerDown={(e) => e.stopPropagation()}>
          <div className="cms-edit-popup__label">
            {label}
            <span className="cms-edit-popup__lang" title="Partagé — toutes les langues">ALL</span>
          </div>
          <p className="cms-pos-popup__hint">
            Position partagée (toutes les langues). Offsets en px par rapport à l’image.
          </p>
          <div className="cms-pos-popup__grid">
            {draft.left != null && (
              <label>
                <span>X (left)</span>
                <input
                  type="number"
                  value={Math.round(draft.left)}
                  onChange={(e) => {
                    const next = { ...draft, left: Number(e.target.value) }
                    draftRef.current = next
                    setDraft(next)
                  }}
                />
              </label>
            )}
            {draft.right != null && (
              <label>
                <span>X (right)</span>
                <input
                  type="number"
                  value={Math.round(draft.right)}
                  onChange={(e) => {
                    const next = { ...draft, right: Number(e.target.value) }
                    draftRef.current = next
                    setDraft(next)
                  }}
                />
              </label>
            )}
            {draft.top != null && (
              <label>
                <span>Y (top)</span>
                <input
                  type="number"
                  value={Math.round(draft.top)}
                  onChange={(e) => {
                    const next = { ...draft, top: Number(e.target.value) }
                    draftRef.current = next
                    setDraft(next)
                  }}
                />
              </label>
            )}
            {draft.bottom != null && (
              <label>
                <span>Y (bottom)</span>
                <input
                  type="number"
                  value={Math.round(draft.bottom)}
                  onChange={(e) => {
                    const next = { ...draft, bottom: Number(e.target.value) }
                    draftRef.current = next
                    setDraft(next)
                  }}
                />
              </label>
            )}
          </div>
          <div className="cms-edit-popup__actions">
            <button
              type="button"
              className="cms-btn cms-btn--save"
              onClick={() => {
                commit(draft)
                setPanelOpen(false)
              }}
            >
              OK
            </button>
            <button
              type="button"
              className="cms-btn cms-btn--cancel"
              onClick={() => {
                setDraft(pos)
                setPanelOpen(false)
              }}
            >
              Annuler
            </button>
            <button
              type="button"
              className="cms-btn cms-btn--cancel"
              onClick={() => {
                setDraft(fallback)
                commit(fallback)
                setPanelOpen(false)
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
