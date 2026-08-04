import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ContentProvider, useContent, useContentBlock } from '../cms/ContentProvider'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableArticleField from '../cms/EditableArticleField'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from '../cms/defaults/actualites'
import {
  findArticleBySlug,
  mergeArticleDetail,
  parseArticles,
  type ArticleItem,
} from '../lib/articles'

/** Figma Article.png reference slug — baked hero (photo + title + accent). */
const BAKED_HERO_SLUG = 'trois-questions-walid-tritar'

/** Collapse all whitespace into single spaces — Figma renders answers as continuous text. */
function flattenArticleText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function ArticleHero({ article }: { article: ArticleItem }) {
  const { isEditMode } = useEditMode()
  const bakeHero = !isEditMode && article.slug === BAKED_HERO_SLUG
  const heroFallback = article.hero_title || article.title
  const heroLines = heroFallback.split('\n').filter(Boolean)

  return (
    <section
      className={[
        'fi2t-page-hero',
        'fi2t-page-hero--article',
        bakeHero ? 'fi2t-page-hero--article-baked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {bakeHero ? (
        <img
          src="/images/article-hero-walid.jpg?v=2"
          alt=""
          className="fi2t-page-hero__bg fi2t-page-hero__bg--baked"
        />
      ) : (
        <>
          <EditableHeroBackground
            page="actualites"
            blockKey="article.banner"
            fallback="/images/article-banner.jpg?v=1"
            label="Bannière article"
          />
          <div className="fi2t-page-hero__overlay" />
        </>
      )}
      <div className="fi2t-page-hero__content">
        {bakeHero ? (
          /* Title is baked into the hero image — keep editable hook for CMS only */
          <h1 className="fi2t-page-hero__title fi2t-page-hero__title--article fi2t-page-hero__title--sr">
            {heroFallback}
          </h1>
        ) : isEditMode ? (
          <EditableArticleField
            slug={article.slug}
            field="hero_title"
            as="h1"
            className="fi2t-page-hero__title fi2t-page-hero__title--article"
            multiline
            label="Article — Titre hero"
            fallback={heroFallback}
          />
        ) : (
          <h1 className="fi2t-page-hero__title fi2t-page-hero__title--article">
            {heroLines.length > 1 ? (
              <>
                <span className="fi2t-page-hero__title-kicker">{heroLines[0]}</span>
                <span className="fi2t-page-hero__title-main">{heroLines.slice(1).join(' ')}</span>
              </>
            ) : (
              heroFallback
            )}
          </h1>
        )}
        {!bakeHero && <span className="fi2t-page-hero__accent" aria-hidden="true" />}
      </div>
    </section>
  )
}

function OptionalField({
  show,
  children,
}: {
  show: boolean
  children: ReactNode
}) {
  if (!show) return null
  return <>{children}</>
}

function AddArticleSectionButton({ slug }: { slug: string }) {
  const { value: raw, update } = useContentBlock('actualites', 'grid.items', {
    type: 'json',
    label: 'Grille — Articles',
    fallback: ACTUALITES_DEFAULTS['grid.items'],
  })
  const articles = parseArticles(raw, parseArticles(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES))

  const addSection = () => {
    const next = articles.map((item) => {
      if (item.slug !== slug) return item
      const sections = [...(item.sections ?? []), { question: 'Nouvelle question', answer: 'Réponse…' }]
      return { ...item, sections }
    })
    update(JSON.stringify(next))
  }

  return (
    <button type="button" className="cms-add-article-btn cms-add-article-btn--section" onClick={addSection}>
      <i className="fa-solid fa-plus" aria-hidden />
      Ajouter une section Q&R
    </button>
  )
}

function ArticleSection({
  article,
  index,
  question,
  answer,
  open,
  onToggle,
  alwaysOpen,
}: {
  article: ArticleItem
  index: number
  question: string
  answer: string
  open: boolean
  onToggle: () => void
  alwaysOpen: boolean
}) {
  const expanded = alwaysOpen || open

  return (
    <section className={`fi2t-article__section${expanded ? ' is-open' : ''}`}>
      {alwaysOpen ? (
        <EditableArticleField
          slug={article.slug}
          field={`sections.${index}.question`}
          as="h3"
          label={`Section ${index + 1} — Question`}
          fallback={question}
        />
      ) : (
        <button
          type="button"
          className="fi2t-article__q-btn"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <h3>{question}</h3>
          <span className="fi2t-article__q-chevron" aria-hidden="true">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      )}
      <div className="fi2t-article__answer-wrap" hidden={!expanded}>
        <EditableArticleField
          slug={article.slug}
          field={`sections.${index}.answer`}
          as="div"
          multiline
          label={`Section ${index + 1} — Réponse`}
          fallback={alwaysOpen ? answer : flattenArticleText(answer)}
        />
      </div>
    </section>
  )
}

