import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteHeader from '../components/layout/SiteHeader'
import CmsSectionView, { type CmsSectionData } from '../components/cms/CmsSectionView'
import { ContentProvider } from '../cms/ContentProvider'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
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
      document.title = page.meta_title || `${page.title} — Golden Carthage`
    }
  }, [page])

  if (slug === 'home') return <Navigate to="/" replace />
  if (STATIC_SLUGS.has(slug)) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="cms-dyn-loading">
        <div className="cms-dyn-spinner" />
      </div>
    )
  }

  if (error === 'notfound') {
    return (
      <>
        <SiteHeader variant="page" />
        <div className="cms-dyn-empty">
          <h1>Page introuvable</h1>
          <p>La page <code>/{slug}</code> n'existe pas.</p>
          <a href="/" className="btn-gold">Retour à l'accueil</a>
        </div>
      </>
    )
  }

  if (error === 'draft' && !isEditMode) {
    return (
      <>
        <SiteHeader variant="page" />
        <div className="cms-dyn-empty">
          <h1>Page en brouillon</h1>
          <p>Cette page n'est pas encore publiée. Publiez-la depuis le backoffice (Contenu du site → Paramètres → Publié).</p>
        </div>
      </>
    )
  }

  return (
    <ContentProvider page={slug}>
      <SiteHeader variant="page" />

      {page && !sections.some(s => s.pattern === 'hero') && (
        <div className="cms-dyn-page-title">
          <div className="container">
            <h1>{page.title}</h1>
          </div>
        </div>
      )}

      {error === 'empty' && (
        <div className="cms-dyn-empty cms-dyn-empty--inline">
          <p>Cette page est publiée mais ne contient pas encore de blocs.</p>
          {isEditMode && <p>Utilisez le backoffice → <strong>Contenu du site</strong> → <strong>Ajouter un bloc</strong>.</p>}
        </div>
      )}

      {sections.map((sec, i) => (
        <CmsSectionView key={sec.slug} page={slug} section={sec} index={i} />
      ))}

      <EditToolbar />
    </ContentProvider>
  )
}
