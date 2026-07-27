import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from '../cms/defaults/actualites'
import { findArticleBySlug, parseArticles, type ArticleItem } from '../lib/articles'

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}

function ArticleHero({ article }: { article: ArticleItem }) {
  const heroLines = (article.hero_title ?? article.title).split('\n')

  return (
    <section className="fi2t-page-hero fi2t-page-hero--article">
      <EditableImage
        page="actualites"
        blockKey="hero.image"
        className="fi2t-page-hero__bg"
        alt=""
        fallback="/hero.jpg"
      />
      <div className="fi2t-page-hero__overlay" />
      <div className="fi2t-page-hero__content">
        <h1 className="fi2t-page-hero__title fi2t-page-hero__title--article">
          {heroLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <span className="fi2t-page-hero__accent" aria-hidden="true" />
      </div>
    </section>
  )
}

function ArticleBody({ article }: { article: ArticleItem }) {
  const { t } = useTranslation()
  const hasSections = Boolean(article.sections?.length)

  return (
    <article className="fi2t-article">
      <div className="fi2t-article__featured">
        <img src={article.img} alt={article.title} />
      </div>

      <header className="fi2t-article__header">
        <h2>{article.title}</h2>
        {article.subtitle && <p className="fi2t-article__subtitle">{article.subtitle}</p>}
        {article.quote && (
          <>
            <blockquote className="fi2t-article__quote">{article.quote}</blockquote>
            <hr className="fi2t-article__divider" />
          </>
        )}
        {article.intro && <p className="fi2t-article__intro">{article.intro}</p>}
      </header>

      <div className="fi2t-article__body">
        {hasSections ? (
          article.sections!.map((section) => (
            <section key={section.question} className="fi2t-article__section">
              <h3>{section.question}</h3>
              {splitParagraphs(section.answer).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))
        ) : (
          <>
            <time className="fi2t-article__date">{article.date}</time>
            <p>{article.desc}</p>
          </>
        )}
      </div>

      {article.source && <p className="fi2t-article__source">{article.source}</p>}

      <Link to="/actualites" className="fi2t-article__back">
        ← {t('fi2t.ui.back_news')}
      </Link>
    </article>
  )
}

function ArticleInner() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { get } = useContent()

  const articles = parseArticles(
    get('grid.items', '[]'),
    parseArticles(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES),
  )

  const article = findArticleBySlug(articles, slug)

  if (!article) {
    return <Navigate to="/actualites" replace />
  }

  return (
    <div className="fi2t-article-page">
      <ArticleHero article={article} />
      <div className="fi2t-section">
        <ArticleBody article={article} />
      </div>
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
