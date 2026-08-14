import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Columns, Eye, LayoutGrid } from 'lucide-react'
import api from '../../../api/client'
import BuilderSectionPreview, { type PreviewCarouselItem } from './BuilderSectionPreview'
import InsertionZone from './InsertionZone'
import ComponentPalette from './ComponentPalette'
import SectionEditorPanel from './SectionEditorPanel'
import BuilderLivePreview, { type EmbedEditPayload } from './BuilderLivePreview'

export type InsertTarget = '__start__' | string | null
export type CanvasMode = 'structure' | 'preview' | 'split'

interface BlockRow {
  key: string
  type: 'text' | 'image' | 'json'
  label: string | null
  sort_order?: number
  locales: Record<string, { value: string | null }>
}

export interface BuilderSection {
  name: string
  title?: string
  pattern?: string | null
  blocks: BlockRow[]
}

interface PendingChange {
  section: string
  key: string
  locale: string
  value: string
}

interface Props {
  pageSlug: string
  pageTitle: string
  sections: BuilderSection[]
  selectedSection: string | null
  insertTarget: InsertTarget
  insertLoading: boolean
  changes: Record<string, PendingChange>
  onSelectSection: (slug: string | null) => void
  onSetInsertTarget: (target: InsertTarget) => void
  onInsertPattern: (patternId: string) => void
  onDeleteSection: (slug: string) => void
  effectiveValue: (section: string, block: BlockRow, locale: string) => string
  effectiveLabel: (section: string, block: BlockRow) => string
  setLabelChange: (section: string, block: BlockRow, label: string) => void
  setValueChange: (section: string, block: BlockRow, locale: string, value: string) => void
  onDeleteLocale: (section: string, key: string, locale: string) => void
  onUploadImage: (section: string, block: BlockRow, file: File) => void
  onEmbedEdit?: (edit: EmbedEditPayload) => void
  onEmbedSaved?: (page: string) => void
}

