import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutTemplate, Save, Plus, X, Search, ChevronDown, ChevronRight,
  Image as ImageIcon, Type, Layers, Upload, Trash2, LayoutGrid, List,
} from 'lucide-react'
import LocalizedJsonEditor from './editors/LocalizedJsonEditor'
import PageSidebar, { type CmsPage } from './components/PageSidebar'
import AddPageModal from './components/AddPageModal'
import PageBuilder, { type InsertTarget } from './builder/PageBuilder'
import SiteMenuEditor from './SiteMenuEditor'
import SiteSettingsEditor from './SiteSettingsEditor'
import ArticlesPageEditor from './ArticlesPageEditor'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import api from '../../api/client'
import { uploadImageFile } from '../../lib/uploadImageFile'
import { notifyContentSaved, onContentUpdated } from '../../lib/contentSync'
import toast from 'react-hot-toast'
import { resolvePreviewImageUrl } from './builder/previewAssets'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocaleCell {
  id?: number
  value: string | null
}

interface BlockRow {
  key: string
  type: 'text' | 'image' | 'json'
  label: string | null
  sort_order?: number
  locales: Record<string, LocaleCell>
}

interface SectionGroup {
  name: string
  title?: string
  pattern?: string | null
  blocks: BlockRow[]
}

interface MatrixResponse {
  page: string
  page_meta?: CmsPage & { meta_title?: string; meta_description?: string }
  pages: CmsPage[] | string[]
  sections: SectionGroup[]
}

interface PendingChange {
  page: string
  section: string
  key: string
  locale: string
  type: 'text' | 'image' | 'json'
  value: string
  label?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TEXT_LOCALES = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ar', flag: '🇹🇳', name: 'العربية' },
] as const

const SECTION_LABELS: Record<string, string> = {
  custom: 'Contenu de la page',
  hero: 'Bannière',
  about: 'Qui sommes-nous',
  mission: 'Histoire & Mission',
  values: 'Nos objectifs',
  diversify: 'Diversification',
  join: 'Appel à adhésion',
  intro: 'Introduction',
  benefits: 'Avantages',
  adherer: 'Pourquoi adhérer',
  info: 'Informations de contact',
  positioning: 'Positionnement',
  challenges: 'Défis',
  enjeux: 'Enjeux stratégiques',
  proposals: 'Propositions',
  form: 'Formulaire',
  discover: 'Découvrir',
  stats: 'Chiffres clés',
  board: 'Composition actuelle',
  headquarters: 'Bureau du siège',
  regional: 'Bureaux régionaux',
  article: 'Bannière page article',
  grid: 'Articles — liste & structure',
  objectifs: 'Nos objectifs',
  groupements: 'Groupements professionnels',
  actualites: 'Actualités',
  cta: 'Appel à l’action',
  footer: 'Pied de page',
  header: 'En-tête',
  settings: 'Paramètres du site',
  coords: 'Coordonnées',
  types: 'Typologies',
  growth: 'Croissance',
  diag: 'Diagnostic',
  atouts: 'Atouts',
  artisan: 'Artisanat',
  quote: 'Citation',
  roadmap: 'Feuille de route',
  pillars: 'Piliers',
  split: 'Présentation',
  diagnostic: 'Diagnostic',
  defis: 'Défis',
  plan: 'Plan de relance',
}

function sectionDisplayName(sec: SectionGroup) {
  return sec.title ?? SECTION_LABELS[sec.name] ?? sec.name.charAt(0).toUpperCase() + sec.name.slice(1)
}

