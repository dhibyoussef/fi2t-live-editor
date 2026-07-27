import { lazy, Suspense, useEffect } from 'react'
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

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="gc-spinner" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function I18nSync() {
  const { token } = useAuthStore()
  useEffect(() => {
    if (token) syncTranslationsFromDB()
  }, [token])
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <I18nSync />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/website-content" element={<WebsiteContentPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />
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
