import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ChevronRight, ExternalLink, LayoutGrid, Newspaper, Plus, Trash2, Upload,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/client'
import { uploadImageFile } from '../../lib/uploadImageFile'
import { resolvePreviewImageUrl } from './builder/previewAssets'

export type ArticleItem = {
  slug: string
  title: string
  desc: string
  date: string
  img: string
  hero_title?: string
  subtitle?: string
  quote?: string
  intro?: string
  sections?: Array<{ question: string; answer: string }>
  source?: string
}

/** Standard page structure — same components for every article (like Global sections). */
export const ARTICLE_PAGE_SECTIONS = [
  { name: 'hero', title: 'Bannière', pattern: 'hero', summary: 'Titre hero de la page article' },
  { name: 'card', title: 'Carte (liste Actualités)', pattern: 'cards_grid', summary: 'Titre, extrait, date, slug, image' },
  { name: 'header', title: 'En-tête article', pattern: 'text', summary: 'Titre, sous-titre, citation, intro' },
  { name: 'body', title: 'Corps / questions-réponses', pattern: 'text', summary: 'Texte simple ou Q&R' },
  { name: 'source', title: 'Source', pattern: 'text', summary: 'Crédit / source en bas de page' },
] as const

export type ArticleSectionName = (typeof ARTICLE_PAGE_SECTIONS)[number]['name']

const LOCALES = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ar', flag: '🇹🇳', name: 'العربية' },
] as const

type LocaleCode = 'fr' | 'en' | 'ar'

function parseArticles(raw: string | null | undefined): ArticleItem[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ArticleItem[]) : []
  } catch {
    return []
  }
}

function emptyArticle(): ArticleItem {
  const stamp = Date.now()
  return {
    slug: `nouvel-article-${stamp}`,
    title: 'Nouvel article',
    desc: 'Résumé de l’article…',
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    img: '/images/act1.png?v=6',
    hero_title: 'Nouvel article',
    subtitle: '',
    quote: '',
    intro: 'Introduction de l’article…',
    sections: [
      { question: 'Question 1', answer: 'Réponse…' },
      { question: 'Question 2', answer: 'Réponse…' },
    ],
    source: 'Source : Fi2T',
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="wc-field">
      <label className="wc-field-label">{label}</label>
      {children}
    </div>
  )
}

type Props = {
  /** Called when locale JSON for grid.items changes — wires into bulk save. */
  onItemsChange: (locale: LocaleCode, json: string) => void
  /** Pending values override API (dirty drafts). */
  pendingByLocale: Partial<Record<LocaleCode, string>>
  preferredLocale?: LocaleCode
}

/**
 * System page “Articles” — same idea as Global:
 * pick an article, then edit its standard Structure de la page components.
 */
