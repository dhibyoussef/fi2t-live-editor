import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { EditModeProvider, useEditMode } from './cms/EditModeProvider'
import { BuilderPreviewProvider } from './cms/BuilderPreviewProvider'
import Layout from './components/layout/Layout'
import Fi2tHomePage from './pages/Fi2tHomePage'
import CmsDynamicPage from './pages/CmsDynamicPage'
import ContactPage from './pages/Fi2tContactPage'
import Fi2tArticlePage from './pages/Fi2tArticlePage'
import Fi2tActualitesPage from './pages/Fi2tActualitesPage'
import Fi2tOrganisationPage from './pages/Fi2tOrganisationPage'
import Fi2tQuiSommesNousPage from './pages/Fi2tQuiSommesNousPage'
import Fi2tFicheAdhesionPage from './pages/Fi2tFicheAdhesionPage'
import Fi2tGroupementPage from './pages/Fi2tGroupementPage'
import { isGroupementSlug } from './cms/defaults/groupements-index'
import { GROUPEMENT_REDIRECTS } from './lib/groupements'
import { syncTranslationsFromDB } from './i18n/syncFromDB'

function EditModeBodyClass() {
  const { isEditMode } = useEditMode()
  useEffect(() => {
    document.body.classList.toggle('cms-edit-active', isEditMode)
    return () => document.body.classList.remove('cms-edit-active')
  }, [isEditMode])
  return null
}

function I18nSync() {
  useEffect(() => {
    void syncTranslationsFromDB()
  }, [])
  return null
}

function GroupementOrDynamic() {
  const { slug = '' } = useParams<{ slug: string }>()
  const redirectTo = GROUPEMENT_REDIRECTS[slug]
  if (redirectTo) return <Navigate to={`/${redirectTo}`} replace />
  if (isGroupementSlug(slug)) return <Fi2tGroupementPage />
  return <CmsDynamicPage />
}

export default function App() {
  return (
    <EditModeProvider>
      <BuilderPreviewProvider>
        <EditModeBodyClass />
        <I18nSync />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Fi2tHomePage />} />
              <Route path="/qui-sommes-nous" element={<Fi2tQuiSommesNousPage />} />
              <Route path="/organisation" element={<Fi2tOrganisationPage />} />
              <Route path="/actualites" element={<Fi2tActualitesPage />} />
              <Route path="/actualites/:slug" element={<Fi2tArticlePage />} />
              <Route path="/fiche-adhesion" element={<Fi2tFicheAdhesionPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/:slug" element={<GroupementOrDynamic />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BuilderPreviewProvider>
    </EditModeProvider>
  )
}
