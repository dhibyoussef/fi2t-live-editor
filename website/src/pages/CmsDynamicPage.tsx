import { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CmsSectionView, { type CmsSectionData } from '../components/cms/CmsSectionView'
import { ContentProvider } from '../cms/ContentProvider'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import Fi2tNotFoundPage from './Fi2tNotFoundPage'
import api from '../api/client'
import '../styles/cms-dynamic.css'

interface PageData {
  slug: string
  title: string
  status: string
  template: string
  meta_title?: string
  meta_description?: string
}

const STATIC_SLUGS = new Set(['home', 'global'])

export default function CmsDynamicPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const { isEditMode } = useEditMode()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<PageData | null>(null)
  const [sections, setSections] = useState<CmsSectionData[]>([])
  const [error, setError] = useState<'notfound' | 'draft' | 'empty' | null>(null)

  const locale = (i18n.language || 'fr').split('-')[0]

  useEffect(() => {
    if (!slug || STATIC_SLUGS.has(slug)) return

    setLoading(true)
    setError(null)

    api.get(`/pages/${slug}`, { params: { locale } })
      .then(({ data }) => {
        setPage(data.page)
        setSections(data.sections ?? [])
        if (!data.sections?.length) setError('empty')
      })
      .catch((err) => {
        const status = err.response?.status
        if (status === 403) setError('draft')
        else setError('notfound')
      })
      .finally(() => setLoading(false))
  }, [slug, locale, isEditMode])

  useEffect(() => {
    if (page?.meta_title || page?.title) {
      document.title = page.meta_title || `${page.title} — FI2T`
    } else if (error === 'notfound') {
      document.title = 'Page introuvable — FI2T'
    }
  }, [page, error])

  if (slug === 'home') return <Navigate to="/" replace />
  if (STATIC_SLUGS.has(slug)) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="fi2t-notfound fi2t-notfound--loading" aria-busy="true">
        <div className="fi2t-notfound__spinner" />
      </div>
    )
  }

  if (error === 'notfound') {
    return <Fi2tNotFoundPage slug={slug} variant="notfound" />
  }

  if (error === 'draft' && !isEditMode) {
    return <Fi2tNotFoundPage slug={slug} variant="draft" />
  }

  return (
    <ContentProvider page={slug}>
      {page && !sections.some((s) => s.pattern === 'hero') && (
        <div className="cms-dyn-page-title cms-dyn-page-title--fi2t">
          <div className="container">
            <h1>{page.title}</h1>
          </div>
        </div>
      )}

      {error === 'empty' && (
        <div className="fi2t-notfound fi2t-notfound--inline">
          <p>Cette page est publiée mais ne contient pas encore de blocs.</p>
          {isEditMode && (
            <p>
              Utilisez le backoffice → <strong>Contenu du site</strong> → <strong>Ajouter un bloc</strong>.
            </p>
          )}
          {!isEditMode && (
            <Link to="/" className="fi2t-notfound__btn fi2t-notfound__btn--primary">
              Retour à l’accueil
            </Link>
          )}
        </div>
      )}

      {sections.map((sec, i) => (
        <CmsSectionView key={sec.slug} page={slug} section={sec} index={i} />
      ))}

      <EditToolbar />
    </ContentProvider>
  )
}
