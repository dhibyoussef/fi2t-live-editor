import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from '../cms/defaults/actualites'

type NewsItem = {
  slug?: string
  title: string
  desc: string
  date: string
  img: string
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function buildPagination(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let page = start; page <= end; page += 1) pages.push(page)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

function ActualitesInner() {
  const { get } = useContent()
  const [page, setPage] = useState(1)

  const articles = parseJsonArray<NewsItem>(
    get('grid.items', '[]'),
    parseJsonArray(ACTUALITES_DEFAULTS['grid.items'], ACTUALITES_ARTICLES),
  )

  const perPage = Math.max(1, Number.parseInt(get('grid.per_page', '9'), 10) || 9)
  const totalPages = Math.max(1, Math.ceil(articles.length / perPage))
  const safePage = Math.min(page, totalPages)

  const visibleArticles = useMemo(() => {
    const start = (safePage - 1) * perPage
    return articles.slice(start, start + perPage)
  }, [articles, perPage, safePage])

  const pagination = buildPagination(safePage, totalPages)

  return (
    <div className="fi2t-actu-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page="actualites"
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page="actualites"
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback="Actualités"
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-section fi2t-actu-grid">
        <div className="fi2t-actu-grid__inner">
          {visibleArticles.map((item) => (
            <article key={`${item.slug ?? item.title}-${item.date}`} className="fi2t-actu-card">
              <Link to={item.slug ? `/actualites/${item.slug}` : '#'} className="fi2t-actu-card__link">
                <img src={item.img} alt={item.title} />
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.desc}</p>
                  <time>{item.date}</time>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="fi2t-actu-pagination" aria-label="Pagination des actualités">
            <button
              type="button"
              className="fi2t-actu-pagination__btn"
              aria-label="Page précédente"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {pagination.map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="fi2t-actu-pagination__ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`fi2t-actu-pagination__btn${item === safePage ? ' is-active' : ''}`}
                  aria-current={item === safePage ? 'page' : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className="fi2t-actu-pagination__btn"
              aria-label="Page suivante"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}

export default function Fi2tActualitesPage() {
  return (
    <ContentProvider page="actualites">
      <ActualitesInner />
      <EditToolbar />
    </ContentProvider>
  )
}