export default function ArticlesPageEditor({
  onItemsChange,
  pendingByLocale,
  preferredLocale = 'fr',
}: Props) {
  const [locale, setLocale] = useState<LocaleCode>(preferredLocale)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<ArticleSectionName | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setLocale(preferredLocale)
  }, [preferredLocale])

  const { data, isLoading } = useQuery({
    queryKey: ['content-matrix', 'actualites'],
    queryFn: () => api.get('/admin/content/matrix', { params: { page: 'actualites' } }).then((r) => r.data),
    staleTime: 0,
  })

  const apiItemsByLocale = useMemo(() => {
    const result: Record<LocaleCode, ArticleItem[]> = { fr: [], en: [], ar: [] }
    const grid = (data?.sections ?? []).find((s: { name: string }) => s.name === 'grid')
    const block = grid?.blocks?.find((b: { key: string }) => b.key === 'items')
    for (const loc of LOCALES) {
      const raw = block?.locales?.[loc.code]?.value ?? '[]'
      result[loc.code] = parseArticles(raw)
    }
    return result
  }, [data])

  const itemsByLocale = useMemo(() => {
    const next = { ...apiItemsByLocale }
    for (const loc of LOCALES) {
      if (pendingByLocale[loc.code]) {
        next[loc.code] = parseArticles(pendingByLocale[loc.code])
      }
    }
    return next
  }, [apiItemsByLocale, pendingByLocale])

  const items = itemsByLocale[locale]
  const article = items.find((a) => a.slug === selectedSlug) ?? null
  const articleIndex = article ? items.findIndex((a) => a.slug === selectedSlug) : -1

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      (item.title ?? '').toLowerCase().includes(q)
      || (item.slug ?? '').toLowerCase().includes(q)
    )
  })

  const commit = (nextItems: ArticleItem[]) => {
    onItemsChange(locale, JSON.stringify(nextItems))
  }

  const patchSelected = (patch: Partial<ArticleItem>) => {
    if (articleIndex < 0) return
    commit(items.map((item, i) => (i === articleIndex ? { ...item, ...patch } : item)))
  }

  const siteBase = import.meta.env.VITE_WEBSITE_ORIGIN ?? 'http://127.0.0.1:3002'

  const upload = async (file: File) => {
    try {
      const data = await uploadImageFile(file, '/admin/content/upload-image')
      const url = data.url
      if (articleIndex < 0 || !selectedSlug) return
      // Same image on FR/EN/AR — only text stays per locale.
      for (const loc of LOCALES) {
        const list = itemsByLocale[loc.code]
        const next = list.map((item) =>
          item.slug === selectedSlug ? { ...item, img: url } : item,
        )
        onItemsChange(loc.code, JSON.stringify(next))
      }
      toast.success('Image enregistrée pour FR / EN / AR')
    } catch {
      toast.error('Erreur lors du téléversement')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div className="gc-spinner" />
      </div>
    )
  }

  /* ── List of articles (entry) ─────────────────────────────────────────── */
  if (!article) {
    return (
      <div className="articles-cms">
        <div className="articles-cms__intro">
          <Newspaper size={18} />
          <div>
            <h2>Articles</h2>
            <p>
              Chaque article est une page standard avec les mêmes composants
              (Bannière, Carte, En-tête, Corps, Source) — comme Global pour les réglages partagés.
            </p>
          </div>
        </div>

        <div className="articles-cms__locale-tabs">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              className={`wc-localized-json__tab${locale === loc.code ? ' is-active' : ''}`}
              onClick={() => setLocale(loc.code)}
            >
              {loc.flag} {loc.code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="articles-cms__toolbar">
          <input
            className="wc-field-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
          />
          <span className="wc-article-studio__count">{items.length}</span>
        </div>

        <div className="articles-cms__list">
          {filtered.map((item) => (
            <button
              key={item.slug}
              type="button"
              className="articles-cms__row"
              onClick={() => {
                setSelectedSlug(item.slug)
                setSelectedSection(null)
              }}
            >
              <span className="wc-article-studio__thumb">
                {item.img ? <img src={resolvePreviewImageUrl(item.img)} alt="" /> : null}
              </span>
              <span className="wc-article-studio__meta">
                <span className="wc-article-studio__title">{item.title || 'Sans titre'}</span>
                <span className="wc-article-studio__slug">/{item.slug}</span>
              </span>
              <ChevronRight size={16} className="wc-article-page__chevron" />
            </button>
          ))}
          {!filtered.length && <p className="wc-article-studio__empty">Aucun article.</p>}
        </div>

        <button
          type="button"
          className="wc-add-item-btn"
          onClick={() => {
            const created = emptyArticle()
            commit([created, ...items])
            setSelectedSlug(created.slug)
            setSelectedSection('hero')
          }}
        >
          <Plus size={14} /> Nouvel article
        </button>
      </div>
    )
  }

  const sectionMeta = ARTICLE_PAGE_SECTIONS.find((s) => s.name === selectedSection)

  /* ── Article opened: Structure de la page + editor ────────────────────── */
  return (
    <div className="articles-cms articles-cms--builder">
      <div className="articles-cms__top">
        <button
          type="button"
          className="wc-article-page__back"
          onClick={() => {
            setSelectedSlug(null)
            setSelectedSection(null)
          }}
        >
          <ArrowLeft size={14} /> Tous les articles
        </button>
        <div className="articles-cms__locale-tabs">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              className={`wc-localized-json__tab${locale === loc.code ? ' is-active' : ''}`}
              onClick={() => setLocale(loc.code)}
            >
              {loc.flag} {loc.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-layout pb-layout--split articles-cms__layout">
        <div className="pb-canvas-column">
          <div className="pb-canvas-header">
            <div className="pb-canvas-header__left">
              <span><LayoutGrid size={14} /> Structure de la page</span>
            </div>
          </div>
          <div className="pb-canvas articles-cms__canvas">
            <div className="articles-cms__page-meta">
              <div className="articles-cms__page-kicker">Page article</div>
              <h2>{article.title || 'Sans titre'}</h2>
              <p>/{article.slug}</p>
              <a
                href={`${siteBase}/actualites/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="wc-article-studio__preview-link"
              >
                <ExternalLink size={12} /> Voir sur le site
              </a>
            </div>

            {ARTICLE_PAGE_SECTIONS.map((sec) => (
              <div key={sec.name} className="pb-section-wrap">
                <button
                  type="button"
                  className={`pb-section${selectedSection === sec.name ? ' pb-section--selected' : ''}`}
                  onClick={() => setSelectedSection(sec.name)}
                >
                  <div className="pb-section__toolbar">
                    <span className="pb-section__type">{sec.pattern}</span>
                    <span className="pb-section__name">{sec.title}</span>
                    <span className="pb-section__edit">Éditer →</span>
                  </div>
                  <div className="articles-cms__section-preview">
                    {sec.name === 'hero' && (
                      <strong>{article.hero_title || article.title || '—'}</strong>
                    )}
                    {sec.name === 'card' && (
                      <>
                        <strong>{article.title || '—'}</strong>
                        <span>{article.desc?.slice(0, 90) || '—'}</span>
                      </>
                    )}
                    {sec.name === 'header' && (
                      <>
                        <strong>{article.title || '—'}</strong>
                        <span>{article.subtitle || article.intro?.slice(0, 80) || '—'}</span>
                      </>
                    )}
                    {sec.name === 'body' && (
                      <span>
                        {article.sections?.length
                          ? `${article.sections.length} question(s) / réponse(s)`
                          : (article.desc?.slice(0, 100) || 'Corps simple')}
                      </span>
                    )}
                    {sec.name === 'source' && <span>{article.source || '—'}</span>}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-side-column">
          {selectedSection && sectionMeta ? (
            <aside className="pb-editor">
              <div className="pb-editor__head">
                <button type="button" className="pb-editor__back" onClick={() => setSelectedSection(null)}>
                  <ArrowLeft size={14} /> Structure
                </button>
                <h3>{sectionMeta.title}</h3>
                <button
                  type="button"
                  className="pb-editor__delete"
                  title="Supprimer l’article"
                  onClick={() => {
                    if (!confirm(`Supprimer l’article « ${article.title} » ?`)) return
                    commit(items.filter((a) => a.slug !== article.slug))
                    setSelectedSlug(null)
                    setSelectedSection(null)
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="pb-editor__scroll">
                <p className="wc-list-hint">{sectionMeta.summary}</p>

                {selectedSection === 'hero' && (
                  <Field label="Titre hero">
                    <textarea
                      className="wc-field-input"
                      rows={3}
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      value={article.hero_title ?? article.title ?? ''}
                      onChange={(e) => patchSelected({ hero_title: e.target.value })}
                    />
                  </Field>
                )}

                {selectedSection === 'card' && (
                  <>
                    <Field label="Titre">
                      <input
                        className="wc-field-input"
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.title ?? ''}
                        onChange={(e) => patchSelected({ title: e.target.value })}
                      />
                    </Field>
                    <Field label="Extrait">
                      <textarea
                        className="wc-field-input"
                        rows={3}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.desc ?? ''}
                        onChange={(e) => patchSelected({ desc: e.target.value })}
                      />
                    </Field>
                    <Field label="Date">
                      <input
                        className="wc-field-input"
                        value={article.date ?? ''}
                        onChange={(e) => patchSelected({ date: e.target.value })}
                      />
                    </Field>
                    <Field label="Slug (URL)">
                      <input
                        className="wc-field-input"
                        value={article.slug ?? ''}
                        onChange={(e) => patchSelected({ slug: e.target.value })}
                      />
                    </Field>
                    <Field label="Image">
                      <div className="wc-card-image-row">
                        <div className="wc-card-image-preview">
                          {article.img
                            ? <img src={resolvePreviewImageUrl(article.img)} alt="" />
                            : <span>Aucune</span>}
                        </div>
                        <div className="wc-card-image-actions">
                          <input
                            className="wc-field-input"
                            value={article.img ?? ''}
                            onChange={(e) => patchSelected({ img: e.target.value })}
                          />
                          <label className="wc-upload-btn">
                            <Upload size={13} /> Choisir
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (f) void upload(f)
                                e.target.value = ''
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </Field>
                  </>
                )}

                {selectedSection === 'header' && (
                  <>
                    <Field label="Titre">
                      <input
                        className="wc-field-input"
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.title ?? ''}
                        onChange={(e) => patchSelected({ title: e.target.value })}
                      />
                    </Field>
                    <Field label="Sous-titre">
                      <input
                        className="wc-field-input"
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.subtitle ?? ''}
                        onChange={(e) => patchSelected({ subtitle: e.target.value })}
                      />
                    </Field>
                    <Field label="Citation">
                      <textarea
                        className="wc-field-input"
                        rows={3}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.quote ?? ''}
                        onChange={(e) => patchSelected({ quote: e.target.value })}
                      />
                    </Field>
                    <Field label="Introduction">
                      <textarea
                        className="wc-field-input"
                        rows={5}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={article.intro ?? ''}
                        onChange={(e) => patchSelected({ intro: e.target.value })}
                      />
                    </Field>
                  </>
                )}

                {selectedSection === 'body' && (
                  <>
                    <p className="wc-list-hint">
                      Avec questions → accordéon Q&R. Sans → date + texte simple.
                    </p>
                    {(article.sections ?? []).map((qa, si) => (
                      <div key={si} className="wc-item-card">
                        <div className="wc-item-card-head">
                          <span className="wc-item-card-title">Question {si + 1}</span>
                          <button
                            type="button"
                            className="wc-item-remove"
                            onClick={() => {
                              patchSelected({
                                sections: (article.sections ?? []).filter((_, i) => i !== si),
                              })
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="wc-item-card-body">
                          <Field label="Question">
                            <input
                              className="wc-field-input"
                              dir={locale === 'ar' ? 'rtl' : 'ltr'}
                              value={qa.question}
                              onChange={(e) => {
                                const sections = [...(article.sections ?? [])]
                                sections[si] = { ...sections[si], question: e.target.value }
                                patchSelected({ sections })
                              }}
                            />
                          </Field>
                          <Field label="Réponse">
                            <textarea
                              className="wc-field-input"
                              rows={5}
                              dir={locale === 'ar' ? 'rtl' : 'ltr'}
                              value={qa.answer}
                              onChange={(e) => {
                                const sections = [...(article.sections ?? [])]
                                sections[si] = { ...sections[si], answer: e.target.value }
                                patchSelected({ sections })
                              }}
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="wc-add-item-btn"
                      onClick={() => {
                        patchSelected({
                          sections: [
                            ...(article.sections ?? []),
                            { question: 'Nouvelle question', answer: 'Réponse…' },
                          ],
                        })
                      }}
                    >
                      <Plus size={14} /> Ajouter une question
                    </button>
                    {!(article.sections?.length) && (
                      <>
                        <Field label="Date">
                          <input
                            className="wc-field-input"
                            value={article.date ?? ''}
                            onChange={(e) => patchSelected({ date: e.target.value })}
                          />
                        </Field>
                        <Field label="Texte">
                          <textarea
                            className="wc-field-input"
                            rows={5}
                            dir={locale === 'ar' ? 'rtl' : 'ltr'}
                            value={article.desc ?? ''}
                            onChange={(e) => patchSelected({ desc: e.target.value })}
                          />
                        </Field>
                      </>
                    )}
                  </>
                )}

                {selectedSection === 'source' && (
                  <Field label="Source">
                    <input
                      className="wc-field-input"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      value={article.source ?? ''}
                      onChange={(e) => patchSelected({ source: e.target.value })}
                    />
                  </Field>
                )}
              </div>
            </aside>
          ) : (
            <div className="pb-palette">
              <div className="pb-palette__head">
                <h3>Composants de la page</h3>
                <p className="pb-palette__hint">
                  Cliquez une section dans <strong>Structure de la page</strong> pour éditer
                  son contenu. Structure identique pour tous les articles.
                </p>
              </div>
              <div className="pb-palette__scroll">
                {ARTICLE_PAGE_SECTIONS.map((sec) => (
                  <button
                    key={sec.name}
                    type="button"
                    className="articles-cms__palette-item"
                    onClick={() => setSelectedSection(sec.name)}
                  >
                    <span>{sec.title}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
