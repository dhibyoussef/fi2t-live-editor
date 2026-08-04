import { ArrowLeft, Trash2, Image as ImageIcon, Type, Layers, Upload } from 'lucide-react'
import LocalizedJsonEditor from '../editors/LocalizedJsonEditor'
import { TEXT_LOCALES } from '../editors/jsonLocale'

interface BlockRow {
  key: string
  type: 'text' | 'image' | 'json'
  label: string | null
  locales: Record<string, { value: string | null }>
}

interface Section {
  name: string
  title?: string
  pattern?: string | null
  blocks: BlockRow[]
}

interface Props {
  section: Section
  pageSlug: string
  preferredLocale?: string
  onBack: () => void
  onDelete: () => void
  effectiveValue: (section: string, block: BlockRow, locale: string) => string
  effectiveLabel: (section: string, block: BlockRow) => string
  setLabelChange: (section: string, block: BlockRow, label: string) => void
  setValueChange: (section: string, block: BlockRow, locale: string, value: string) => void
  changes: Record<string, unknown>
  onDeleteLocale: (key: string, locale: string) => void
  onUploadImage: (block: BlockRow, file: File) => void
}

export default function SectionEditorPanel({
  section, pageSlug, preferredLocale = 'fr', onBack, onDelete,
  effectiveValue, effectiveLabel, setLabelChange, setValueChange,
  changes, onDeleteLocale, onUploadImage,
}: Props) {
  return (
    <aside className="pb-editor">
      <div className="pb-editor__head">
        <button type="button" className="pb-editor__back" onClick={onBack}>
          <ArrowLeft size={14} /> Composants
        </button>
        <h3>{section.title ?? section.name}</h3>
        <button type="button" className="pb-editor__delete" onClick={onDelete} title="Supprimer la section">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="pb-editor__scroll">
        {section.blocks.map(block => (
          <div key={block.key} className="pb-editor__block">
            <div className="pb-editor__block-head">
              <span className={`wc-type-badge wc-type-${block.type}`}>
                {block.type === 'text' && <Type size={11} />}
                {block.type === 'image' && <ImageIcon size={11} />}
                {block.type === 'json' && <Layers size={11} />}
                {block.type === 'json' ? 'liste' : block.type}
              </span>
              <code>{block.key}</code>
            </div>
            <input
              className="wc-block-label"
              value={effectiveLabel(section.name, block)}
              placeholder="Titre du champ"
              onChange={e => setLabelChange(section.name, block, e.target.value)}
            />

            {block.type === 'text' && (
              <div className="pb-editor__locales">
                {TEXT_LOCALES.map(loc => {
                  const exists = !!block.locales[loc.code]
                  const dirty = !!changes[`${section.name}.${block.key}.${loc.code}`]
                  return (
                    <div key={loc.code} className={`wc-locale-cell${!exists ? ' missing' : ''}`}>
                      <div className="wc-locale-head">
                        <span>{loc.flag} {loc.name}</span>
                        {!exists && <span className="wc-missing-tag">À ajouter</span>}
                      </div>
                      <textarea
                        className={`wc-locale-input${dirty ? ' dirty' : ''}`}
                        rows={3}
                        value={effectiveValue(section.name, block, loc.code)}
                        dir={loc.code === 'ar' ? 'rtl' : 'ltr'}
                        onChange={e => setValueChange(section.name, block, loc.code, e.target.value)}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {block.type === 'image' && (
              <div className="wc-image-fields">
                <input
                  className="wc-locale-input"
                  value={effectiveValue(section.name, block, '_all')}
                  onChange={e => setValueChange(section.name, block, '_all', e.target.value)}
                />
                <label className="wc-upload-btn">
                  <Upload size={13} /> Téléverser
                  <input type="file" accept="image/*" hidden onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) onUploadImage(block, f)
                    e.target.value = ''
                  }} />
                </label>
              </div>
            )}

            {block.type === 'json' && (
              <LocalizedJsonEditor
                section={section.name}
                block={block}
                preferredLocale={preferredLocale}
                valueFor={(locale) => effectiveValue(section.name, block, locale)}
                onChange={(locale, v) => setValueChange(section.name, block, locale, v)}
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
