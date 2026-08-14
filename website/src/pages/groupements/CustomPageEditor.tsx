/**
 * Live editor for the Figma-custom groupement layouts.
 *
 * Those bands are pixel-locked artboards: their text sits inside deeply nested
 * markup whose exact structure is what keeps the design on the grid, so they
 * cannot carry per-string click-to-edit wrappers without disturbing it.
 * Instead each band gets a marker button on the page, and editing happens in a
 * side panel driven by the same schema the admin uses — so every field is
 * editable and nothing about the rendered artboard changes.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from '../../cms/EditModeProvider'
import { useContentBlock } from '../../cms/ContentProvider'
import type { CustomGroupementPage } from '../../cms/defaults/groupement-custom-pages'
import {
  getLayoutSchema,
  sectionBlockKey,
  type SchemaField,
  type SchemaSection,
} from '../../cms/defaults/groupement-page-schema'
import { publicUrl } from '../../lib/publicUrl'

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

async function uploadImage(file: File): Promise<string> {
  const { uploadWebsiteImage } = await import('../../cms/uploadWebsiteImage')
  return uploadWebsiteImage(file)
}

const IMAGE_FIELD = /^(img|image|face|icon|photo|banner|blueprint|marinaImg)$/i
const AUTOMATIC_SEQUENCE_FIELD = /^(num|number)$/i

function looksLikeImage(key: string, value: unknown) {
  return IMAGE_FIELD.test(key) || (typeof value === 'string' && /^\/(images|storage)\//.test(value))
}

/** One editable leaf: text, longer text, or an image with an upload button. */
function Leaf({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [busy, setBusy] = useState(false)

  if (looksLikeImage(label, value)) {
    return (
      <label className="glx-field">
        <span className="glx-field__label">{label}</span>
        <div className="glx-image">
          {value ? <img src={publicUrl(value)} alt="" /> : <span className="glx-image__empty">—</span>}
          <div className="glx-image__side">
            <input className="glx-input" value={value} onChange={(e) => onChange(e.target.value)} />
            <label className="glx-btn glx-btn--ghost">
              {busy ? 'Envoi…' : 'Changer l’image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  if (!f) return
                  setBusy(true)
                  try {
                    onChange(await uploadImage(f))
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Erreur lors du téléversement.')
                  } finally {
                    setBusy(false)
                  }
                }}
              />
            </label>
          </div>
        </div>
      </label>
    )
  }

  const long = value.length > 70 || value.includes('\n')
  return (
    <label className="glx-field">
      <span className="glx-field__label">{label}</span>
      {long ? (
        <textarea className="glx-input glx-input--area" value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, value.split('\n').length + 2)} />
      ) : (
        <input className="glx-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

/** Recursively renders an object/array subtree of the band's JSON. */
function Node({
  label,
  value,
  onChange,
}: {
  label: string
  value: Json
  onChange: (v: Json) => void
}) {
  if (typeof value === 'string') {
    return <Leaf label={label} value={value} onChange={(v) => onChange(v)} />
  }
  if (typeof value === 'number') {
    return (
      <label className="glx-field">
        <span className="glx-field__label">{label}</span>
        <input
          className="glx-input"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <label className="glx-field glx-field--inline">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="glx-field__label">{label}</span>
      </label>
    )
  }
  if (Array.isArray(value)) {
    const addItem = () => {
      const first = value[0]
      const blank: Json =
        typeof first === 'string'
          ? ''
          : first && typeof first === 'object'
            ? (Object.fromEntries(
                Object.keys(first)
                  .filter((key) => !AUTOMATIC_SEQUENCE_FIELD.test(key))
                  .map((key) => [key, '']),
              ) as Json)
            : ''
      onChange([...value, blank])
    }
    return (
      <div className="glx-group">
        <div className="glx-group__head">
          <span className="glx-group__title">{label}</span>
          <button type="button" className="glx-btn glx-btn--ghost" onClick={addItem}>
            + Ajouter
          </button>
        </div>
        {value.map((item, i) => (
          <div className="glx-item" key={i}>
            <div className="glx-item__head">
              <span>#{i + 1}</span>
              <button
                type="button"
                className="glx-btn glx-btn--danger"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                Supprimer
              </button>
            </div>
            <Node
              label={typeof item === 'string' ? 'Texte' : ''}
              value={item}
              onChange={(v) => onChange(value.map((old, j) => (j === i ? v : old)))}
            />
          </div>
        ))}
      </div>
    )
  }
  if (value && typeof value === 'object') {
    return (
      <div className="glx-object">
        {label ? <span className="glx-group__title">{label}</span> : null}
        {Object.entries(value)
          .filter(([key]) => !AUTOMATIC_SEQUENCE_FIELD.test(key))
          .map(([k, v]) => (
          <Node
            key={k}
            label={k}
            value={v}
            onChange={(nv) => onChange({ ...value, [k]: nv })}
          />
          ))}
      </div>
    )
  }
  return null
}

/** Shared chrome for every panel: heading, scrolling body, apply button. */
function Panel({
  label,
  onClose,
  onApply,
  children,
}: {
  label: string
  onClose: () => void
  onApply: () => void
  children: ReactNode
}) {
  return (
    <div className="glx-panel" role="dialog" aria-label={label}>
      <div className="glx-panel__head">
        <strong>{label}</strong>
        <button type="button" className="glx-btn glx-btn--ghost" onClick={onClose}>
          Fermer
        </button>
      </div>
      <div className="glx-panel__body">{children}</div>
      <div className="glx-panel__foot">
        <button
          type="button"
          className="glx-btn glx-btn--primary"
          onClick={() => {
            onApply()
            onClose()
          }}
        >
          Appliquer
        </button>
        <span className="glx-hint">Puis « Enregistrer » dans la barre du bas.</span>
      </div>
    </div>
  )
}

/**
 * Reads a band's JSON block, pre-filled from the rendered page so an un-edited
 * band opens with its real content rather than blank inputs.
 */
function useBandDraft(slug: string, section: SchemaSection | null, page: CustomGroupementPage) {
  const { value, update } = useContentBlock(slug, sectionBlockKey(section?.id ?? '__none'), {
    type: 'json',
    label: section?.label ?? '',
    fallback: '',
  })

  const initial = useMemo(() => {
    if (!section) return {}
    try {
      const parsed = value ? JSON.parse(value) : null
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, Json>
      }
    } catch {
      /* fall through to the page's own values */
    }
    const seeded: Record<string, Json> = {}
    for (const f of section.fields) {
      const v = page.sections[f.key]
      if (v !== undefined) seeded[f.field] = clone(v) as Json
    }
    return seeded
  }, [value, section, page])

  const [draft, setDraft] = useState<Record<string, Json>>(initial)
  useEffect(() => setDraft(initial), [initial])

  const labelFor = (field: string) =>
    section?.fields.find((f: SchemaField) => f.field === field)?.label ?? field

  return { draft, setDraft, labelFor, commit: () => update(JSON.stringify(draft)) }
}

/** The banner title, which lives in a plain text block rather than a band. */
function HeroPanel({ slug, onClose }: { slug: string; onClose: () => void }) {
  const title = useContentBlock(slug, 'hero.title', { type: 'text', label: 'Titre de la bannière' })
  const [draft, setDraft] = useState(title.value)
  useEffect(() => setDraft(title.value), [title.value])

  return (
    <Panel
      label="Bannière"
      onClose={onClose}
      onApply={() => {
        if (draft !== title.value) title.update(draft)
      }}
    >
      <Leaf label="Titre de la bannière" value={draft} onChange={setDraft} />
      <p className="glx-hint">L’image se change en cliquant dessus sur la page.</p>
    </Panel>
  )
}

/** Editor for a single band, backed by its own CMS block. */
function BandPanel({
  slug,
  section,
  page,
  onClose,
}: {
  slug: string
  section: SchemaSection
  page: CustomGroupementPage
  onClose: () => void
}) {
  const { draft, setDraft, labelFor, commit } = useBandDraft(slug, section, page)

  return (
    <Panel label={section.label} onClose={onClose} onApply={commit}>
      {Object.entries(draft).map(([k, v]) => (
        <Node
          key={k}
          label={labelFor(k)}
          value={v}
          onChange={(nv) => setDraft((d) => ({ ...d, [k]: nv }))}
        />
      ))}
    </Panel>
  )
}

/**
 * The introduction paragraph is a text block on every layout; some layouts add
 * a surtitle and an accroche around it. The page shows them as one band, so
 * the editor does too.
 */
function IntroPanel({
  slug,
  section,
  page,
  onClose,
}: {
  slug: string
  section: SchemaSection | null
  page: CustomGroupementPage
  onClose: () => void
}) {
  const body = useContentBlock(slug, 'intro.body', { type: 'text', label: 'Texte d’introduction' })
  const [draftBody, setDraftBody] = useState(body.value)
  useEffect(() => setDraftBody(body.value), [body.value])

  const band = useBandDraft(slug, section, page)

  return (
    <Panel
      label="Introduction"
      onClose={onClose}
      onApply={() => {
        if (draftBody !== body.value) body.update(draftBody)
        if (section) band.commit()
      }}
    >
      {Object.entries(band.draft).map(([k, v]) => (
        <Node
          key={k}
          label={band.labelFor(k)}
          value={v}
          onChange={(nv) => band.setDraft((d) => ({ ...d, [k]: nv }))}
        />
      ))}
      <Leaf label="Texte d’introduction" value={draftBody} onChange={setDraftBody} />
    </Panel>
  )
}

const HERO_BAND = '__hero'
const INTRO_BAND = 'intro'

export default function CustomPageEditor({
  slug,
  page,
}: {
  slug: string
  page: CustomGroupementPage
}) {
  const { isEditMode } = useEditMode()
  const { i18n } = useTranslation()
  const [open, setOpen] = useState<string | null>(null)
  const schema = getLayoutSchema(page.layout)
  const lang = (i18n.language || 'fr').split('-')[0].toUpperCase()

  // The admin embeds the site in a preview iframe that has its own structure
  // panel; a second floating dock inside it would just cover the preview.
  const embedded = typeof window !== 'undefined' && window.self !== window.top

  if (!isEditMode || embedded || !schema.length) return null

  const introSection = schema.find((s) => s.id === INTRO_BAND) ?? null
  /*
   * The dock mirrors the page top to bottom. Banner and introduction always
   * lead; the introduction band, when the layout has one, is folded into the
   * introduction entry instead of repeating as a band of its own.
   */
  const entries = [
    { id: HERO_BAND, label: 'Bannière', count: 1 },
    {
      id: INTRO_BAND,
      label: 'Introduction',
      count: 1 + (introSection?.fields.length ?? 0),
    },
    ...schema
      .filter((s) => s.id !== INTRO_BAND)
      .map((s) => ({ id: s.id, label: s.label, count: s.fields.length })),
  ]
  const active = schema.find((s) => s.id === open && s.id !== INTRO_BAND) ?? null

  return (
    <>
      <div className="glx-dock" aria-label="Sections de la page">
        <div className="glx-dock__head">
          <strong>Structure de la page</strong>
          <span className="glx-dock__lang">{lang}</span>
        </div>
        <ul className="glx-dock__list">
          {entries.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className={`glx-dock__item${open === e.id ? ' is-active' : ''}`}
                onClick={() => setOpen(open === e.id ? null : e.id)}
              >
                <span>{e.label}</span>
                <em>{e.count}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open === HERO_BAND ? <HeroPanel slug={slug} onClose={() => setOpen(null)} /> : null}
      {open === INTRO_BAND ? (
        <IntroPanel slug={slug} section={introSection} page={page} onClose={() => setOpen(null)} />
      ) : null}
      {active ? (
        <BandPanel slug={slug} section={active} page={page} onClose={() => setOpen(null)} />
      ) : null}
    </>
  )
}
