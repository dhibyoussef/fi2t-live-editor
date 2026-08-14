import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './i18n'
import { useAuthStore } from './store/authStore'
import { AppLayout } from './components/layout/AppLayout'
import { syncTranslationsFromDB } from './i18n/syncFromDB'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/Fi2tDashboardPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const RolesPage = lazy(() => import('./pages/users/RolesPage'))
const WebsiteContentPage = lazy(() => import('./pages/content/WebsiteContentPage'))
const ArticlesAdminPage = lazy(() => import('./pages/content/ArticlesAdminPage'))
const TranslationsPage = lazy(() => import('./pages/translations/TranslationsPage'))
const FormulairesAdminPage = lazy(() => import('./pages/forms/FormulairesAdminPage'))

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="gc-spinner" />
    </div>
  )
}

function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}

/** Requires login — everything except /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((s) => s.token)

  if (!hydrated) return <PageLoader />
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Login only when logged out */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((s) => s.token)

  if (!hydrated) return <PageLoader />
  if (token) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function I18nSync() {
  const token = useAuthStore((s) => s.token)
  useEffect(() => {
    if (token) syncTranslationsFromDB()
  }, [token])
  return null
}

/** Vite `base` — `/` locally, `/admin/` in Docker single-domain deploy. */
const routerBasename = (() => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return base || undefined
})()

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter basename={routerBasename}>
        <I18nSync />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={(
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              )}
            />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/website-content" element={<WebsiteContentPage />} />
              <Route path="/articles" element={<ArticlesAdminPage />} />
              <Route path="/translations" element={<TranslationsPage />} />
              <Route path="/formulaires" element={<FormulairesAdminPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: "'Montserrat Alternates', system-ui, sans-serif", fontSize: '13px', background: '#fff', border: '0.5px solid rgba(197,198,210,0.45)', color: '#001E40' },
        success: { iconTheme: { primary: '#00A98D', secondary: '#fff' } },
        error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
      }} />
    </QueryClientProvider>
  )
}