function ArticleBody({ article }: { article: ArticleItem }) {
  const { t } = useTranslation()
  const { isEditMode } = useEditMode()
  const hasSections = Boolean(article.sections?.length)
  const sectionCount = article.sections?.length ?? 0
  /* Closed by default — click to expand/collapse. */
  const [openSections, setOpenSections] = useState<boolean[]>(() =>
    Array.from({ length: Math.max(sectionCount, 3) }, () => false),
  )

  useEffect(() => {
    setOpenSections((prev) => {
      if (prev.length >= sectionCount) return prev
      return [
        ...prev,
        ...Array.from({ length: sectionCount - prev.length }, () => true),
      ]
    })
  }, [sectionCount])

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const allExpanded =
    !hasSections ||
    isEditMode ||
    (hasSections && article.sections!.every((_, i) => openSections[i] ?? false))

  return (
    <article className={`fi2t-article${allExpanded ? ' fi2t-article--expanded' : ''}`}>
      <Link to="/actualites" className="fi2t-article__back">
        ← {t('fi2t.ui.back_news')}
      </Link>

      <div
        className={[
          'fi2t-article__featured',
          !isEditMode && article.slug === BAKED_HERO_SLUG ? 'fi2t-article__featured--baked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          !isEditMode && article.slug === BAKED_HERO_SLUG
            ? ({
                ['--article-feat-face' as string]: "url('/images/article-featured-walid.png?v=2')",
              } as CSSProperties)
            : undefined
        }
      >
        <EditableArticleField
          slug={article.slug}
          field="img"
          image
          className="fi2t-article__featured-img"
          label="Article — Image"
          fallback={article.img}
        />
      </div>

      <header className="fi2t-article__header">
        <EditableArticleField
          slug={article.slug}
          field="title"
          as="h2"
          label="Article — Titre"
          fallback={article.title}
        />
        <OptionalField show={isEditMode || Boolean(article.subtitle)}>
          <EditableArticleField
            slug={article.slug}
            field="subtitle"
            as="p"
            className="fi2t-article__subtitle"
            label="Article — Sous-titre"
            fallback={article.subtitle ?? ''}
          />
        </OptionalField>
        <OptionalField show={isEditMode || Boolean(article.quote)}>
          <EditableArticleField
            slug={article.slug}
            field="quote"
            as="blockquote"
            className="fi2t-article__quote"
            multiline
            label="Article — Citation"
            fallback={article.quote ?? ''}
          />
          {(isEditMode || Boolean(article.quote)) && <hr className="fi2t-article__divider" />}
        </OptionalField>
        <OptionalField show={isEditMode || Boolean(article.intro)}>
          <EditableArticleField
            slug={article.slug}
            field="intro"
            as="p"
            className="fi2t-article__intro"
            multiline
            label="Article — Intro"
            fallback={article.intro ?? ''}
          />
        </OptionalField>
      </header>

      <div className="fi2t-article__body">
        {hasSections ? (
          article.sections!.map((section, index) => (
            <ArticleSection
              key={`${section.question}-${index}`}
              article={article}
              index={index}
              question={section.question}
              answer={section.answer}
              open={openSections[index] ?? true}
              onToggle={() => toggleSection(index)}
              alwaysOpen={isEditMode}
            />
          ))
        ) : (
          <>
            <EditableArticleField
              slug={article.slug}
              field="date"
              as="time"
              className="fi2t-article__date"
              label="Article — Date"
              fallback={article.date}
            />
            <EditableArticleField
              slug={article.slug}
              field="desc"
              as="p"
              multiline
              label="Article — Texte"
              fallback={article.desc}
            />
          </>
        )}
        {isEditMode && <AddArticleSectionButton slug={article.slug} />}
      </div>

      <OptionalField show={isEditMode || Boolean(article.source)}>
        <hr className="fi2t-article__divider fi2t-article__divider--source" />
        <EditableArticleField
          slug={article.slug}
          field="source"
          as="p"
          className="fi2t-article__source"
          label="Article — Source"
          fallback={article.source ?? ''}
        />
      </OptionalField>
    </article>
  )
}

function ArticleInner() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { get } = useContent()

  const cmsArticles = parseArticles(
    get('grid.items', '[]'),
    parseArticles(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES),
  )
  const defaultsArticles = parseArticles(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES)

  const article = mergeArticleDetail(
    findArticleBySlug(cmsArticles, slug),
    findArticleBySlug(defaultsArticles, slug),
  )

  if (!article) {
    return <Navigate to="/actualites" replace />
  }

  return (
    <div className="fi2t-article-page">
      <ArticleHero article={article} />
      <ArticleBody article={article} />
    </div>
  )
}

export default function Fi2tArticlePage() {
  return (
    <ContentProvider page="actualites">
      <ArticleInner />
      <EditToolbar />
    </ContentProvider>
  )
}