export default function PageBuilder({
  pageSlug, sections,
  selectedSection, insertTarget, insertLoading, changes,
  onSelectSection, onSetInsertTarget, onInsertPattern, onDeleteSection,
  effectiveValue, effectiveLabel, setLabelChange, setValueChange,
  onDeleteLocale, onUploadImage,
  onEmbedEdit, onEmbedSaved,
}: Props) {
  const selected = sections.find(s => s.name === selectedSection)
  const [canvasMode, setCanvasMode] = useState<CanvasMode>(() => {
    try {
      const saved = sessionStorage.getItem('fi2t-pb-canvas')
      if (saved === 'structure' || saved === 'split' || saved === 'preview') return saved
    } catch { /* ignore */ }
    return 'split'
  })
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [previewLocale, setPreviewLocale] = useState<'fr' | 'en' | 'ar'>('fr')

  const changeCanvasMode = (mode: CanvasMode) => {
    setCanvasMode(mode)
    try { sessionStorage.setItem('fi2t-pb-canvas', mode) } catch { /* ignore */ }
  }

  const { data: publicCarousels = [] } = useQuery<Array<{ slug: string; active_items: PreviewCarouselItem[] }>>({
    queryKey: ['public-carousels-preview'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/carousels/public')
        return Array.isArray(data) ? data : []
      } catch {
        // Hotel leftover endpoint — not required for FI2T pages.
        return []
      }
    },
    staleTime: 60_000,
    retry: false,
  })

  const carouselBySlug = useMemo(
    () => Object.fromEntries(publicCarousels.map(c => [c.slug, c.active_items ?? []])),
    [publicCarousels],
  )

  const showStructure = canvasMode === 'structure' || canvasMode === 'split'
  const showPreview = canvasMode === 'preview' || canvasMode === 'split'

  const layoutClass = [
    'pb-layout',
    canvasMode === 'split' ? 'pb-layout--split' : '',
    canvasMode === 'preview' ? 'pb-layout--preview-only' : '',
    previewExpanded ? 'pb-layout--preview-expanded' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={layoutClass}>
      {showStructure && (
        <div className="pb-canvas-column">
          <div className="pb-canvas-header">
            <div className="pb-canvas-header__left">
              <span><LayoutGrid size={14} /> Structure de la page</span>
              <div className="pb-canvas-modes">
                <button type="button" className={canvasMode === 'structure' ? 'active' : ''} onClick={() => changeCanvasMode('structure')} title="Structure seule">
                  <LayoutGrid size={13} />
                </button>
                <button type="button" className={canvasMode === 'split' ? 'active' : ''} onClick={() => changeCanvasMode('split')} title="Structure + aperçu">
                  <Columns size={13} />
                </button>
                <button type="button" className="" onClick={() => changeCanvasMode('preview')} title="Aperçu seul">
                  <Eye size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="pb-canvas" onClick={() => onSelectSection(null)}>
            {sections.length === 0 && (
              <div className="pb-empty">
                <LayoutGrid size={40} />
                <h3>Page vide — commencez ici</h3>
                <p>Cliquez sur <strong>+ Ajouter une zone</strong> ci-dessous, puis choisissez un composant dans le menu à droite.</p>
              </div>
            )}

            <InsertionZone
              active={insertTarget === '__start__'}
              onClick={() => {
                onSelectSection(null)
                onSetInsertTarget(insertTarget === '__start__' ? null : '__start__')
              }}
              label="Ajouter en haut de page"
            />

            {sections.map(sec => (
              <div key={sec.name} className="pb-section-wrap">
                <BuilderSectionPreview
                  pageSlug={pageSlug}
                  section={sec}
                  selected={selectedSection === sec.name}
                  carouselBySlug={carouselBySlug}
                  getValue={(key, locale = 'fr') => {
                    const block = sec.blocks.find(b => b.key === key)
                    if (!block) return ''
                    if (block.type === 'image') return effectiveValue(sec.name, block, '_all')
                    if (block.type === 'json') {
                      return (
                        effectiveValue(sec.name, block, locale)
                        || effectiveValue(sec.name, block, 'fr')
                        || effectiveValue(sec.name, block, '_all')
                      )
                    }
                    return effectiveValue(sec.name, block, locale)
                  }}
                  onClick={() => {
                    onSetInsertTarget(null)
                    onSelectSection(sec.name)
                  }}
                />
                <InsertionZone
                  active={insertTarget === sec.name}
                  onClick={() => {
                    onSelectSection(null)
                    onSetInsertTarget(insertTarget === sec.name ? null : sec.name)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {showPreview && (
        <div className="pb-preview-column">
          {!showStructure && (
            <div className="pb-canvas-header pb-canvas-header--preview-only">
              <div className="pb-canvas-header__left">
                <span><Eye size={14} /> Aperçu instantané</span>
                <div className="pb-canvas-modes">
                  <button type="button" onClick={() => changeCanvasMode('structure')} title="Structure seule">
                    <LayoutGrid size={13} />
                  </button>
                  <button type="button" onClick={() => changeCanvasMode('split')} title="Structure + aperçu">
                    <Columns size={13} />
                  </button>
                  <button type="button" className="active" title="Aperçu seul">
                    <Eye size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <BuilderLivePreview
            pageSlug={pageSlug}
            sections={sections}
            changes={changes}
            selectedSection={selectedSection}
            expanded={previewExpanded}
            onToggleExpand={() => setPreviewExpanded(e => !e)}
            showToolbar
            onLocaleChange={setPreviewLocale}
            onEmbedEdit={onEmbedEdit}
            onEmbedSaved={onEmbedSaved}
          />
        </div>
      )}

      {!previewExpanded && (
        <div className="pb-side-column">
          {selected ? (
            <SectionEditorPanel
              section={selected}
              pageSlug={pageSlug}
              preferredLocale={previewLocale}
              onBack={() => onSelectSection(null)}
              onDelete={() => onDeleteSection(selected.name)}
              effectiveValue={effectiveValue}
              effectiveLabel={effectiveLabel}
              setLabelChange={setLabelChange}
              setValueChange={setValueChange}
              changes={changes}
              onDeleteLocale={(key, locale) => onDeleteLocale(selected.name, key, locale)}
              onUploadImage={(block, file) => onUploadImage(selected.name, block, file)}
            />
          ) : (
            <ComponentPalette
              active={insertTarget !== null}
              loading={insertLoading}
              onPick={onInsertPattern}
            />
          )}
        </div>
      )}
    </div>
  )
}
