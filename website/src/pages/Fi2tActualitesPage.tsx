import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import { useEditMode } from '../cms/EditModeProvider'
import EditableText from '../cms/EditableText'
import EditableHeroBackground from '../cms/EditableHeroBackground'
import EditableJsonList from '../cms/EditableJsonList'
import AddArticleButton from '../cms/AddArticleButton'
import EditToolbar from '../cms/EditToolbar'
import Fi2tPagination, { padItemsForPages } from '../components/fi2t/Fi2tPagination'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from '../cms/defaults/actualites'
import { createEmptyArticle, type ArticleItem } from '../lib/articles'

type NewsItem = {
  slug: string
  title: string
  desc: string
  date: string
  img: string
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

const NEWS_FALLBACK = parseJsonArray<NewsItem>(
  ACTUALITES_DEFAULTS['grid.items'],
  ACTUALITES_ARTICLES.map(({ slug, title, desc, date, img }) => ({ slug, title, desc, date, img })),
)

function ActualitesInner() {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const [page, setPage] = useState(1)

  const rawArticles = parseJsonArray<NewsItem>(
    get('grid.items', ACTUALITES_DEFAULTS['grid.items']),
    NEWS_FALLBACK,
  )

  const perPage = Math.max(1, Number.parseInt(get('grid.per_page', '9'), 10) || 9)
  const articles = useMemo(
    () => (isEditMode ? rawArticles : padItemsForPages(rawArticles, perPage, 6)),
    [rawArticles, perPage, isEditMode],
  )
  const totalPages = Math.max(1, Math.ceil(articles.length / perPage))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageStart = (safePage - 1) * perPage
  const pageEnd = pageStart + perPage

  return (
    <div className="fi2t-actu-page">
      <section className="fi2t-page-hero fi2t-page-hero--actu" data-cms-section="hero">
        <EditableHeroBackground
          page="actualites"
          fallback="/images/actualites-banner.jpg?v=2"
        />
        <div className="fi2t-page-hero__overlay" aria-hidden="true" />
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

      <AddArticleButton />

      <section className="fi2t-actu-grid" data-cms-section="grid">
        <EditableJsonList<NewsItem>
          page="actualites"
          blockKey="grid.items"
          label="Articles"
          manageLabel="Gérer les articles"
          className="fi2t-actu-grid__inner"
          fallback={NEWS_FALLBACK}
          emptyItem={(items) =>
            createEmptyArticle(items as unknown as ArticleItem[]) as unknown as NewsItem
          }
          addLabel="Ajouter un article"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Extrait', multiline: true },
            { key: 'date', label: 'Date' },
            { key: 'slug', label: 'Slug (URL)' },
            { key: 'img', label: 'Image carte', image: true },
          ]}
          itemClassName={(_item, index) =>
            (!isEditMode && (index < pageStart || index >= pageEnd) ? 'is-page-hidden' : '')
          }
          transform={(items) => (isEditMode ? items : padItemsForPages(items, perPage, 6))}
          renderItem={(item, _index, { editable, editField, editImage }) => {
            const narrow = /houssem/i.test(item.title) || /houssem/i.test(item.slug)
            const secteur = /secteur touristique/i.test(item.title)
            const cardClass = [
              'fi2t-actu-card',
              narrow ? 'fi2t-actu-card--narrow' : '',
              secteur ? 'fi2t-actu-card--secteur' : '',
            ].filter(Boolean).join(' ')
            const body = (
              <>
                {editImage('img', 'fi2t-actu-card__img', '')}
                <div className="fi2t-actu-card__body">
                  {editField('title', 'h3')}
                  {editField('desc', 'p')}
                  {editField('date', 'time')}
                </div>
              </>
            )

            if (editable || !item.slug) {
              return (
                <article className={cardClass}>
                  {body}
                  {editable && item.slug ? (
                    <Link
                      to={`/actualites/${item.slug}`}
                      className="fi2t-actu-card__edit-link"
                      data-cms-allow-nav
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ouvrir l’article →
                    </Link>
                  ) : null}
                </article>
              )
            }

            return (
              <article className={cardClass}>
                <Link to={`/actualites/${item.slug}`} className="fi2t-actu-card__link">
                  {body}
                </Link>
              </article>
            )
          }}
        />

        {!isEditMode && (
          <Fi2tPagination
            page={safePage}
            totalPages={totalPages}
            onPage={setPage}
            ariaLabel="Pagination des actualités"
          />
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
