import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useTranslation } from 'react-i18next'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'nav.dashboard', subtitle: 'Vue d’ensemble du CMS FI2T' },
  '/website-content': { title: 'nav.website_content', subtitle: 'Pages, sections et blocs éditables' },
  '/users': { title: 'nav.users', subtitle: 'Comptes administrateurs' },
  '/roles': { title: 'nav.roles', subtitle: 'Rôles & permissions' },
}

export function AppLayout() {
  const location = useLocation()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const meta = PAGE_TITLES[location.pathname]

  return (
    <div className={`gc-shell${collapsed ? ' gc-shell--collapsed-collapsed' : ''}`}>
      <div className={`gc-sidebar-wrap${collapsed ? ' collapsed' : ''}`}>
        <Sidebar collapsed={collapsed} />
      </div>

      <button
        type="button"
        className={`gc-toggle-btn${collapsed ? ' gc-toggle-btn--collapsed' : ''}`}
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
        title={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
      >
        {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
      </button>

      <div className="gc-main-wrap">
        <TopBar
          pageTitle={meta ? t(meta.title) : undefined}
          pageSubtitle={meta?.subtitle}
        />

        <main className="gc-page">
          <div className="gc-page-inner animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
