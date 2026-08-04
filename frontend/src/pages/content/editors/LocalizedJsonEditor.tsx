import { useEffect, useState } from 'react'
import JsonBlockEditor from './JsonBlockEditor'
import { TEXT_LOCALES, isLocalizedJson, pickJsonLocale, type JsonLocale } from './jsonLocale'

interface BlockLike {
  key: string
  locales: Record<string, unknown>
}

interface Props {
  section: string
  block: BlockLike
  valueFor: (locale: JsonLocale) => string
  onChange: (locale: JsonLocale, value: string) => void
  /** Locale currently selected in the live preview (builder). */
  preferredLocale?: string
}

/**
 * Wraps JsonBlockEditor with FR/EN/AR tabs when the block is stored per language.
 * Shared (`_all`) lists keep a single editor — same UX as before.
 */
export default function LocalizedJsonEditor({
  section,
  block,
  valueFor,
  onChange,
  preferredLocale = 'fr',
}: Props) {
  const localized = isLocalizedJson(block)
  const [tab, setTab] = useState<JsonLocale>(() =>
    localized ? pickJsonLocale(block, preferredLocale) : '_all',
  )

  useEffect(() => {
    if (!localized) return
    setTab(pickJsonLocale(block, preferredLocale))
  }, [preferredLocale, localized, block])

  if (!localized) {
    return (
      <JsonBlockEditor
        section={section}
        blockKey={block.key}
        value={valueFor('_all')}
        onChange={(v) => onChange('_all', v)}
      />
    )
  }

  return (
    <div className="wc-localized-json">
      <div className="wc-localized-json__tabs" role="tablist">
        {TEXT_LOCALES.map((loc) => (
          <button
            key={loc.code}
            type="button"
            role="tab"
            aria-selected={tab === loc.code}
            className={`wc-localized-json__tab${tab === loc.code ? ' is-active' : ''}`}
            onClick={() => setTab(loc.code)}
          >
            {loc.flag} {loc.code.toUpperCase()}
          </button>
        ))}
      </div>
      <JsonBlockEditor
        section={section}
        blockKey={block.key}
        value={valueFor(tab)}
        onChange={(v) => onChange(tab, v)}
      />
    </div>
  )
}
