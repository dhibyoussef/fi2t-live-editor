import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ExternalLink, Newspaper, Plus, Trash2, Upload } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../api/client'
import { uploadImageFile } from '../../lib/uploadImageFile'
import { resolvePreviewImageUrl } from './builder/previewAssets'

/** Keep /storage and /images paths valid even after RTL inputs reverse the slash. */
function normalizeMediaUrl(raw: string): string {
  let url = raw.trim()
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url
  url = url.replace(/\/+$/, '')
  if (url.endsWith('/')) url = url.slice(0, -1)
  if (!url.startsWith('/')) url = `/${url}`
  return url
}

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
    desc: 'Résumé affiché sur la carte Actualités…',
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    img: '/images/act1.png?v=6',
    hero_title: 'Nouvel article',
    subtitle: '',
    quote: '',
    intro: '',
    sections: [],
    source: '',
  }
}

function pickText(existing: string | undefined, fallback: string | undefined): string {
  const a = (existing ?? '').trim()
  return a || (fallback ?? '')
}

function alignSections(
  source: NonNullable<ArticleItem['sections']>,
  existing?: ArticleItem['sections'],
): NonNullable<ArticleItem['sections']> {
  return source.map((row, i) => ({
    question: pickText(existing?.[i]?.question, row.question),
    answer: pickText(existing?.[i]?.answer, row.answer),
  }))
}

function articleBySlug(list: ArticleItem[], slug: string): ArticleItem | undefined {
  return list.find((a) => a.slug === slug)
}

/** Same articles (slug, photo, date, structure) in every locale; keep translated text. */
function syncFromSource(
  sourceList: ArticleItem[],
  byLocale: Record<LocaleCode, ArticleItem[]>,
  sourceLocale: LocaleCode,
): Record<LocaleCode, ArticleItem[]> {
  const out: Record<LocaleCode, ArticleItem[]> = { fr: [], en: [], ar: [] }
  out[sourceLocale] = sourceList
  for (const loc of LOCALES) {
    if (loc.code === sourceLocale) continue
    const target = byLocale[loc.code]
    out[loc.code] = sourceList.map((src, index) => {
      const existing = articleBySlug(target, src.slug) ?? target[index]
      if (!existing) return { ...src }
      return {
        ...src,
        slug: src.slug,
        img: src.img,
        date: src.date,
        title: pickText(existing.title, src.title),
        hero_title: pickText(existing.hero_title, src.hero_title),
        subtitle: pickText(existing.subtitle, src.subtitle),
        quote: pickText(existing.quote, src.quote),
        intro: pickText(existing.intro, src.intro),
        desc: pickText(existing.desc, src.desc),
        source: pickText(existing.source, src.source),
        sections: alignSections(src.sections ?? [], existing.sections),
      }
    })
  }
  return out
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="wc-field">
      <label className="wc-field-label">{label}</label>
      {hint && <p className="article-form__hint">{hint}</p>}
      {children}
    </div>
  )
}

type ArticleBlock = {
  page: string
  section: string
  key: string
  locale: LocaleCode
  type: 'json'
  value: string
  label?: string
}

type Props = {
  onItemsChange: (locale: LocaleCode, json: string) => void
  onSourceLocale?: (locale: LocaleCode) => void
  onPersist?: (blocks: ArticleBlock[], sourceLocale: LocaleCode) => Promise<void>
  pendingByLocale: Partial<Record<LocaleCode, string>>
  preferredLocale?: LocaleCode
  selectedSlug?: string | null
  onSelectedSlugChange?: (slug: string | null) => void
  createNonce?: number
}