function changeId(c: PendingChange) {
  return `${c.section}.${c.key}.${c.locale}`
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WebsiteContentPage() {
  const qc = useQueryClient()
  const [activePage, setActivePage] = useState('home')
  const [search, setSearch] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [changes, setChanges] = useState<Record<string, PendingChange>>({})
  const [viewMode, setViewMode] = useState<'builder' | 'list'>('builder')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [insertTarget, setInsertTarget] = useState<InsertTarget>(null)
  const [addPageModal, setAddPageModal] = useState(false)
  const [globalTab, setGlobalTab] = useState<'settings' | 'menu'>('settings')
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false)
  const [pageSettings, setPageSettings] = useState({
    status: 'published' as 'draft' | 'published',
    template: 'default',
    meta_title: '',
    meta_description: '',
  })

  const matrixPage = activePage === 'articles' ? 'actualites' : activePage

  const { data, isLoading, dataUpdatedAt } = useQuery<MatrixResponse>({
    queryKey: ['content-matrix', matrixPage],
    queryFn: () => api.get('/admin/content/matrix', { params: { page: matrixPage } }).then(r => r.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Sync with website edit mode (focus + polling — apps run on different ports)
  useEffect(() => {
    const refresh = (notify = false) => {
      qc.invalidateQueries({ queryKey: ['content-matrix', matrixPage] })
      if (notify) toast.success('Contenu mis à jour depuis le site', { id: 'wc-sync' })
    }
    const unsub = onContentUpdated((msg) => {
      if (msg.source === 'dashboard') return
      if (msg.page === matrixPage || msg.page === 'actualites' || msg.page === 'home') refresh(true)
    })
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') refresh(false)
    }, 12000)
    return () => {
      unsub()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      clearInterval(poll)
    }
  }, [matrixPage, qc])

  const cmsPages: CmsPage[] = useMemo(() => {
    const raw = data?.pages ?? []
    let pages: CmsPage[]
    if (raw.length && typeof raw[0] === 'object') {
      pages = [...(raw as CmsPage[])]
    } else {
      pages = (raw as string[]).map(slug => ({
        slug,
        title: slug === 'home' ? "Page d'accueil" : slug === 'global' ? 'Global' : slug,
        status: 'published' as const,
        template: slug === 'home' ? 'home' as const : 'default' as const,
        is_system: slug === 'home' || slug === 'global',
        sort_order: 0,
      }))
    }
    // Virtual system page — articles share one standard structure (like Global).
    if (!pages.some(p => p.slug === 'articles')) {
      const afterActualites = pages.findIndex(p => p.slug === 'actualites')
      const entry: CmsPage = {
        slug: 'articles',
        title: 'Articles',
        status: 'published',
        template: 'global',
        is_system: true,
        sort_order: (pages.find(p => p.slug === 'actualites')?.sort_order ?? 50) + 1,
      }
      if (afterActualites >= 0) pages.splice(afterActualites + 1, 0, entry)
      else pages.push(entry)
    }
    return pages
  }, [data?.pages])

  const activePageMeta =
    activePage === 'articles'
      ? {
          slug: 'articles',
          title: 'Articles',
          status: 'published' as const,
          template: 'global' as const,
          is_system: true,
          sort_order: 0,
        }
      : (data?.page_meta ?? cmsPages.find(p => p.slug === activePage))

  const articlePendingByLocale = useMemo(() => {
    const out: Partial<Record<'fr' | 'en' | 'ar', string>> = {}
    for (const loc of ['fr', 'en', 'ar'] as const) {
      const id = `grid.items.${loc}`
      if (changes[id]?.page === 'actualites') out[loc] = changes[id].value
    }
    return out
  }, [changes])
  const sections = data?.sections ?? []

  useEffect(() => {
    if (data?.page_meta) {
      setPageSettings({
        status: data.page_meta.status ?? 'published',
        template: data.page_meta.template ?? 'default',
        meta_title: data.page_meta.meta_title ?? '',
        meta_description: data.page_meta.meta_description ?? '',
      })
    }
  }, [data?.page_meta])

  const effectiveValue = (section: string, block: BlockRow, locale: string): string => {
    const id = `${section}.${block.key}.${locale}`
    if (changes[id]) return changes[id].value
    return block.locales[locale]?.value ?? ''
  }

  const effectiveLabel = (section: string, block: BlockRow): string => {
    for (const c of Object.values(changes)) {
      if (c.section === section && c.key === block.key && c.label !== undefined) {
        return c.label
      }
    }
    return block.label ?? ''
  }

  const setChange = (change: PendingChange) => {
    setChanges(prev => {
      const id = changeId(change)
      const next = { ...prev, [id]: change }
      return next
    })
  }

  const setLabelChange = (section: string, block: BlockRow, label: string) => {
    const locales = block.type === 'text' ? TEXT_LOCALES.map(l => l.code) : ['_all']
    for (const loc of locales) {
      const existing = block.locales[loc]
      const value = changes[`${section}.${block.key}.${loc}`]?.value
        ?? existing?.value
        ?? ''
      setChange({
        page: activePage,
        section,
        key: block.key,
        locale: loc,
        type: block.type,
        value,
        label,
      })
    }
  }

  const setValueChange = (section: string, block: BlockRow, locale: string, value: string) => {
    setChange({
      page: activePage,
      section,
      key: block.key,
      locale,
      type: block.type,
      value,
      label: effectiveLabel(section, block) || block.label || undefined,
    })
  }

  const changeCount = Object.keys(changes).length

  const saveM = useMutation({
    mutationFn: () => api.post('/admin/content/bulk', { blocks: Object.values(changes) }),
    onSuccess: () => {
      setChanges({})
      qc.invalidateQueries({ queryKey: ['content-matrix', matrixPage] })
      qc.invalidateQueries({ queryKey: ['content-matrix', 'actualites'] })
      notifyContentSaved(activePage === 'articles' ? 'actualites' : activePage, 'dashboard')
      toast.success('Contenu du site enregistré')
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })

  const createPageM = useMutation({
    mutationFn: (payload: { title: string; slug: string; status: string; template: string; meta_title: string; meta_description: string }) =>
      api.post('/admin/content/pages', payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['content-matrix'] })
      setAddPageModal(false)
      setActivePage(res.data.slug)
      setViewMode('builder')
      setInsertTarget('__start__')
      setSelectedSection(null)
      setPageSettings({
        status: res.data.status ?? 'draft',
        template: res.data.template ?? 'default',
        meta_title: res.data.meta_title ?? '',
        meta_description: res.data.meta_description ?? '',
      })
      toast.success(res.data.status === 'published' ? 'Page publiée' : 'Page créée (brouillon)')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  const insertPatternM = useMutation({
    mutationFn: ({ pattern, insertAfter }: { pattern: string; insertAfter: InsertTarget }) =>
      api.post('/admin/content/insert-pattern', {
        page: activePage,
        pattern,
        insert_after: insertAfter ?? '__end__',
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['content-matrix', activePage] })
      notifyContentSaved(activePage, 'dashboard')
      setInsertTarget(null)
      setSelectedSection(res.data.section?.slug ?? null)
      toast.success('Composant ajouté — modifiez-le à droite')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  const deletePageM = useMutation({
    mutationFn: (slug: string) => api.delete(`/admin/content/pages/${slug}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-matrix'] })
      setActivePage('home')
      toast.success('Page supprimée')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Impossible de supprimer'),
  })

  const deleteSectionM = useMutation({
    mutationFn: (section: string) =>
      api.delete('/admin/content/sections', { data: { page: activePage, section } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-matrix', activePage] })
      notifyContentSaved(activePage, 'dashboard')
      toast.success('Section supprimée')
    },
    onError: () => toast.error('Impossible de supprimer'),
  })

  const updatePageM = useMutation({
    mutationFn: () => api.put(`/admin/content/pages/${activePage}`, pageSettings),
    onSuccess: (res) => {
      const updated = res.data
      setPageSettings({
        status: updated.status ?? 'draft',
        template: updated.template ?? 'default',
        meta_title: updated.meta_title ?? '',
        meta_description: updated.meta_description ?? '',
      })
      qc.invalidateQueries({ queryKey: ['content-matrix'] })
      notifyContentSaved(activePage, 'dashboard')
      toast.success(updated.status === 'published' ? 'Page publiée' : 'Paramètres enregistrés')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  })

  const deleteLocaleM = useMutation({
    mutationFn: (payload: { section: string; key: string; locale: string }) =>
      api.delete('/admin/content/block', { data: { page: activePage, ...payload } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content-matrix', activePage] })
      notifyContentSaved(activePage, 'dashboard')
      toast.success('Traduction supprimée')
    },
    onError: () => toast.error('Impossible de supprimer'),
  })

  const uploadImage = async (file: File, section: string, block: BlockRow) => {
    try {
      const res = await uploadImageFile(file, '/admin/content/upload-image')
      const payload = {
        page: activePage,
        section,
        key: block.key,
        locale: '_all',
        type: block.type,
        value: res.url,
        label: effectiveLabel(section, block) || block.label || undefined,
      }
      // File is already on disk — publish the new URL right away so the public
      // site picks it up without waiting for the page's Save button.
      await api.post('/admin/content/bulk', { blocks: [payload] })
      setChanges(prev => {
        const id = `${section}.${block.key}._all`
        const next = { ...prev }
        delete next[id]
        return next
      })
      qc.invalidateQueries({ queryKey: ['content-matrix', activePage] })
      notifyContentSaved(activePage, 'dashboard')
      toast.success('Image enregistrée')
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur lors du téléversement')
    }
  }

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections
    const q = search.toLowerCase()
    return sections
      .map(sec => ({
        ...sec,
        blocks: sec.blocks.filter(b =>
          b.key.toLowerCase().includes(q) ||
          (b.label ?? '').toLowerCase().includes(q) ||
          sectionDisplayName(sec).toLowerCase().includes(q) ||
          Object.values(b.locales).some(l => (l.value ?? '').toLowerCase().includes(q))
        ),
      }))
      .filter(sec => sec.blocks.length > 0)
  }, [sections, search])

  const toggleSection = (name: string) =>
    setOpenSections(p => ({ ...p, [name]: !p[name] }))

  const isSectionOpen = (name: string) => openSections[name] !== false

  return (
    <div className="wc-layout">
      <PageSidebar
        pages={cmsPages}
        activeSlug={activePage}
        onSelect={slug => {
          setActivePage(slug)
          setChanges({})
          setSelectedSection(null)
          setInsertTarget(null)
          if (slug === 'global') setViewMode('list')
          else setViewMode('builder')
        }}
        onAddPage={() => setAddPageModal(true)}
        onDeletePage={page => {
          if (confirm(`Supprimer la page « ${page.title} » et tout son contenu ?`)) {
            deletePageM.mutate(page.slug)
          }
        }}
      />

      <div className="wc-main">
      {/* Header */}
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><LayoutTemplate size={18} /></div>
          <div>
            <p className="gc-page-header-title">{activePageMeta?.title ?? 'Contenu du site'}</p>
            <p className="gc-page-header-sub">
              {activePage === 'articles'
                ? 'Pages articles — structure standard (Bannière · Carte · En-tête · Corps · Source)'
                : (
                  <>
                    /{activePage}
                    {activePageMeta?.status === 'draft' && <span className="wc-draft-badge"> Brouillon</span>}
                    {dataUpdatedAt > 0 && (
                      <span className="wc-sync-hint"> — synchronisé avec le mode édition</span>
                    )}
                  </>
                )}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {changeCount > 0 && (
            <Button variant="secondary" icon={<X size={13} />} onClick={() => setChanges({})}>
              Annuler ({changeCount})
            </Button>
          )}
          <Button
            icon={<Save size={14} />}
            loading={saveM.isPending}
            disabled={changeCount === 0}
            onClick={() => saveM.mutate()}
          >
            Enregistrer {changeCount > 0 ? `(${changeCount})` : ''}
          </Button>
          {activePage !== 'articles' && (
            <Button variant="secondary" onClick={() => setPageSettingsOpen(o => !o)}>
              Paramètres
            </Button>
          )}
          {activePage !== 'articles' && activePage !== 'global' && (
            <div className="wc-view-toggle">
              <button type="button" className={viewMode === 'builder' ? 'active' : ''} onClick={() => setViewMode('builder')}>
                <LayoutGrid size={14} /> Éditeur visuel
              </button>
              <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                <List size={14} /> Liste
              </button>
            </div>
          )}
        </div>
      </div>

      {pageSettingsOpen && activePageMeta && (
        <div className="wc-page-settings">
          <h4>Paramètres de la page</h4>
          <p className="wc-page-settings-help">
            <strong>Statut</strong> — <em>Brouillon</em> : page visible seulement pour les admins connectés.
            <em> Publié</em> : visible sur le site public.
            <br />
            <strong>Modèle</strong> — classement CMS uniquement (accueil / landing / standard / global). Ne change pas le design de la page.
            <br />
            <strong>SEO</strong> — titre et description pour Google et les partages sociaux.
            <br />
            <br />
            Pour <strong>Contact</strong>, <strong>Newsletter</strong> et <strong>Demande d’adhésion</strong> :
            allez dans la page <em>Global</em> → onglet <em>Formulaires</em> pour définir les e-mails de réception.
          </p>
          <div className="wc-page-settings-grid">
            <div>
              <label className="gc-label">Statut</label>
              <select className="gc-select" value={pageSettings.status} onChange={e => setPageSettings(p => ({ ...p, status: e.target.value as 'draft' | 'published' }))}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <div>
              <label className="gc-label">Modèle</label>
              <select className="gc-select" value={pageSettings.template} onChange={e => setPageSettings(p => ({ ...p, template: e.target.value }))}>
                <option value="default">Page standard — contenu classique</option>
                <option value="landing">Landing page — page de conversion</option>
                <option value="home">Page d&apos;accueil — accueil du site</option>
                <option value="global">Global — réglages partagés (header/footer)</option>
              </select>
            </div>
            <Input label="Titre SEO" value={pageSettings.meta_title} onChange={e => setPageSettings(p => ({ ...p, meta_title: e.target.value }))} placeholder="Titre dans l’onglet / Google" />
            <div>
              <label className="gc-label">Description SEO</label>
              <textarea
                className="gc-textarea"
                rows={3}
                value={pageSettings.meta_description}
                onChange={e => setPageSettings(p => ({ ...p, meta_description: e.target.value }))}
                placeholder="Courte description (≈ 150–160 caractères) pour les résultats de recherche"
              />
            </div>
          </div>
          <Button size="sm" loading={updatePageM.isPending} onClick={() => updatePageM.mutate()}>Enregistrer les paramètres</Button>
        </div>
      )}

      {changeCount > 0 && (
        <div className="tr-changes-bar">
          <Save size={13} />
          {changeCount} modification{changeCount !== 1 ? 's' : ''} non sauvegardée{changeCount !== 1 ? 's' : ''}.
        </div>
      )}

      {activePage === 'global' && (
        <>
          <div className="global-page-tabs">
            <button
              type="button"
              className={globalTab === 'settings' ? 'active' : ''}
              onClick={() => setGlobalTab('settings')}
            >
              Paramètres du site
            </button>
            <button
              type="button"
              className={globalTab === 'menu' ? 'active' : ''}
              onClick={() => setGlobalTab('menu')}
            >
              Menu du site
            </button>
          </div>
          {globalTab === 'settings' && <SiteSettingsEditor />}
          {globalTab === 'menu' && <SiteMenuEditor />}
        </>
      )}

      {activePage === 'articles' && (
        <ArticlesPageEditor
          preferredLocale="fr"
          pendingByLocale={articlePendingByLocale}
          onItemsChange={(locale, json) => {
            setChange({
              page: 'actualites',
              section: 'grid',
              key: 'items',
              locale,
              type: 'json',
              value: json,
              label: 'Actualités — Cartes',
            })
          }}
        />
      )}

      {isLoading && viewMode === 'builder' && activePage !== 'global' && activePage !== 'articles' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {!isLoading && viewMode === 'builder' && activePage !== 'global' && activePage !== 'articles' && (
        <PageBuilder
          pageSlug={activePage}
          pageTitle={activePageMeta?.title ?? activePage}
          sections={sections}
          selectedSection={selectedSection}
          insertTarget={insertTarget}
          insertLoading={insertPatternM.isPending}
          changes={changes}
          onSelectSection={setSelectedSection}
          onSetInsertTarget={setInsertTarget}
          onInsertPattern={pattern => insertPatternM.mutate({ pattern, insertAfter: insertTarget })}
          onDeleteSection={slug => {
            if (confirm('Supprimer cette section ?')) {
              deleteSectionM.mutate(slug)
              setSelectedSection(null)
            }
          }}
          effectiveValue={effectiveValue}
          effectiveLabel={effectiveLabel}
          setLabelChange={setLabelChange}
          setValueChange={setValueChange}
          onDeleteLocale={(section, key, locale) => deleteLocaleM.mutate({ section, key, locale })}
          onUploadImage={(section, block, file) => uploadImage(file, section, block)}
          onEmbedEdit={(edit) => {
            setChange({
              page: edit.page,
              section: edit.section,
              key: edit.key,
              locale: edit.locale,
              type: edit.type,
              value: edit.value,
              label: edit.label,
            })
          }}
          onEmbedSaved={(page) => {
            // Aperçu « Sauvegarder » already wrote to the API — drop mirrored
            // drafts so the admin Enregistrer button does not stay dirty.
            setChanges((prev) => {
              const next = { ...prev }
              for (const id of Object.keys(next)) {
                if (next[id].page === page) delete next[id]
              }
              return next
            })
            qc.invalidateQueries({ queryKey: ['content-matrix', page] })
            toast.success('Aperçu enregistré — contenu synchronisé', { id: 'embed-saved' })
          }}
        />
      )}

      {viewMode === 'list' && activePage !== 'global' && activePage !== 'articles' && (
      <>
      <div className="wc-toolbar">
        <div style={{ flex: 1, maxWidth: 360 }}>
          <Input
            placeholder="Rechercher une section, un titre ou un texte…"
            icon={<Search size={13} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {!isLoading && filteredSections.length === 0 && (
        <div className="wc-empty">
          <LayoutTemplate size={32} />
          <p>Aucun contenu pour cette page.</p>
          <Button icon={<Plus size={14} />} onClick={() => { setViewMode('builder'); setInsertTarget('__start__') }}>
            Ouvrir l'éditeur visuel
          </Button>
        </div>
      )}

      {!isLoading && (
        <div className="wc-sections">
          {filteredSections.map(sec => {
            const open = isSectionOpen(sec.name)
            const blockCount = sec.blocks.length

            return (
              <div key={sec.name} className="wc-section">
                <div className="wc-section-header-row">
                  <button type="button" className="wc-section-header" onClick={() => toggleSection(sec.name)}>
                    {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="wc-section-title">{sectionDisplayName(sec)}</span>
                    {sec.pattern && <span className="wc-section-pattern">{sec.pattern}</span>}
                    <span className="wc-section-count">{blockCount} bloc{blockCount !== 1 ? 's' : ''}</span>
                  </button>
                  <button
                    type="button"
                    className="wc-section-delete"
                    title="Supprimer cette section"
                    onClick={() => {
                      if (confirm(`Supprimer la section « ${sectionDisplayName(sec)} » ?`)) {
                        deleteSectionM.mutate(sec.name)
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {open && (
                  <div className="wc-blocks">
                    {sec.blocks.map(block => (
                      <div key={`${sec.name}.${block.key}`} className="wc-block">
                        {/* Block header: editable title + meta */}
                        <div className="wc-block-head">
                          <div className="wc-block-head-left">
                            <span className={`wc-type-badge wc-type-${block.type}`}>
                              {block.type === 'text' && <Type size={11} />}
                              {block.type === 'image' && <ImageIcon size={11} />}
                              {block.type === 'json' && <Layers size={11} />}
                              {block.type === 'json' ? 'liste' : block.type}
                            </span>
                            <code className="wc-block-key">{block.key}</code>
                          </div>
                          <input
                            className="wc-block-label"
                            value={effectiveLabel(sec.name, block)}
                            placeholder="Titre du bloc (ex: Hero — Titre principal)"
                            onChange={e => setLabelChange(sec.name, block, e.target.value)}
                          />
                        </div>

                        {/* Text: FR / EN / AR columns */}
                        {block.type === 'text' && (
                          <div className="wc-locale-grid">
                            {TEXT_LOCALES.map(loc => {
                              const exists = !!block.locales[loc.code]
                              const val = effectiveValue(sec.name, block, loc.code)
                              const dirty = !!changes[`${sec.name}.${block.key}.${loc.code}`]
                              const frRef = block.locales['fr']?.value ?? ''

                              return (
                                <div key={loc.code} className={`wc-locale-cell${!exists ? ' missing' : ''}`}>
                                  <div className="wc-locale-head">
                                    <span>{loc.flag} {loc.name}</span>
                                    {exists && loc.code !== 'fr' && (
                                      <button
                                        type="button"
                                        className="wc-locale-delete"
                                        title="Supprimer cette traduction"
                                        onClick={() => {
                                          if (confirm(`Supprimer la traduction ${loc.name} ?`)) {
                                            deleteLocaleM.mutate({ section: sec.name, key: block.key, locale: loc.code })
                                          }
                                        }}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                    {!exists && <span className="wc-missing-tag">À ajouter</span>}
                                  </div>
                                  <textarea
                                    className={`wc-locale-input${dirty ? ' dirty' : ''}${!exists ? ' new' : ''}`}
                                    rows={3}
                                    value={val}
                                    placeholder={frRef || `Traduction ${loc.code}…`}
                                    dir={loc.code === 'ar' ? 'rtl' : 'ltr'}
                                    onChange={e => setValueChange(sec.name, block, loc.code, e.target.value)}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Image */}
                        {block.type === 'image' && (
                          <div className="wc-image-row">
                            <div className="wc-image-preview">
                              {effectiveValue(sec.name, block, '_all') ? (
                                <img src={resolvePreviewImageUrl(effectiveValue(sec.name, block, '_all'))} alt="" />
                              ) : (
                                <div className="wc-image-placeholder"><ImageIcon size={24} /></div>
                              )}
                            </div>
                            <div className="wc-image-fields">
                              <input
                                className="wc-locale-input"
                                value={effectiveValue(sec.name, block, '_all')}
                                placeholder="URL de l'image ou téléversez…"
                                onChange={e => setValueChange(sec.name, block, '_all', e.target.value)}
                              />
                              <label className="wc-upload-btn">
                                <Upload size={13} />
                                Téléverser
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) uploadImage(file, sec.name, block)
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Listes (cartes, photos, avis…) + pages Figma (custom.page) */}
                        {block.type === 'json' && (
                          <LocalizedJsonEditor
                            section={sec.name}
                            block={block}
                            valueFor={(locale) => effectiveValue(sec.name, block, locale)}
                            onChange={(locale, v) => setValueChange(sec.name, block, locale, v)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      </>
      )}

      <AddPageModal
        open={addPageModal}
        onClose={() => setAddPageModal(false)}
        loading={createPageM.isPending}
        onSubmit={data => createPageM.mutate(data)}
      />

      </div>
    </div>
  )
}