export default function ArticlesPageEditor({
  onItemsChange,
  onSourceLocale,
  onPersist,
  pendingByLocale,
  preferredLocale = 'fr',
  selectedSlug: controlledSlug,
  onSelectedSlugChange,
  createNonce = 0,
}: Props) {
  const { t } = useTranslation()
  const [locale, setLocale] = useState<LocaleCode>(preferredLocale)
  const [internalSlug, setInternalSlug] = useState<string | null>(null)
  const selectedSlug = controlledSlug !== undefined ? controlledSlug : internalSlug
  const setSelectedSlug = (slug: string | null) => {
    setInternalSlug(slug)
    onSelectedSlugChange?.(slug)
  }
  const [query, setQuery] = useState('')
  const lastCreate = useRef(0)

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
      result[loc.code] = parseArticles(block?.locales?.[loc.code]?.value ?? '[]')
    }
    return result
  }, [data])

  const itemsByLocale = useMemo(() => {
    const next = { ...apiItemsByLocale }
    for (const loc of LOCALES) {
      if (pendingByLocale[loc.code]) next[loc.code] = parseArticles(pendingByLocale[loc.code])
    }
    return next
  }, [apiItemsByLocale, pendingByLocale])

  const items = itemsByLocale[locale]

  const article = (selectedSlug
    ? items.find((a) => a.slug === selectedSlug)
      ?? itemsByLocale.fr.find((a) => a.slug === selectedSlug)
      ?? itemsByLocale.en.find((a) => a.slug === selectedSlug)
      ?? itemsByLocale.ar.find((a) => a.slug === selectedSlug)
    : null) ?? null
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (item.title ?? '').toLowerCase().includes(q) || (item.slug ?? '').toLowerCase().includes(q)
  })

  const applyAll = (sourceList: ArticleItem[], persist = false) => {
    onSourceLocale?.(locale)
    const synced = syncFromSource(sourceList, itemsByLocale, locale)
    const blocks: ArticleBlock[] = LOCALES.map((loc) => ({
      page: 'actualites',
      section: 'grid',
      key: 'items',
      locale: loc.code,
      type: 'json',
      value: JSON.stringify(synced[loc.code]),
      label: 'Articles',
    }))
    for (const block of blocks) onItemsChange(block.locale, block.value)
    return persist && onPersist ? onPersist(blocks, locale) : Promise.resolve()
  }

  const createArticle = () => {
    const created = emptyArticle()
    applyAll([created, ...items])
    setSelectedSlug(created.slug)
  }

  const switchLocale = (next: LocaleCode) => {
    if (next === locale) return
    if (article) applyAll(items)
    setLocale(next)
  }

  useEffect(() => {
    if (!createNonce || createNonce === lastCreate.current || isLoading) return
    lastCreate.current = createNonce
    const created = emptyArticle()
    applyAll([created, ...items])
    setSelectedSlug(created.slug)
  }, [createNonce, isLoading])

  const patchSelected = (patch: Partial<ArticleItem>) => {
    if (!article) return
    const currentList = items.some((a) => a.slug === article.slug)
      ? items
      : [article, ...items]
    const next = currentList.map((item) => (item.slug === article.slug ? { ...item, ...patch } : item))
    applyAll(next)
    if (patch.slug && patch.slug !== selectedSlug) setSelectedSlug(patch.slug)
  }

  const siteOrigin = (import.meta.env.VITE_WEBSITE_ORIGIN as string | undefined) ?? ''
  const siteBase = siteOrigin || `${window.location.origin}/fi2t`

  const upload = async (file: File) => {
    try {
      const uploaded = await uploadImageFile(file, '/admin/content/upload-image')
      if (!article) return
      const img = normalizeMediaUrl(uploaded.url)
      const currentList = items.some((a) => a.slug === article.slug) ? items : [article, ...items]
      const next = currentList.map((item) => (item.slug === article.slug ? { ...item, img } : item))
      await applyAll(next, true)
      toast.success(t('articles.img_saved'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors du téléversement')
    }
  }

  const LocaleTabs = () => (
    <div className="articles-cms__locale-wrap">
      <div className="articles-cms__locale-tabs">
        {LOCALES.map((loc) => (
          <button
            key={loc.code}
            type="button"
            className={`wc-localized-json__tab${locale === loc.code ? ' is-active' : ''}`}
            onClick={() => switchLocale(loc.code)}
          >
            {loc.flag} {loc.code.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="articles-cms__locale-hint">{t('articles.locale_hint')}</p>
    </div>
  )

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div className="gc-spinner" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="articles-cms">
        <LocaleTabs />
        <div className="articles-cms__toolbar">
          <input
            className="wc-field-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('articles.search')}
          />
          <span className="wc-article-studio__count">{items.length}</span>
        </div>
        <div className="articles-cms__list">
          {filtered.map((item) => (
            <button
              key={item.slug}
              type="button"
              className="articles-cms__row"
              onClick={() => setSelectedSlug(item.slug)}
            >
              <span className="wc-article-studio__thumb">
                {item.img ? <img src={resolvePreviewImageUrl(normalizeMediaUrl(item.img))} alt="" /> : <Newspaper size={18} />}
              </span>
              <span className="wc-article-studio__meta">
                <span className="wc-article-studio__title">{item.title || t('articles.untitled')}</span>
                <span className="wc-article-studio__slug">/{item.slug}</span>
              </span>
            </button>
          ))}
          {!filtered.length && <p className="wc-article-studio__empty">{t('articles.empty')}</p>}
        </div>
      </div>
    )
  }

  const qas = article.sections ?? []

  return (
    <div className="articles-cms">
      <div className="articles-cms__top">
        <button
          type="button"
          className="wc-article-page__back"
          onClick={() => setSelectedSlug(null)}
        >
          <ArrowLeft size={14} /> {t('articles.all')}
        </button>
        <LocaleTabs />
        <a
          href={`${siteBase.replace(/\/$/, '')}/actualites/${article.slug}`}
          target="_blank"
          rel="noreferrer"
          className="wc-article-studio__preview-link"
        >
          <ExternalLink size={12} /> {t('articles.view_site')}
        </a>
      </div>

      <div className="article-form">
        {locale === 'ar' && <p className="articles-cms__translate-banner">{t('articles.translate_ar')}</p>}
        {locale === 'en' && <p className="articles-cms__translate-banner">{t('articles.translate_en')}</p>}

        <section className="article-form__block">
          <h3>{t('articles.banner')}</h3>
          <p className="article-form__lead">{t('articles.banner_lead')}</p>
          <textarea
            className="wc-field-input article-form__hero"
            rows={3}
            dir={dir}
            value={article.hero_title ?? article.title ?? ''}
            onChange={(e) => patchSelected({ hero_title: e.target.value })}
            placeholder={t('articles.banner_ph')}
          />
        </section>

        <section className="article-form__block">
          <h3>{t('articles.photo')}</h3>
          <p className="article-form__lead">{t('articles.photo_lead')}</p>
          <div className="article-form__photo">
            <div className="article-form__photo-preview">
              {article.img
                ? <img
                    key={article.img}
                    src={resolvePreviewImageUrl(normalizeMediaUrl(article.img))}
                    alt=""
                  />
                : <span>{t('articles.no_image')}</span>}
            </div>
            <div className="article-form__photo-actions">
              <label className="wc-upload-btn">
                <Upload size={13} /> {t('articles.choose_image')}
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
              <input
                className="wc-field-input article-form__path"
                dir="ltr"
                value={normalizeMediaUrl(article.img ?? '')}
                onChange={(e) => patchSelected({ img: normalizeMediaUrl(e.target.value) })}
                placeholder="/images/…"
              />
            </div>
          </div>
        </section>

        <section className="article-form__block">
          <h3>{t('articles.header')}</h3>
          <p className="article-form__lead">{t('articles.header_lead')}</p>
          <Field label={t('articles.title')}>
            <input
              className="wc-field-input"
              dir={dir}
              value={article.title ?? ''}
              onChange={(e) => patchSelected({ title: e.target.value })}
            />
          </Field>
          <Field label={t('articles.subtitle')} hint={t('articles.optional')}>
            <input
              className="wc-field-input"
              dir={dir}
              value={article.subtitle ?? ''}
              onChange={(e) => patchSelected({ subtitle: e.target.value })}
            />
          </Field>
          <Field label={t('articles.quote')} hint={t('articles.optional_italic')}>
            <textarea
              className="wc-field-input"
              dir={dir}
              rows={3}
              value={article.quote ?? ''}
              onChange={(e) => patchSelected({ quote: e.target.value })}
            />
          </Field>
          <Field label={t('articles.intro')}>
            <textarea
              className="wc-field-input"
              dir={dir}
              rows={5}
              value={article.intro ?? ''}
              onChange={(e) => patchSelected({ intro: e.target.value })}
            />
          </Field>
        </section>

        <section className="article-form__block">
          <h3>{t('articles.body')}</h3>
          <p className="article-form__lead">{t('articles.body_lead')}</p>
          {qas.map((qa, si) => (
            <div key={si} className="wc-item-card">
              <div className="wc-item-card-head">
                <span className="wc-item-card-title">{t('articles.question')} {si + 1}</span>
                <button
                  type="button"
                  className="wc-item-remove"
                  onClick={() => patchSelected({ sections: qas.filter((_, i) => i !== si) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="wc-item-card-body">
                <Field label={t('articles.question')}>
                  <input
                    className="wc-field-input"
                    dir={dir}
                    value={qa.question}
                    onChange={(e) => {
                      const sections = [...qas]
                      sections[si] = { ...sections[si], question: e.target.value }
                      patchSelected({ sections })
                    }}
                  />
                </Field>
                <Field label={t('articles.answer')}>
                  <textarea
                    className="wc-field-input"
                    dir={dir}
                    rows={5}
                    value={qa.answer}
                    onChange={(e) => {
                      const sections = [...qas]
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
            onClick={() => patchSelected({
              sections: [...qas, { question: '', answer: '' }],
            })}
          >
            <Plus size={14} /> {t('articles.add_question')}
          </button>
        </section>

        <section className="article-form__block">
          <h3>{t('articles.source')}</h3>
          <input
            className="wc-field-input"
            dir={dir}
            value={article.source ?? ''}
            onChange={(e) => patchSelected({ source: e.target.value })}
            placeholder="Source : …"
          />
        </section>

        <section className="article-form__block article-form__block--card">
          <h3>{t('articles.card')}</h3>
          <p className="article-form__lead">{t('articles.card_lead')}</p>
          <Field label={t('articles.excerpt')}>
            <textarea
              className="wc-field-input"
              dir={dir}
              rows={3}
              value={article.desc ?? ''}
              onChange={(e) => patchSelected({ desc: e.target.value })}
            />
          </Field>
          <div className="article-form__row">
            <Field label={t('date')}>
              <input
                className="wc-field-input"
                dir="ltr"
                value={article.date ?? ''}
                onChange={(e) => patchSelected({ date: e.target.value })}
              />
            </Field>
            <Field label={t('articles.url')} hint={t('articles.url_hint')}>
              <input
                className="wc-field-input article-form__path"
                dir="ltr"
                value={article.slug ?? ''}
                onChange={(e) => patchSelected({ slug: e.target.value.replace(/^\//, '') })}
              />
            </Field>
          </div>
        </section>

        <button
          type="button"
          className="article-form__delete"
          onClick={() => {
            if (!confirm(t('articles.delete_confirm', { title: article.title || article.slug }))) return
            applyAll(items.filter((a) => a.slug !== article.slug))
            setSelectedSlug(null)
          }}
        >
          <Trash2 size={14} /> {t('articles.delete_this')}
        </button>
      </div>
    </div>
  )
}
